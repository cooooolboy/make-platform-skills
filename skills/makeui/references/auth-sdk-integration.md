# Make App Auth SDK Integration

Use this reference when generating or modifying a Make App frontend.

## Rule

Make App frontends only own UI and business interactions. Authentication state, tenant/user identity, App session cookies, 401/403 behavior, and logout are owned by `@qfei/make-app-auth` plus make-gateway.

## Dependency

Prefer the Git dependency until a published package source is already configured by the host project:

```json
{
  "dependencies": {
    "@qfei/make-app-auth": "git+ssh://git.qtech.cn/make/make-app-auth-sdk.git#main"
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

## Unified Login Disabled / Token Mode

Generated Vibe Apps should expose an explicit auth mode config. Default to local `token` mode so local-only vibe projects can call real Make backend APIs without ngrok:

- `token`: default local real-backend debugging when the App is not deployed and no ngrok proxy is available.
- `unified`: explicit Make App unified login. Use this only when the App is deployed or exposed through a registered/ngrok App domain and the user enables unified login.
- `mock`: offline preview only.

If make-gateway reports unified login is disabled for the App, or the generated App is explicitly started in local token mode, generated code must still use `@qfei/make-app-auth`. Do not fork a separate auth implementation.

Token source priority:

1. `accessToken` or `token` passed to `createMakeAppAuth`.
2. `tokenProvider()` passed to `createMakeAppAuth`.
3. Node/local debug credentials from `~/.make/credentials` using profile `default` unless configured otherwise.

Browser code cannot read `~/.make/credentials`. Browser Apps that run without unified login must receive `accessToken` or `tokenProvider` from the host/debug setup.

```js
const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
  unifiedLogin: false,
  accessToken: userProvidedToken
});

const boot = await auth.init({ redirect: false });

if (boot.status === 'authenticated' && boot.context.authMode === 'token') {
  renderApp({ auth, context: boot.context });
}
```

In token mode, `init()` returns `authenticated` without exposing the token. `boot.context.authMode` is `token`, and `boot.context.tokenSource` may be used only for diagnostics.

If no token is available, render an unauthenticated/token-missing state. Do not redirect to Org, because unified login is explicitly disabled.

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
- Browser code that tries to read `~/.make/credentials`.
- Raw `Authorization` header logic outside the SDK.
- Constructing Org OAuth URLs, `redirect_uri`, `state`, or `code_challenge`.
- Handling Org OAuth `code` in the App.
- Raw `window.fetch('/api/make/...')` for Make backend calls.
- Monkey-patching `window.fetch`.
- Treating browser context data as server-trusted authorization.
