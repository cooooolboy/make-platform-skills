# Testing and Safety

Use this reference before finishing Service API changes.

## Test first when changing behavior

For Service behavior changes, add or update tests before implementation when practical:

1. route contract test that fails
2. minimal implementation
3. adapter/unit tests for parsing or Make payload mapping
4. refactor while keeping tests green

If the repository has no Service test setup, add the smallest test harness consistent with the project stack or call out the blocker.

## Required test coverage

Route tests should cover:

- `/health` and `/api/config` do not expose secrets
- schema routes return normalized schema and fields
- record list parses `fields`, `filter`, `sort`, `pagination`
- invalid query/body returns 400 and does not call Make adapter
- create/update/delete/cell-update call the adapter with the documented payload
- detail uses the single-record adapter
- user and department candidates return `{ users,total }` and `{ departments,total }`
- lookup options reject non-lookup fields and return `{ options,total }`
- file upload/delete/download call the file adapter with safe path/body mapping
- custom orchestration routes cover success, unsupported input, and Make failure

Config tests should cover:

- `MAKE_APP_KEY` is required for Make-backed Services and is not replaced by an invented production default
- `MAKE_API_BASE_URL` takes precedence over `MAKE_SERVER_URL`
- `MAKE_SERVER_URL` works as a compatibility fallback
- `MAKE_AUTH_BASE_URL` and `MAKE_BUSINESS_BASE_URL` fall back to the normalized Make API base URL when absent
- base URLs are trimmed and trailing slashes are removed
- missing `MAKE_API_BASE_URL` and `MAKE_SERVER_URL` fails config loading with a non-secret error
- `/api/config` does not expose `appKey`, Make base URLs, tokens, cookies, service keys, or deployment-internal details

Adapter tests should cover:

- Make Meta/Data requests include the configured `appKey` when the backend API requires it
- route handlers do not accept `appKey` from UI query/body/header input
- Make response envelope `code !== 200`
- invalid JSON response
- non-2xx HTTP response
- headers and target names
- pagination defaults
- filter/sort translation
- file multipart body field names
- download path stripping and query redaction
- schema variant normalization

## Safety review checklist

Before reporting Service work as ready:

- `apps/docs/api.md` matches changed routes and response shapes
- no runtime code reads local DSL/YAML as required schema/data source
- no route leaks raw Make response envelopes unless documented
- invalid client input is rejected before Make calls
- no tokens, cookies, service keys, or signed URLs appear in logs or public config
- Make adapter base URLs come from normalized Service config and are not hard-coded in routes or adapters
- candidate endpoints use real host/Make data sources, not demo arrays
- lookup updates preserve unrelated relations
- file upload requires persisted record identity
- UI does not bypass Service when the host project contract is `UI -> Service -> Make Data API`
- auth/session changes were handled by `make-app-auth`
- build/start/port changes were handled by `make-app-runtime`

## Suggested commands

Use the host package manager and actual package names. Common examples:

```bash
pnpm --filter <service-package> test
pnpm --filter <service-package> build
```

When route docs changed, also run any UI/service integration tests that consume `apps/docs/api.md` or generated API clients.

## Common regressions

- route behavior changed but `apps/docs/api.md` stayed stale
- Service started reading `apps/dsl/**` at runtime because schema API was missing
- UI candidate dropdowns were backed by local demo arrays
- record detail route called list and returned the first row
- Make adapter errors were swallowed and returned `{ ok: true }`
- `qfei_relation` partial update cleared unrelated lookup relations
- file route forwarded `fieldKey` when backend expects `field`
- signed download URL query was logged
- Service route mixed auth/session handling with business API code
- runtime build or port rules were added here instead of `make-app-runtime`
