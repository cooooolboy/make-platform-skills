import {
  applyLocalPreviewAuthorization,
  isLocalPreviewEnabled,
  localPreviewGatewayBaseUrl
} from './makecliPreview';

const MAKE_AUTH_BASE_URL = process.env.MAKE_AUTH_BASE_URL ?? 'http://make-gateway/make';
const MAKE_BUSINESS_BASE_URL = process.env.MAKE_BUSINESS_BASE_URL ?? 'http://make-gateway/make';

type HeadersWithSetCookieList = Headers & {
  getSetCookie?: () => string[];
};

export function applyForwardedHostContext(headers: Headers, source: Headers): void {
  const host = source.get('host');
  if (host) {
    headers.set('x-forwarded-host', firstHeaderValue(host));
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
  const hostname = stripPort(host);
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

function stripPort(host: string | null): string | null {
  if (!host) {
    return host;
  }
  const portIndex = host.indexOf(':');
  return portIndex >= 0 ? host.substring(0, portIndex) : host;
}

export async function proxyMakeAuth(request: Request, pathname: string): Promise<Response> {
  const headers = pickProxyHeaders(request.headers, ['cookie']);
  applyForwardedHostContext(headers, request.headers);
  const upstream = await fetch(`${MAKE_AUTH_BASE_URL}${pathname}`, {
    method: request.method,
    headers,
    body: request.body,
    redirect: 'manual'
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: copyGatewayResponseHeaders(upstream)
  });
}

export async function proxyMakeBusiness(request: Request, pathname: string): Promise<Response> {
  const headers = pickProxyHeaders(request.headers, ['cookie']);
  applyForwardedHostContext(headers, request.headers);
  const baseUrl = isLocalPreviewEnabled() ? localPreviewGatewayBaseUrl() : MAKE_BUSINESS_BASE_URL;
  if (isLocalPreviewEnabled()) {
    applyLocalPreviewAuthorization(headers);
  }
  const upstream = await fetch(`${baseUrl}${pathname}`, {
    method: request.method,
    headers,
    body: request.body
  });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: copyGatewayResponseHeaders(upstream)
  });
}

function copyGatewayResponseHeaders(upstream: Response): Headers {
  const headers = new Headers(upstream.headers);
  const setCookies = (upstream.headers as HeadersWithSetCookieList).getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    headers.delete('set-cookie');
    for (const cookie of setCookies) {
      headers.append('set-cookie', cookie);
    }
  }
  const location = upstream.headers.get('location');
  if (location) {
    headers.set('location', location);
  }
  return headers;
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
