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
  unifiedLogin: true
});

const boot = await auth.init({ redirect: false });

if (boot.status === 'authenticated') {
  renderApp({ auth, context: boot.context });
} else {
  renderLogin({ onLogin: () => auth.login({ redirect: true }) });
}
```

## Rules

- Login must be user-click initiated unless the task explicitly asks for an auto-redirect flow.
- Do not construct Org authorize URLs in App code.
- Do not handle `code` or `state` in App code unless the SDK contract explicitly requires it.
- Do not use the App domain directly as an Org logout `redirect_uri`.
- Do not normalize or rewrite `orgSsoLogoutUrl` in App code. `@qfei/make-app-auth` owns the compatibility flow: clear App session, request the next login challenge, then route through account-center logout when needed.
- Authenticated unified-login pages must include a visible logout button or icon in the App shell header so testers can re-enter the phone/code login flow without editing cookies.
- Test callback and cookie behavior in a real browser, not only curl.
- Keep environment-specific domains in configuration or gateway responses, not hard-coded App UI logic.

## Expected Request Path

```text
browser -> App domain/ngrok -> local or deployed frontend -> /api/make proxy -> make-gateway -> Org
```

ngrok only exposes the frontend. It does not automatically forward `/api/make/**` unless the frontend/dev server proxy is configured.

## Validation Checklist

- Open the App through the registered external domain or ngrok URL.
- Confirm `/api/make/**` reaches make-gateway.
- Complete Org login and callback in the same browser.
- Confirm the next protected `/api/make/**` request succeeds without hand-written `Authorization`.
- Confirm logout uses the SDK and reaches the account-center phone/code login page. A browser stuck on `dev-make-console.../api/org/public/sso/logout` with `token不能为空` means the App is bypassing the SDK compatibility flow or using an outdated SDK.
