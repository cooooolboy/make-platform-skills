import { createMakeAppAuth } from '@qfeius/make-app-auth';

export const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
  unifiedLogin: true,
  apiAuthRedirect: true
});

export async function initAuth(): Promise<'ready' | 'waiting' | 'expired'> {
  const result = await auth.init({ redirect: true });
  if (result.status === 'authenticated') {
    return 'ready';
  }
  if (result.status === 'redirecting') {
    return 'waiting';
  }
  const reason = 'reason' in result ? result.reason : undefined;
  if (reason === 'state_expired' || reason === 'challenge_expired') {
    return 'expired';
  }
  return 'waiting';
}

export async function relogin(): Promise<void> {
  await auth.login({ redirect: true });
}
