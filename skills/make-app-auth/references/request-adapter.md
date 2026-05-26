# Request Adapter

Use this reference when generating or reviewing Make backend request code.

## Rule

All frontend requests to Make backend must go through one shared adapter that wraps `auth.api`. This includes schema/meta loading, record list/get/create/update/delete, cell updates, attachment/file APIs, lookup resolution, user candidates, department candidates, and other `/api/make/**` calls.

Do not call raw `window.fetch('/api/make/...')`. Do not scatter unhandled `auth.api` calls across UI components, drawers, tables, field editors, or route loaders.

## Request Shape

Business code should pass relative paths to `auth.api`. If an absolute URL is unavoidable, it must be under the same origin and path scope as `gatewayBaseUrl`; otherwise the SDK rejects it.

The SDK defaults Make backend requests to `credentials: 'include'`. Generated adapters may still keep a shared request init so cookie behavior is auditable in one place; do not repeat credential handling in UI components.

```ts
const makeRequestInit = {
  credentials: 'include' as const
};
```

Direct gateway mode example:

```ts
export async function listRecords(payload: unknown) {
  return auth.api.post('/data/v1/record', payload, makeRequestInit);
}
```

Service-fronted mode example. Use this only after `service-fronted-mode.md` confirms the `UI -> Service -> make-gateway` contract:

```ts
export async function loadSchema() {
  return auth.api.get('/app/schema', makeRequestInit);
}

export async function listRecords(entityKey: string, payload: unknown) {
  return auth.api.post(`/app/records/${entityKey}`, payload, makeRequestInit);
}
```

Apply the same adapter path to schema/meta, list, get, create, update, delete, file, lookup, user, and department APIs. Do not fix one endpoint while leaving another endpoint on raw fetch or a different helper.

Do not use `/app/**` in direct gateway mode. Do not use `/data/**` or `/meta/**` from UI in Service-fronted mode.

Custom headers are allowed through the SDK request options:

```js
const result = await auth.api.post('/data/v1/record', body, {
  credentials: 'include',
  headers: {
    'X-Make-Target': 'MakeService.ListResources',
    'X-Trace-Id': traceId
  }
});
```

If a list request has no real filters, omit `filter`. Do not send `filter: []`.

## Error Handling

When `apiAuthRedirect: true` is available, the SDK owns the normal unified-login 401/403 redirect. The shared adapter still owns three things:

- preventing scattered `auth.api` calls
- fallback UI for errors that cannot redirect

```js
async function handleMakeRequestError(error) {
  if (error instanceof MakeAppUnauthorizedError) {
    showNeutralLoading();
    if (!makeAuthConfig.apiAuthRedirect) {
      await auth.login({ redirect: true });
    }
    return;
  }

  if (error instanceof MakeAppForbiddenError) {
    renderForbidden();
    return;
  }

  throw error;
}

export async function listRecords(payload) {
  try {
    return await auth.api.post('/data/v1/record', payload, {
      credentials: 'include',
      headers: { 'X-Make-Target': 'MakeService.ListResources' }
    });
  } catch (error) {
    return handleMakeRequestError(error);
  }
}
```

Do not call `auth.logout({ redirect: false })` as the default 401 path when `apiAuthRedirect` is enabled. Use logout-before-login only for a diagnosed stale or corrupted App session, not as the normal request adapter behavior.

## Tests

When touching request code, add or update tests for:

- 403 forbidden response
- unified-login API 401/403 with `apiAuthRedirect: true`
- schema/list/create/update/delete 401 entering the shared expired-session handler
- schema/meta/list/get/create/update/delete/file/lookup/user/department calls use the shared adapter and the same cookie-capable request init
- no raw `window.fetch('/api/make/...')`
- no scattered unhandled `auth.api` calls in UI components
