---
name: make-app-auth
description: Use when generating, modifying, reviewing, or debugging Make App authentication and authenticated /api/make requests with @qfeius/make-app-auth. Covers local token mode, unified login/OAuth/ngrok mode, 401/403 handling, logout, cookies, sessions, redirect callbacks, and Make App auth troubleshooting.
version: 0.1.2
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/make-app-auth
---

# make-app-auth

Use this skill for **Make App authentication and authenticated Make API access**.

## Scope

This skill covers:

- `@qfeius/make-app-auth` SDK integration
- unified login as the default generated/published Make App auth mode
- explicit local token mode with unified login disabled
- unified login, OAuth, SSO, ngrok, cookie, logout, and callback testing
- `/api/make/**` authenticated requests
- 401, 403, and logout behavior
- cookie, session, redirect, and callback troubleshooting

This skill does not cover:

- UI layout, component design, or Make App page structure; use `makeui`.
- DSL modeling or Make resource definitions; use `makedsl`.
- makecli command execution; use `makecli`.
- make-gateway or Org server implementation changes.

## Default Behavior

Default generated and published Make Apps use **unified login** with `unifiedLogin: true`, `apiAuthRedirect: true`, and `auth.init({ redirect: true })`.

Token mode is an explicit local debugging override only. Use it when the user asks for token mode, offline/local backend debugging, or when the current environment cannot provide a published App domain, `/api/make/**` routing, and Org callback capability.

Mode selection:

- `unified`: default for generated Make Apps, published Apps, real Org login, OAuth, cookies, logout, and redirects.
- `token`: explicit local/debug override when the user asks for token mode or the environment cannot complete unified login.
- `mock`: offline UI preview only; must not call real Make APIs.

## Hard Rules

- Always use `@qfeius/make-app-auth`; do not fork a separate auth implementation.
- Business requests to Make backend must go through `auth.api` under `/api/make/**`.
- All frontend requests to Make backend must go through `auth.api`, including schema/meta, list, get, create, update, delete, attachment/file, lookup, user, and department candidate requests.
- Generated Apps must centralize Make backend access in a shared API adapter or data-source layer that wraps `auth.api`.
- Service-fronted Apps must preserve the `UI -> Service -> make-gateway` contract; do not let UI bypass Service for meta/data calls.
- Do not generate raw `window.fetch('/api/make/...')` for Make backend calls.
- Do not hand-write `Authorization`; token mode must provide tokens through SDK options.
- `gatewayBaseUrl` is the SDK option for the Make backend API base. Reuse the host Make backend config first, especially the `makecli` `server-url` value; do not create a second environment concept for the same URL.
- `gatewayBaseUrl` is not the unified login or account-center URL. Prefer the SDK default `/api/make` for deployed same-origin Apps.
- Do not configure or hard-code unified login, Org, or account-center URLs in generated App code; make-gateway returns those URLs.
- Do not read, write, persist, or delete `zs_session` or `make_app_session` in App code.
- Do not construct Org OAuth URLs, `redirect_uri`, `state`, `code_challenge`, token exchange, or Org logout URLs in generated App code.
- Browser code cannot read `~/.make/credentials`.
- Do not silently downgrade generated Apps from unified login to token mode because local OAuth prerequisites are missing; ask for confirmation or make the local-only override explicit.
- Do not silently switch explicit token mode to unified login because a token is missing or expired.

## Pre-flight Workflow

1. Determine auth mode.
   - For generated or published Make Apps, use `unified`.
   - If the user explicitly asks for token mode, offline/local debugging, or the current environment cannot complete unified login, use `token` and state that it is a local-only override.
   - If the user asks for pure UI preview, use `mock`.
2. Read `references/sdk-integration.md` before generating or changing auth code.
3. Read the relevant mode reference unless troubleshooting requires more.
   - Default unified login: `references/unified-login-mode.md`
   - Explicit local token override: `references/local-token-mode.md`
   - 401, 403, logout: `references/logout-and-401.md`
   - Incident/debugging: `references/troubleshooting.md`
4. Read `references/service-fronted-mode.md` when the App keeps a Service layer between UI and make-gateway.
5. Read `references/request-adapter.md` whenever generating or reviewing Make backend requests.
6. Keep auth bootstrap thin. Business features must consume the project Make API adapter and auth state, not auth internals.
7. When changing generated code, add or update tests for the touched auth path: missing token, expired token, 403, logout, unified-login redirect, or business-request 401 handling.

## Reference Selection

- SDK contract and request wrapper: `references/sdk-integration.md`
- Shared request adapter and 401/403 handling: `references/request-adapter.md`
- Default unified login mode: `references/unified-login-mode.md`
- Explicit local token override: `references/local-token-mode.md`
- Service-fronted unified-login mode: `references/service-fronted-mode.md`
- 401, 403, and logout behavior: `references/logout-and-401.md`
- Auth incident diagnosis: `references/troubleshooting.md`

## Collaboration With makeui

When `makeui` is generating or editing Make App frontend code, this skill owns all authentication decisions. `makeui` may design UI states around auth results, but it must not invent OAuth, cookie, token, logout, or `/api/make/**` request logic.
