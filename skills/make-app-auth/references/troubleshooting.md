# Troubleshooting

Use this when diagnosing Make App auth failures. This runbook is for the agent, platform, or operator; it is not a checklist that a vibe user must perform after publishing.

Goal: quickly decide whether the issue is App code, SDK usage, make-gateway, Org, browser cookie state, Service auth proxy, or local proxy configuration.

Scope boundary: stop this auth runbook once authenticated Make backend requests are reaching the app. Schema normalization, table rendering, blank pages, object routes, and business UI states belong to `makeui` and app smoke tests.

## First Split

Generated and reviewed Apps use unified login only.

- If generated code contains token mode, `unifiedLogin: false`, `accessToken`, `tokenProvider`, local credentials, or no-login bypasses, treat that as an App code bug.
- Unified login requires a real browser, external domain/ngrok or published domain, Org whitelist, cookies, and callback routing.

## Evidence To Collect First

- Request URL and status for the failing `/api/make/**` call.
- Whether the request was made through the shared Make API adapter that wraps `auth.api`.
- Browser request headers: especially Cookie presence, without exposing full token values in reports.
- User-facing message shown by the App.
- make-gateway response body, request ID, or trace ID when available.

For published/vibe Apps, collect this evidence with an automated browser, request tracing, CI smoke, platform logs, or generated tests where possible. The expected product behavior is that the user opens the published domain and either reaches the app or sees a clear auth/error state; the user should not need DevTools, k8s log access, or cookie knowledge.

## Unified Mode Checklist

For redirect/callback failures:

- Confirm the App is reachable through a registered external HTTPS domain or ngrok.
- Confirm Org whitelist contains the exact callback `redirect_uri`.
- Confirm `/api/make/**` routes to make-gateway from that domain.
- Confirm every schema/meta/list/create/update/delete/file/user/department request goes through the shared Make API adapter, not scattered unhandled `auth.api` calls or raw fetch.
- Confirm browser accepts and sends cookies for the App domain.
- Confirm the page does not auto-loop login on every 401.
- If the App URL contains `make_auth_error=session_expired`, the expected UI is a "登录已过期，请重新登录" prompt, not another immediate redirect.

For Service-fronted Apps:

- Confirm browser business requests go to `/api/make/app/**`, not directly to `/api/make/meta/**` or `/api/make/data/**`.
- Confirm `/api/make/auth/**` is transparent proxy traffic from Service to `http://make-gateway/make/auth/**`.
- Confirm `/api/make/auth/current-context` exists on the published domain. A Service 404 for this route is an auth proxy contract bug, not a user login problem.
- Confirm Service calls k8s-internal business routes as `http://make-gateway/make/meta/**` and `http://make-gateway/make/data/**`; `/api/make/meta/**` usually indicates the wrong internal gateway path.
- Confirm Service proxy keeps `session/complete` redirects manual. If Node `fetch` follows the gateway 302 internally, the browser URL can stay on `/api/make/auth/session/complete?...` and cause a login loop.

For cookie problems:

- Inspect browser DevTools Application/Cookies for App domain.
- Check whether duplicate session cookies exist.
- Check request Cookie header sent to `/api/make/**`.
- Confirm make-gateway logs for session verification and challenge generation.
- Confirm the request is same-origin or has the expected credentials behavior.

For logout problems:

- Confirm App calls `auth.logout()`, not a hand-built Org URL.
- Confirm make-gateway returns the SDK-expected logout result.
- Confirm make-gateway returns the App return URL as `redirectUri`; account-center or Org logout URLs should not be exposed to generated App code.
- Verify post-logout browser state with a real browser, not curl only.

## Quick Decision

- Generated token mode or `Authorization`: App code bug; regenerate unified-login auth.
- 401 with no Cookie: browser cookie/session problem or exchange did not set cookie.
- 401 with Cookie present: make-gateway or Org token verification problem.
- Repeated redirects after login: callback/exchange/cookie persistence problem, not UI layout.
- Gateway 404 for `/api/make/meta/**` from Service: internal gateway business path should likely be `/make/meta/**`.
- Browser stays on `/api/make/auth/session/complete?login_ticket=...`: Service likely swallowed the gateway 302 instead of returning it to the browser.
- Authenticated schema/list APIs return 200 but the page is blank: leave auth runbook; this is likely runtime-schema normalization, render error handling, or UI smoke coverage.

## Fast Root-Cause Labels

- `token_mode_generated`: App generated token mode or local-token fallback even though only unified login is supported.
- `redirect_uri_not_whitelisted`: Org rejects callback.
- `api_proxy_missing`: frontend loads, but `/api/make/**` does not reach make-gateway.
- `auth_proxy_missing`: Service-fronted App did not proxy `/api/make/auth/**`, so unified login cannot start or complete.
- `api_adapter_missing`: Make backend requests bypass the shared adapter, so business-request 401 is not routed into the login recovery flow.
- `cookie_not_set`: exchange/login succeeded but browser has no App session cookie.
- `cookie_not_sent`: browser stores cookie but request does not include it.
- `logout_contract_mismatch`: App expects redirect/link but gateway returns a different shape.
- `state_expired`: user stayed on Org login/callback flow too long; SDK should show relogin prompt.
- `challenge_expired`: gateway challenge expired before callback completed; SDK should show relogin prompt.
- `service_followed_complete_redirect`: App Service followed `session/complete` 302 internally; browser did not receive Set-Cookie/Location as intended.
- `service_internal_gateway_path_mismatch`: Service called `/api/make/meta|data/**` on k8s-internal gateway instead of `/make/meta|data/**`.
