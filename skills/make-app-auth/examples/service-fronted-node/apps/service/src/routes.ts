import { proxyMakeAuth, proxyMakeBusiness } from './makeGatewayProxy';
import { isLocalPreviewEnabled, localPreviewCurrentContext, localPreviewRuntimeView } from './makecliPreview';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (isLocalPreviewEnabled() && url.pathname === '/api/make/auth/current-context') {
    return localPreviewCurrentContext();
  }
  if (isLocalPreviewEnabled() && url.pathname === '/api/make/auth/runtime-view') {
    return localPreviewRuntimeView();
  }
  if (url.pathname.startsWith('/api/make/auth/')) {
    return proxyMakeAuth(request, stripBrowserMakePrefix(url));
  }
  if (url.pathname.startsWith('/api/make/oauth/')) {
    return proxyMakeAuth(request, stripBrowserMakePrefix(url));
  }
  if (url.pathname === '/api/make/app/schema') {
    return proxyMakeBusiness(request, '/meta/schema');
  }
  if (url.pathname.startsWith('/api/make/app/records/')) {
    return proxyMakeBusiness(request, '/data/v1/record');
  }
  if (url.pathname === '/api/make/app/users') {
    return proxyMakeBusiness(request, '/meta/users');
  }
  if (url.pathname === '/api/make/app/departments') {
    return proxyMakeBusiness(request, '/meta/departments');
  }
  if (url.pathname.startsWith('/api/make/')) {
    return new Response('SERVICE_ROUTE_NOT_REGISTERED', { status: 404 });
  }
  return new Response('Not found', { status: 404 });
}

function stripBrowserMakePrefix(url: URL): string {
  return `${url.pathname.replace('/api/make', '')}${url.search}`;
}
