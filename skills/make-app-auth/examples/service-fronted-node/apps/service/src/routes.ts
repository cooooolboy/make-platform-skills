import { proxyMakeAuth, proxyMakeBusiness } from './makeGatewayProxy';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/make/auth/')) {
    return proxyMakeAuth(request, url.pathname.replace('/api', ''));
  }
  if (url.pathname.startsWith('/api/make/oauth/')) {
    return proxyMakeAuth(request, url.pathname.replace('/api', ''));
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
