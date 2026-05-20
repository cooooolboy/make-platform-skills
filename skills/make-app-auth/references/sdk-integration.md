# SDK Integration

Use `@qfei/make-app-auth` for Make App authentication and Make backend requests.

## Responsibility Boundary

The SDK owns auth bootstrap, token-mode `Authorization`, unified-login browser state, and `/api/make/**` request helpers.

App code owns page state, user-facing messages, and business feature logic.

## Dependency

Prefer the Git dependency until a published package source is already configured:

```json
{
  "dependencies": {
    "@qfei/make-app-auth": "git+ssh://git.qtech.cn/make/make-app-auth-sdk.git#main"
  }
}
```

## Startup Shape

Generated Apps should not auto-redirect to Org on page load by default. Check auth state first and render a mode-appropriate state.

```js
import {
  createMakeAppAuth,
  MakeAppUnauthorizedError,
  MakeAppForbiddenError
} from '@qfei/make-app-auth';

const auth = createMakeAppAuth({
  gatewayBaseUrl: '/api/make',
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
} else if (boot.status === 'forbidden') {
  renderForbidden();
} else {
  renderTokenRequired();
}
```

## Business Requests

Use `auth.api` for Make backend calls. The SDK handles `/api/make`, cookies, JSON request bodies, unified auth errors, and token-mode `Authorization` headers.

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

## Tests To Add When Touching Auth

- Missing token in token mode.
- Expired or rejected token in token mode.
- 403 forbidden response.
- Unified-login unauthenticated state does not loop redirects.
- Authenticated unified-login state exposes a visible logout action wired to `auth.logout()`.
- Logout does not consume or rewrite `orgSsoLogoutUrl` in App code; SDK owns account-center logout compatibility.

## Never Generate

- Reading, storing, or forwarding Org access tokens.
- Reading, writing, or deleting `zs_session` or `make_app_session`.
- Browser code that tries to read `~/.make/credentials`.
- Raw `Authorization` header logic outside the SDK.
- Constructing Org OAuth URLs, `redirect_uri`, `state`, or `code_challenge`.
- Constructing Org logout URLs or adding App-side fallback logic for `token不能为空`.
- Handling Org OAuth `code` in the App.
- Raw `window.fetch('/api/make/...')` for Make backend calls.
- Monkey-patching `window.fetch`.
- Treating browser context data as server-trusted authorization.
