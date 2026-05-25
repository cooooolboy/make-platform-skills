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
- For generated unified-login Apps, prefer `createMakeAppAuth({ apiAuthRedirect: true })` so SDK handles API 401/403 redirect checks with built-in loop protection.
- If `auth.init({ redirect: true })` returns `reason="state_expired"` or `reason="challenge_expired"`, show `登录已过期，请重新登录` and wait for the user to click.
- After the user clicks relogin, call `auth.login({ redirect: true })`. Do not implement multiple automatic retries.

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
    renderLoginExpired({
      message: '登录状态已失效，请重新登录后重试。',
      onRelogin: () => auth.login({ redirect: true })
    });
    return;
  }

  if (error instanceof MakeAppForbiddenError) {
    renderForbidden();
    return;
  }

  renderError(error.message);
}
```

When `apiAuthRedirect: true` is enabled, most unified-login API 401/403 cases will redirect before the App can render an error. Keep the catch block for token mode, permission-denied responses without a login challenge, and network/runtime failures.

## Anti-patterns

- Redirecting to Org automatically on every 401 in token mode.
- Automatically retrying unified login multiple times after state/challenge expiration.
- Hand-writing per-request 401/403 login wrappers when the SDK option `apiAuthRedirect: true` is available.
- Rebuilding Org authorize/logout URLs in App code.
- Hard-coding Org, unified-login, or account-center environment domains in App code.
- Clearing `zs_session` or `make_app_session` from App code.
- Treating every 403 as a login-expired state after SDK login check confirms the user is already authenticated.
