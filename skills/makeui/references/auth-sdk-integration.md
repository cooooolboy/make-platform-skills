# Make App Auth SDK Integration

Use this reference when generating or modifying a gateway/unified-login Make App frontend.

## Rule

Make App frontends only own UI and business interactions. Authentication state, tenant/user identity, App session cookies, 401/403 behavior, and logout are owned by `@qfei/make-app-auth` plus make-gateway.

This reference does not override host projects that explicitly require `apps/ui -> apps/service -> Make Data API`. Preserve that Service contract unless the user confirms a data-flow change.

## Dependency

Prefer the Git dependency until a published package source is already configured by the host project:

```json
{
  "dependencies": {
    "@qfei/make-app-auth": "git+ssh://git@git.qtech.cn/make/make-app-auth-sdk.git#main"
  }
}
```

## Startup

Generated Vibe Apps should not auto-redirect to Org on page load. First check the App session and render an App-owned login view when unauthenticated.

```js
import {
  createMakeAppAuth,
  MakeAppUnauthorizedError,
  MakeAppForbiddenError
} from '@qfei/make-app-auth';

const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make' });
const boot = await auth.init({ redirect: false });

if (boot.status === 'authenticated') {
  renderApp({ auth, context: boot.context });
} else if (boot.status === 'forbidden') {
  renderForbidden();
} else {
  renderLogin({ onLogin: () => auth.login({ redirect: true }) });
}
```

## Local Unified Login Debug

For Make App unified login debugging, generate Vite config with:

- `server.host = "0.0.0.0"`
- `server.port = 5174`
- proxy `/api/make` to `process.env.MAKE_GATEWAY_PROXY_TARGET || "https://dev-make.qtech.cn"`
- `changeOrigin: true`
- `secure: false` for local gateway debugging

Only expose the Vite UI port through ngrok:

```bash
ngrok http 5174
```

Generated browser config should only include non-secret values such as:

```env
VITE_MAKE_APP_KEY=ExpensePoc
VITE_MAKE_LIST_PAGE_SIZE=100
MAKE_GATEWAY_PROXY_TARGET=https://dev-make.qtech.cn
```

Do not generate `VITE_SERVICE_BASE_URL`, `VITE_MAKE_ACCESS_TOKEN`, Org token, Cookie, or `make_app_session` configuration for gateway/unified-login browser Apps. Service-based projects may have their own non-secret Service base URL contract; do not remove it when preserving that data flow.

## Unified Login Disabled / Token Mode Exception

Generated login modules default to full gateway unified login, not token mode.

If the user explicitly asks for a token-mode local debug App, or make-gateway reports unified login disabled for that App, still use `@qfei/make-app-auth`. Do not fork a separate auth implementation. Token-mode code must receive tokens only through SDK options such as `accessToken` or `tokenProvider`, never through hand-written `Authorization` headers, and it must keep business code on `auth.api`.

Browser code cannot read `~/.make/credentials`; do not generate browser code that attempts it. For unified login work, prefer ngrok + `/api/make` proxy over browser tokens.

## Business Requests

Use `auth.api` for Make backend calls. The SDK handles `/api/make`, cookies, JSON request bodies, unified auth errors, and token-mode `Authorization` headers. The generated App still owns business paths, payloads, and non-auth headers.

```js
const body = {
  app: 'expense',
  entity: 'reimbursement',
  fields: [],
  pagination: { page: 1, size: 10 }
};

if (hasFilterConditions) {
  body.filter = [{ title: { contains: keyword } }];
}

const result = await auth.api.post('/data/v1/record', body, {
  headers: {
    'X-Make-Target': 'MakeService.ListResources',
    'X-Trace-Id': traceId
  }
});
```

Available helpers:

```js
auth.api.get(path, init);
auth.api.post(path, body, init);
auth.api.put(path, body, init);
auth.api.patch(path, body, init);
auth.api.delete(path, init);
auth.api.request(path, init);
```

If a list request has no real filters, omit `filter`. Do not send `filter: []`.

## Expired Login

Business request 401s should not cause hidden auto-redirects. Catch `MakeAppUnauthorizedError`, show a login-expired state, and let the user click login.

```js
try {
  await auth.api.post('/data/v1/record', payload);
} catch (error) {
  if (error instanceof MakeAppUnauthorizedError) {
    renderLoginExpired({ onLogin: () => auth.login({ redirect: true }) });
    return;
  }
  if (error instanceof MakeAppForbiddenError) {
    renderForbidden();
    return;
  }
  renderError(error.message);
}
```

## Logout

Generated Apps only call:

```js
await auth.logout();
```

Do not construct Org logout URLs in generated App code. make-gateway and Org own global logout behavior.

## Never Generate

- Reading, storing, or forwarding Org access tokens.
- Reading, writing, or deleting `zs_session` or `make_app_session`.
- Exposing Make tokens, Org tokens, or Cookie values through browser `VITE_*` config. In gateway/unified-login Apps, also do not expose Service URLs.
- Browser code that tries to read `~/.make/credentials`.
- Raw `Authorization` header logic outside the SDK.
- Constructing Org OAuth URLs, `redirect_uri`, `state`, or `code_challenge`.
- Handling Org OAuth `code` in the App.
- Raw `window.fetch('/api/make/...')` for Make backend calls.
- Raw `fetch('/api/make/...')` for Make backend calls.
- Monkey-patching `window.fetch`.
- Treating browser context data as server-trusted authorization.
- Routing Make runtime data through `apps/service` in a gateway/unified-login App unless the user explicitly requested a server-side orchestration contract.
