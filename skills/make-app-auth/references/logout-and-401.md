# Logout And 401

Use this reference when implementing or reviewing user-facing behavior for auth failures and logout.

## Token Mode

401 means the user-provided debug token is missing, expired, malformed, or rejected.

Behavior:

- Show update-token state.
- Do not redirect to Org.
- Do not call `/challenge`.
- Do not build OAuth URLs.

Recommended message:

```text
当前调试 Token 已失效，请更新 Token 后重试。
```

403 means the token is valid but lacks permission:

```text
当前 Token 无权限访问该资源。
```

Logout in token mode should only clear local debug state managed by the App or SDK. It should not claim to clear Org browser login.

## Unified Mode

401 means browser session is missing or expired.

Behavior:

- Show only a neutral loading state while the browser is being redirected.
- Use `auth.login({ redirect: true })` to enter the Org login page.
- Do not render an App-owned login page, login transition page, or signed-out completion page.
- Do not silently redirect on every API call.

Logout:

```js
await auth.logout();
```

Do not construct Org logout URLs in generated App code. make-gateway and Org own global logout behavior.

The SDK calls make-gateway logout and follows the gateway-provided App `redirectUri`. Generated App code must not rebuild this flow, consume deprecated `orgSsoLogoutUrl` directly, or patch wrong logout URLs in UI code. After the App loads again, `auth.init({ redirect: true })` decides whether the user should enter the Org login page.

## Error Handling Pattern

```js
try {
  await auth.api.post('/data/v1/record', payload);
} catch (error) {
  if (error instanceof MakeAppUnauthorizedError) {
    if (authMode === 'token') {
      renderTokenExpired({ message: '当前调试 Token 已失效，请更新 Token 后重试。' });
      return;
    }
    renderLoading();
    await auth.login({ redirect: true });
    return;
  }

  if (error instanceof MakeAppForbiddenError) {
    renderForbidden();
    return;
  }

  renderError(error.message);
}
```

## Anti-patterns

- Redirecting to Org automatically on every 401 in token mode.
- Rebuilding Org authorize/logout URLs in App code.
- Hard-coding Org, unified-login, or account-center environment domains in App code.
- Clearing `zs_session` or `make_app_session` from App code.
- Treating 403 as a login-expired state.
