import { createMakeAppAuth } from '@qfeius/make-app-auth';

export const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api',
  unifiedLogin: true,
  apiAuthRedirect: true
});

export async function initAuth(): Promise<'ready' | 'waiting' | 'expired'> {
  const result = await auth.init({ redirect: true });
  if (result.status === 'ready') {
    return 'ready';
  }
  if (result.status === 'redirecting') {
    return 'waiting';
  }
  if (result.reason === 'state_expired' || result.reason === 'challenge_expired') {
    return 'expired';
  }
  return 'waiting';
}

export async function relogin(): Promise<void> {
  await auth.login({ redirect: true });
}
