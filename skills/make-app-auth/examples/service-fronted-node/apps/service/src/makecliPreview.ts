import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const GATEWAY_PATH = '/api/make';
const DEFAULT_PROFILE = 'default';

type IniSections = Record<string, Record<string, string>>;

type PreviewContext = {
  profile: string;
  environment: string;
  gatewayBaseUrl: string;
  accessToken: string;
  claims: Record<string, unknown>;
  tenantId?: string;
  operatorId?: string;
};

type MakecliResolveResult = {
  profile?: string;
  environment?: string;
  make_api_origin?: string;
  tenant_id?: string;
  operator_id?: string;
};

export function isLocalPreviewEnabled(): boolean {
  return process.env.MAKE_APP_LOCAL_PREVIEW === 'true';
}

export function loadLocalPreviewContext(): PreviewContext {
  assertLocalPreviewAllowed();
  const profile = process.env.MAKE_PROFILE || process.env.MAKECLI_PROFILE || DEFAULT_PROFILE;
  const credentials = parseIni(readMakecliFile('credentials'));
  const config = parseIni(readMakecliFile('config'));
  const accessToken = credentials[profile]?.access_token;
  if (!accessToken) {
    throw new Error(`makecli profile ${profile} 未登录，请先运行 makecli login`);
  }

  const resolved = resolveMakecliLocalPreview(profile);
  const profileConfig = config[profile] ?? {};
  const environment = resolved?.environment || process.env.MAKE_ENV || config.settings?.environment || 'unknown';
  const gatewayOrigin = resolved?.make_api_origin || profileConfig['meta-server-url'];
  if (!gatewayOrigin) {
    throw new Error('无法解析 Make local preview gateway origin，请升级 makecli 后运行 makecli configure resolve --target local-preview --output=json，或为旧版 makecli 配置 profile meta-server-url');
  }

  return {
    profile,
    environment,
    gatewayBaseUrl: withGateway(gatewayOrigin),
    accessToken,
    claims: parseJwtClaims(accessToken),
    tenantId: resolved?.tenant_id || profileConfig['X-Tenant-ID'],
    operatorId: resolved?.operator_id || profileConfig['X-Operator-ID']
  };
}

export function localPreviewCurrentContext(): Response {
  const context = loadLocalPreviewContext();
  const tenantId = context.tenantId || claimText(context.claims, 'tenantId', 'tenant_id', 'orgId', 'org_id');
  const userId = context.operatorId
    || claimText(context.claims, 'userId', 'user_id', 'uid', 'sub', 'id')
    || context.profile;
  return jsonResponse({
    code: 200,
    msg: 'ok',
    data: {
      userId,
      tenantId,
      appId: process.env.MAKE_APP_ID || process.env.MAKE_APP_KEY || '',
      env: context.environment,
      roles: ['local_preview'],
      permissions: ['make:resources'],
      grantVersion: 'local-preview',
      name: claimText(context.claims, 'name', 'userName', 'user_name', 'username', 'nickname') || context.profile,
      avatar: claimText(context.claims, 'avatar', 'avatarUrl', 'avatar_url', 'avatarOrigin'),
      authMode: 'token',
      tokenSource: 'makecli',
      localPreview: true
    }
  });
}

export function localPreviewRuntimeView(): Response {
  const context = loadLocalPreviewContext();
  return jsonResponse({
    code: 200,
    msg: 'ok',
    data: {
      appId: process.env.MAKE_APP_ID || process.env.MAKE_APP_KEY || '',
      environment: context.environment,
      roles: ['local_preview'],
      permissions: ['make:resources'],
      grantVersion: 'local-preview',
      authMode: 'token',
      tokenSource: 'makecli',
      localPreview: true
    }
  });
}

export function applyLocalPreviewAuthorization(headers: Headers, context: PreviewContext): void {
  headers.set('authorization', `Bearer ${context.accessToken}`);
  if (context.tenantId) {
    headers.set('x-tenant-id', context.tenantId);
  }
  if (context.operatorId) {
    headers.set('x-operator-id', context.operatorId);
  }
}

function assertLocalPreviewAllowed(): void {
  if (process.env.NODE_ENV === 'production' || process.env.MAKE_APP_ENV === 'production') {
    throw new Error('MAKE_APP_LOCAL_PREVIEW 只允许本地开发环境使用');
  }
}

function readMakecliFile(name: 'credentials' | 'config'): string {
  const dir = process.env.MAKE_CLI_CONFIG_DIR || `${homedir()}/.make`;
  try {
    return readFileSync(`${dir}/${name}`, 'utf8');
  } catch {
    return '';
  }
}

function resolveMakecliLocalPreview(profile: string): MakecliResolveResult | undefined {
  const args = ['--profile', profile];
  if (process.env.MAKE_ENV) {
    args.push('--env', process.env.MAKE_ENV);
  }
  args.push('configure', 'resolve', '--target', 'local-preview', '--output=json');

  try {
    const output = execFileSync('makecli', args, {
      encoding: 'utf8',
      env: process.env,
      stdio: ['ignore', 'pipe', 'ignore']
    });
    const parsed = JSON.parse(output) as MakecliResolveResult;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function parseIni(text: string): IniSections {
  const sections: IniSections = {};
  let current = '';
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || line.startsWith(';')) {
      continue;
    }
    if (line.startsWith('[') && line.endsWith(']')) {
      current = line.slice(1, -1).trim();
      sections[current] ??= {};
      continue;
    }
    if (!current) {
      continue;
    }
    const splitIndex = line.indexOf('=');
    if (splitIndex < 0) {
      continue;
    }
    sections[current][line.slice(0, splitIndex).trim()] = line.slice(splitIndex + 1).trim();
  }
  return sections;
}

function withGateway(origin: string): string {
  const normalized = origin.replace(/\/+$/, '');
  return normalized.endsWith(GATEWAY_PATH) ? normalized : `${normalized}${GATEWAY_PATH}`;
}

function parseJwtClaims(token: string): Record<string, unknown> {
  const payload = token.split('.')[1];
  if (!payload || typeof globalThis.atob !== 'function') {
    return {};
  }
  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const decoded = decodeURIComponent(Array.from(globalThis.atob(padded), (char) =>
      `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`
    ).join(''));
    const parsed = JSON.parse(decoded);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function claimText(claims: Record<string, unknown>, ...names: string[]): string | undefined {
  for (const name of names) {
    const value = claims[name];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return undefined;
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' }
  });
}
