import { proxyMakeAuth, proxyMakeBusiness } from './makeGatewayProxy';

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname.startsWith('/api/auth/')) {
    return proxyMakeAuth(request, url.pathname.replace('/api', ''));
  }
  if (url.pathname === '/api/app/schema') {
    return proxyMakeBusiness(request, '/meta/schema');
  }
  if (url.pathname.startsWith('/api/app/records/')) {
    return proxyMakeBusiness(request, '/data/v1/record');
  }
  if (url.pathname.startsWith('/api/app/')) {
    return proxyMakeBusiness(request, url.pathname.replace('/api/app', '/data'));
  }
  return new Response('Not found', { status: 404 });
}
