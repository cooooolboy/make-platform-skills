const MAKE_API_BASE_URL = process.env.MAKE_API_BASE_URL ?? 'http://make-gateway/api/make';

export function applyForwardedHostContext(headers: Headers, source: Headers): void {
  if (!headers.get('x-forwarded-host')) {
    const host = source.get('host');
    if (host) {
      headers.set('x-forwarded-host', firstHeaderValue(host));
    }
  }
  if (!headers.get('x-forwarded-proto')) {
    headers.set('x-forwarded-proto', isLocalHost(headers.get('x-forwarded-host')) ? 'http' : 'https');
  }
}

function firstHeaderValue(value: string): string {
  const commaIndex = value.indexOf(',');
  return commaIndex >= 0 ? value.substring(0, commaIndex).trim() : value.trim();
}

function isLocalHost(host: string | null): boolean {
  return host === 'localhost' || host === '127.0.0.1';
}

export async function proxyMakeAuth(request: Request, pathname: string): Promise<Response> {
  const headers = pickProxyHeaders(request.headers, ['cookie', 'host', 'x-forwarded-host', 'x-forwarded-proto']);
  applyForwardedHostContext(headers, request.headers);
  const upstream = await fetch(`${MAKE_API_BASE_URL}${pathname}`, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual'
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers
  });
}

export async function proxyMakeBusiness(request: Request, pathname: string): Promise<Response> {
  const headers = pickProxyHeaders(request.headers, ['cookie', 'host', 'x-forwarded-host', 'x-forwarded-proto']);
  applyForwardedHostContext(headers, request.headers);
  const upstream = await fetch(`${MAKE_API_BASE_URL}${pathname}`, {
    method: request.method,
    headers,
    body: request.body
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers
  });
}

function pickProxyHeaders(source: Headers, names: string[]): Headers {
  const headers = new Headers();
  const cookie = source.get('cookie');
  if (cookie) {
    headers.set('cookie', cookie);
  }
  for (const name of names) {
    if (name === 'cookie') {
      continue;
    }
    const value = source.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return headers;
}
