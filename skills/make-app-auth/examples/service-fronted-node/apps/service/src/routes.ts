import { proxyMakeAuth, proxyMakeBusiness } from './makeGatewayProxy';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/make/auth/')) {
    return proxyMakeAuth(request, url.pathname.replace('/api/make', ''));
  }
  if (url.pathname === '/api/make/app/schema') {
    return proxyMakeBusiness(request, '/meta/schema');
  }
  if (url.pathname.startsWith('/api/make/app/records/')) {
    return proxyMakeBusiness(request, '/data/v1/record');
  }
  if (url.pathname.startsWith('/api/make/app/')) {
    return proxyMakeBusiness(request, url.pathname.replace('/api/make/app', '/data'));
  }
  return new Response('Not found', { status: 404 });
}
