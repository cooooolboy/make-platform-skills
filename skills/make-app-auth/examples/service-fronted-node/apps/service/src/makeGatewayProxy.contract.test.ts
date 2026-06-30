import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { handleRequest } from './routes';

export async function testSessionCompleteProxyPreservesRedirectContract(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalPreview = process.env.MAKE_APP_LOCAL_PREVIEW;
  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  delete process.env.MAKE_APP_LOCAL_PREVIEW;

  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    capturedUrl = String(input);
    capturedInit = init;
    calls.push({ url: capturedUrl, init });
    if (capturedUrl.endsWith('/make/auth/current-context')) {
      return new Response(JSON.stringify({ status: 'redirecting' }), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
    const headers = new Headers();
    headers.set('location', 'https://demo-app.qtech.cn/home');
    headers.append('set-cookie', 'make_app_session=session-a; Path=/; HttpOnly');
    headers.append('set-cookie', 'make_app_csrf=csrf-a; Path=/');
    return new Response(null, { status: 302, headers });
  };

  try {
    const contextResponse = await handleRequest(new Request(
      'https://demo-app.qtech.cn/api/make/auth/current-context',
      {
        headers: {
          cookie: 'make_oauth_txn=txn-a',
          host: 'demo-app.qtech.cn'
        }
      }
    ));

    assert(contextResponse.status === 200, 'current context proxy must preserve gateway status');
    const contextPayload = await contextResponse.clone().json();
    assert(contextPayload.data?.localPreview !== true, 'published current-context must not return local preview context');
    const contextCall = calls[0];
    assert(contextCall.url.endsWith('/make/auth/current-context'), 'current context proxy must call internal make-gateway auth path');
    const contextHeaders = contextCall.init?.headers as Headers | undefined;
    assert(contextHeaders?.get('cookie') === 'make_oauth_txn=txn-a', 'current context proxy must forward browser Cookie');
    assert(contextHeaders?.get('x-forwarded-host') === 'demo-app.qtech.cn', 'current context proxy must derive X-Forwarded-Host from Host');
    assert(contextHeaders?.get('x-forwarded-proto') === 'https', 'current context proxy must add X-Forwarded-Proto');

    const response = await handleRequest(new Request(
      'https://demo-app.qtech.cn/api/make/auth/session/complete?login_ticket=ticket-a',
      {
        headers: {
          cookie: 'make_oauth_txn=txn-a',
          host: 'demo-app.qtech.cn'
        }
      }
    ));

    assert(response.status === 302, 'session complete must preserve gateway 302');
    assert(response.headers.get('location') === 'https://demo-app.qtech.cn/home', 'session complete must preserve Location');
    assert(response.headers.get('set-cookie')?.includes('make_app_session=session-a'), 'session complete must preserve Set-Cookie');
    assert(capturedUrl.endsWith('/make/auth/session/complete?login_ticket=ticket-a'), 'session complete proxy must call internal make-gateway auth path');
    assert(capturedInit?.redirect === 'manual', 'session complete proxy must use redirect: manual');

    const headers = capturedInit?.headers as Headers | undefined;
    assert(headers?.get('cookie') === 'make_oauth_txn=txn-a', 'session complete proxy must forward browser Cookie');
    assert(headers?.get('x-forwarded-host') === 'demo-app.qtech.cn', 'session complete proxy must derive X-Forwarded-Host from Host');
    assert(headers?.get('x-forwarded-proto') === 'https', 'session complete proxy must add X-Forwarded-Proto');
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv('MAKE_APP_LOCAL_PREVIEW', originalPreview);
  }
}

export async function testLocalPreviewUsesMakecliTokenServerSide(): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalPreview = process.env.MAKE_APP_LOCAL_PREVIEW;
  const originalConfigDir = process.env.MAKE_CLI_CONFIG_DIR;
  const originalProfile = process.env.MAKE_PROFILE;
  const configDir = mkdtempSync(`${tmpdir()}/make-app-preview-`);
  const claims = base64Url(JSON.stringify({
    userId: 'u-1001',
    tenantId: 't-2001',
    name: 'Local Preview User',
    avatar: 'https://avatar.example.com/u-1001.png'
  }));
  const token = `header.${claims}.signature`;
  let capturedHeaders: Headers | undefined;

  mkdirSync(configDir, { recursive: true });
  writeFileSync(`${configDir}/credentials`, `[default]\naccess_token = ${token}\n`);
  writeFileSync(`${configDir}/config`, [
    '[settings]',
    'environment = dev',
    '',
    '[default]',
    'meta-server-url = https://dev-make.qtech.cn',
    'X-Tenant-ID = t-config',
    'X-Operator-ID = u-config',
    ''
  ].join('\n'));

  process.env.MAKE_APP_LOCAL_PREVIEW = 'true';
  process.env.MAKE_CLI_CONFIG_DIR = configDir;
  process.env.MAKE_PROFILE = 'default';

  globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    capturedHeaders = init?.headers as Headers;
    return new Response(JSON.stringify({ code: 200, data: { ok: true } }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  };

  try {
    const contextResponse = await handleRequest(new Request(
      'http://127.0.0.1:3000/api/make/auth/current-context?return_url=http%3A%2F%2F127.0.0.1%3A3000%2F'
    ));
    const contextPayload = await contextResponse.json();
    assert(contextPayload.data.userId === 'u-config', 'local preview current-context should prefer makecli operator id');
    assert(contextPayload.data.tenantId === 't-config', 'local preview current-context should use makecli tenant id');
    assert(contextPayload.data.name === 'Local Preview User', 'local preview current-context should expose token claim display name when available');
    assert(contextPayload.data.localPreview === true, 'local preview current-context must be explicitly marked');

    const runtimeResponse = await handleRequest(new Request(
      'http://127.0.0.1:3000/api/make/auth/runtime-view'
    ));
    const runtimePayload = await runtimeResponse.json();
    assert(runtimePayload.data.authMode === 'token', 'local preview runtime-view should report token auth mode');
    assert(runtimePayload.data.localPreview === true, 'local preview runtime-view must be explicitly marked');

    const businessResponse = await handleRequest(new Request(
      'http://127.0.0.1:3000/api/make/app/records/todos',
      { method: 'POST', body: JSON.stringify({}) }
    ));
    assert(businessResponse.status === 200, 'local preview business request should reach gateway');
    assert(capturedHeaders?.get('authorization') === `Bearer ${token}`, 'Service should attach makecli token only on upstream request');
    assert(capturedHeaders?.get('x-tenant-id') === 't-config', 'Service should forward makecli tenant id on upstream request');
    assert(capturedHeaders?.get('x-operator-id') === 'u-config', 'Service should forward makecli operator id on upstream request');
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv('MAKE_APP_LOCAL_PREVIEW', originalPreview);
    restoreEnv('MAKE_CLI_CONFIG_DIR', originalConfigDir);
    restoreEnv('MAKE_PROFILE', originalProfile);
    rmSync(configDir, { recursive: true, force: true });
  }
}

function base64Url(value: string): string {
  return globalThis.btoa(value)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function restoreEnv(name: string, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[name];
    return;
  }
  process.env[name] = value;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
