# AI Changes: make-app-auth shared adapter 401 rules

## Background

Unified-login Make Apps can enter Org login correctly during startup through `auth.init({ redirect: true })`, but runtime business requests may still receive 401 after the App shell is already rendered. If generated code only handles auth during bootstrap, schema/list/create/update/delete requests can leave users stuck in a business error state.

## Changes

- Strengthened `make-app-auth` hard rules:
  - all frontend Make backend requests must go through `auth.api`;
  - schema/meta, list, get, create, update, delete, file, lookup, user, and department requests are all covered;
  - generated apps must centralize Make backend access in a shared API adapter or data-source layer.

- Added shared adapter guidance:
  - catch `MakeAppUnauthorizedError` and `MakeAppForbiddenError` in one shared handler;
  - in unified mode, use neutral loading, try `auth.logout({ redirect: false })`, then call `auth.login({ redirect: true })`;
  - in token mode, render token-expired state and do not redirect to Org.

- Updated `makeui` boundary:
  - UI generation must delegate auth and `/api/make/**` behavior to `make-app-auth`;
  - direct `auth.api` calls should not be scattered across UI components.

## Verification

- `git diff --check`
- `rg` checks for the new shared adapter rules in `skills/make-app-auth` and `skills/makeui`
