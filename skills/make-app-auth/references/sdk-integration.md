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
    "@qfeius/make-app-auth": "^0.1.2"
  }
}
```

Install command:

```bash
pnpm add @qfeius/make-app-auth@^0.1.2 --registry=https://registry.npmjs.org/
```

Use a Git branch dependency only when intentionally testing unreleased SDK changes:

```json
{
  "dependencies": {
    "@qfeius/make-app-auth": "git+ssh://git@git.qtech.cn:make/make-app-auth-sdk.git#<branch>"
  }
}
```

`apiAuthRedirect` requires `@qfeius/make-app-auth >= 0.1.2`. Do not generate this option with older npm dependencies.

## Startup Shape

Generated Apps default to unified login. Direct App entry should call `auth.init({ redirect: true })` and go to the Org login page instead of showing an App-owned login page. Token mode is only an explicit local/debug override.

```js
import {
  createMakeAppAuth
} from '@qfeius/make-app-auth';

const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
  unifiedLogin: true,
  apiAuthRedirect: true
});

const boot = await auth.init({ redirect: true });

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
  renderLoading();
}
```

## Business Requests

Use `auth.api` for Make backend calls. The SDK handles `/api/make`, cookies, JSON request bodies, unified auth errors, and token-mode `Authorization` headers.

`gatewayBaseUrl` is the SDK option for the Make backend API base. In Make tooling this value already exists as `makecli` `server-url` (`makecli configure get server-url`, default `https://dev-make.qtech.cn/api/make`). Reuse that host Make backend config when generating App configuration; do not invent a separate backend URL setting.

For a deployed same-origin unified-login App, prefer the SDK default `/api/make`. For explicit local token-mode debugging, materialize the same Make backend `server-url` into browser-safe config such as `VITE_MAKE_SERVER_URL` or the existing project config, then pass it as `gatewayBaseUrl`. Browser code must not read `~/.make/config` directly.

`gatewayBaseUrl` is not the unified login, Org, or account-center URL.

Business code should pass relative paths to `auth.api`, for example `/data/v1/record`. Do not generate absolute business URLs. If an absolute URL is unavoidable, it must be under the same origin and path scope as `gatewayBaseUrl`; otherwise the SDK rejects it and will not attach token-mode `Authorization`.

Available helpers:

```js
auth.api.get(path, init);
auth.api.post(path, body, init);
auth.api.put(path, body, init);
auth.api.patch(path, body, init);
auth.api.delete(path, init);
auth.api.request(path, init);
```

For shared adapter, 401/403, request headers, and no-scattered-`auth.api` rules, read `request-adapter.md`.

For Service-fronted Apps where UI calls App Service and Service calls make-gateway, read `service-fronted-mode.md`.

## Tests To Add When Touching Auth

- Missing token in token mode.
- Expired or rejected token in token mode.
- 403 forbidden response.
- Unified-login API 401/403 with `apiAuthRedirect: true` redirects through SDK login once.
- Unified-login unauthenticated state does not loop redirects.
- Business-request 401 from schema/list/create/update/delete enters the shared expired-session handler.
- Make backend calls are routed through the shared adapter; no raw `window.fetch('/api/make/...')` and no scattered unhandled `auth.api` calls in UI components.
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
