# SDK Integration

Use `@qfeius/make-app-auth` for Make App authentication and Make backend requests.

## Responsibility Boundary

The SDK owns auth bootstrap, token-mode `Authorization`, unified-login browser state, and `/api/make/**` request helpers.

App code owns page state, user-facing messages, and business feature logic.

## Dependency

Use the public npm package by default when the SDK behavior is stable:

```json
{
  "dependencies": {
    "@qfeius/make-app-auth": "^0.1.1"
  }
}
```

Install command:

```bash
pnpm add @qfeius/make-app-auth --registry=https://registry.npmjs.org/
```

During the current SDK development/debugging stage, prefer the Git branch dependency so teams can test the latest SDK without publishing a new npm version for every small change:

```json
{
  "dependencies": {
    "@qfeius/make-app-auth": "git+ssh://git@git.qtech.cn:make/make-app-auth-sdk.git#codex/unified-login-logout-redirect"
  }
}
```

After the SDK contract stabilizes, switch generated Apps back to the npm semver dependency.

## Startup Shape

Generated Apps default to token mode and should not auto-redirect to Org unless unified login is explicitly enabled. In published unified-login mode, direct App entry should go to the Org login page instead of showing an App-owned login page.

```js
import {
  createMakeAppAuth,
  MakeAppUnauthorizedError,
  MakeAppForbiddenError
} from '@qfeius/make-app-auth';

const auth = createMakeAppAuth({
  gatewayBaseUrl: makeAuthConfig.serverUrl || makeAuthConfig.gatewayBaseUrl || '/api/make',
  unifiedLogin: false,
  tokenProvider: async () => debugToken
});

const boot = await auth.init({ redirect: false });

if (boot.status === 'authenticated') {
  renderApp({
    auth,
    context: boot.context,
    onLogout: () => auth.logout()
  });
} else if (boot.reason === 'state_expired' || boot.reason === 'challenge_expired') {
  renderLoginExpired({
    message: boot.message || '登录已过期，请重新登录',
    onRelogin: () => auth.login({ redirect: true })
  });
} else if (boot.status === 'forbidden') {
  renderForbidden();
} else {
  renderTokenRequired();
}
```

## Business Requests

Use `auth.api` for Make backend calls. The SDK handles `/api/make`, cookies, JSON request bodies, unified auth errors, and token-mode `Authorization` headers.

`gatewayBaseUrl` is the SDK option for the Make backend API base. In Make tooling this value already exists as `makecli` `server-url` (`makecli configure get server-url`, default `https://dev-make.qtech.cn/api/make`). Reuse that host Make backend config when generating App configuration; do not invent a separate backend URL setting.

For a deployed same-origin unified-login App, prefer the SDK default `/api/make`. For local token-mode debugging, materialize the same Make backend `server-url` into browser-safe config such as `VITE_MAKE_SERVER_URL` or the existing project config, then pass it as `gatewayBaseUrl`. Browser code must not read `~/.make/config` directly.

`gatewayBaseUrl` is not the unified login, Org, or account-center URL.

Business code should pass relative paths to `auth.api`, for example `/data/v1/record`. Do not generate absolute business URLs. If an absolute URL is unavoidable, it must be under the same origin and path scope as `gatewayBaseUrl`; otherwise the SDK rejects it and will not attach token-mode `Authorization`.

For unified-login Apps, set `apiAuthRedirect: true`. Then business API 401/403 responses trigger the SDK to reuse `auth.login({ redirect: true })`; the SDK still applies redirect guards so the same return URL cannot loop indefinitely. Token mode must not redirect to Org.

```js
const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
  unifiedLogin: true,
  apiAuthRedirect: true
});
```

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

Service-based Apps should keep the browser boundary under `/api/make/**` while letting Service own business orchestration:

```js
await auth.api.get('/app/schema');
await auth.api.post('/app/records/customer', payload);
```

Expected deployed chain:

```text
UI -> auth.api('/app/**') -> /api/make/app/** -> App Service -> http://make-gateway/make/meta|data/**
```

Auth endpoints remain transparent proxy traffic:

```text
UI -> /api/make/auth/** -> App Service -> http://make-gateway/api/make/auth/**
```

For `/api/make/auth/session/complete`, Service must preserve the gateway response for the browser. In Node Service code, set `redirect: "manual"` or the equivalent so `302 + Set-Cookie + Location` is not consumed inside Service.

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

## Tests To Add When Touching Auth

- Missing token in token mode.
- Expired or rejected token in token mode.
- 403 forbidden response.
- Unified-login API 401/403 with `apiAuthRedirect: true` redirects through SDK login once.
- Unified-login unauthenticated state does not loop redirects.
- Unified-login state/challenge expiration renders a relogin prompt instead of automatically redirecting again.
- Authenticated unified-login state exposes a visible logout action wired to `auth.logout()`.
- Logout does not consume or rewrite `orgSsoLogoutUrl` in App code; the SDK calls make-gateway logout and follows gateway `redirectUri`, which should be an App return URL rather than an account-center or Org logout URL.

## Never Generate

- Reading, storing, or forwarding Org access tokens.
- Reading, writing, or deleting `zs_session` or `make_app_session`.
- Browser code that tries to read `~/.make/credentials`.
- Raw `Authorization` header logic outside the SDK.
- Hard-coded Org, unified-login, or account-center domains in App code.
- Passing arbitrary absolute URLs to `auth.api`.
- Constructing Org OAuth URLs, `redirect_uri`, `state`, or `code_challenge`.
- Constructing Org logout URLs or adding App-side fallback logic for `token不能为空`.
- Handling Org OAuth `code` in the App.
- Raw `window.fetch('/api/make/...')` for Make backend calls.
- Monkey-patching `window.fetch`.
- Treating browser context data as server-trusted authorization.
