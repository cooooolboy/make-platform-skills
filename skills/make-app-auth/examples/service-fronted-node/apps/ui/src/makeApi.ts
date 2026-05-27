import { auth } from './auth';

const makeRequestInit = {
  credentials: 'include' as const
};

export async function loadSchema(): Promise<unknown> {
  return auth.api.get('/app/schema', makeRequestInit);
}

export async function listRecords(entityKey: string, payload: unknown): Promise<unknown> {
  return auth.api.post(`/app/records/${entityKey}`, payload, {
    ...makeRequestInit,
    headers: { 'X-Make-Target': 'MakeService.ListResources' }
  });
}
