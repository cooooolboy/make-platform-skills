# Unified Login Mode

Use unified mode only when the user explicitly asks to test unified login, OAuth, SSO, cookies, logout, ngrok, or redirect callback behavior.

This mode is not the default for ordinary local feature development.

## Preconditions

Unified mode requires:

- A deployed App domain or an ngrok/external HTTPS domain that can receive browser callbacks.
- The callback `redirect_uri` registered in Org whitelist.
- `/api/make/**` from the external domain routed to make-gateway.
- Browser testing with real cookies enabled.

If these are missing, do not silently fall back to broken OAuth. Use token mode for ordinary feature debugging.

## SDK Setup

```js
const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
  unifiedLogin: true,
  apiAuthRedirect: true
});

const boot = await auth.init({ redirect: true });

if (boot.status === 'authenticated') {
  renderApp({ auth, context: boot.context });
} else if (boot.status === 'redirecting') {
  renderLoading();
} else if (boot.reason === 'state_expired' || boot.reason === 'challenge_expired') {
  renderLoginExpired({
    message: boot.message || '登录已过期，请重新登录',
    onRelogin: () => auth.login({ redirect: true })
  });
} else {
  await auth.login({ redirect: true });
}
```

## Rules

- Published unified-login Apps should use the Org login page directly. Do not render an App-owned login page, login transition page, or signed-out completion page.
- Keep only a neutral loading state while SDK/browser redirection is in progress.
- If login callback returns to the App with an expired state/challenge marker, show a simple relogin prompt. Do not immediately redirect again.
- The relogin button should call `auth.login({ redirect: true })`; the SDK removes the expired-login URL parameters before creating the next challenge.
- Formal unified-login Apps must not pass `accessToken`, `token`, or `tokenProvider`; after login, browser requests rely on the App session Cookie written by make-gateway.
- Set `apiAuthRedirect: true` for generated unified-login Apps only when the installed SDK version supports it. Until that option is released on npm, use the documented `make-app-auth-sdk` development branch dependency.
- Unified login challenge URLs are returned by make-gateway. Logout returns an App `redirectUri`; App UI code must not configure or hard-code account-center or Org logout URLs.
- Do not construct Org authorize URLs in App code.
- Do not handle `code` or `state` in App code unless the SDK contract explicitly requires it.
- Do not use the App domain directly as an Org logout `redirect_uri`.
- Do not normalize or rewrite `orgSsoLogoutUrl` in App code. `@qfeius/make-app-auth` calls make-gateway logout and follows the gateway-provided App `redirectUri`.
- Authenticated unified-login pages must include a visible logout button or icon in the App shell header so testers can re-enter the phone/code login flow without editing cookies.
- Test callback and cookie behavior in a real browser, not only curl.
- Keep environment-specific domains in configuration or gateway responses, not hard-coded App UI logic.

## Expected Request Path

```text
browser -> App domain/ngrok -> local or deployed frontend -> /api/make proxy -> make-gateway -> Org
```

ngrok only exposes the frontend. It does not automatically forward `/api/make/**` unless the frontend/dev server proxy is configured.

Service-fronted deployed Apps use this split:

```text
browser -> /api/make/auth/** -> App Service -> make-gateway /api/make/auth/**
browser -> /api/make/app/** -> App Service -> make-gateway /make/meta|data/**
```

Do not make UI call k8s-internal service names. Only Service code running inside the cluster should call `http://make-gateway`.

## Validation Checklist

- Open the App through the registered external domain or ngrok URL.
- Confirm `/api/make/**` reaches make-gateway.
- Complete Org login and callback in the same browser.
- Confirm the next protected `/api/make/**` request succeeds without hand-written `Authorization`.
- Confirm business-request 401 from schema/meta/list/create/update/delete/file/user/department APIs goes through the shared Make API adapter and redirects into Org login recovery.
- Confirm logout uses the SDK and follows the make-gateway-provided App `redirectUri`. A browser stuck on a gateway `/api/org/public/sso/logout` or account-center URL means the gateway logout response or route configuration should be fixed, not patched in App UI code.
