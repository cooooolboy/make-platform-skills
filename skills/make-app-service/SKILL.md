---
name: make-app-service
description: Use when generating, refactoring, reviewing, or debugging Make App `apps/service` API code and UI-Service contracts. Covers Service route design, `apps/docs/api.md`, schema normalization APIs, record CRUD APIs through Make gateway `/data/v1/record`, user/department/lookup/file proxy APIs, Make Meta/Data API adapters, Make adapter runtime config such as `MAKE_APP_KEY` and `MAKE_API_BASE_URL`, internal make-gateway `/make` path scope, request login-context forwarding to gateway, Service error envelopes, request validation, logging, and Service API tests. Does not cover UI layout, authentication implementation, build output, Docker/K8s runtime, DSL modeling, Make CLI deployment, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/make-app-service
---

# make-app-service

Use this skill for Make App Service API work in `apps/service`.

`make-app-service` owns the Service API contract between `apps/ui` and `apps/service`, thin Make Data API orchestration, Service route shape, Make adapter runtime config semantics, request/response normalization, Service-side validation, error mapping, boundary logging, and Service API tests.

It does not own UI layout (`makeui`), authentication implementation (`make-app-auth`), runtime build/start contracts (`make-app-runtime`), DSL modeling (`makedsl`), Make CLI execution (`makecli`), or CanvasTable rendering/editing (`canvas-table-integration`).

## Quick start

1. Inspect `apps/docs/api.md`, `apps/service/src`, `apps/service/src/config.ts` or host-equivalent config entry, existing tests, and the host project's declared data flow.
2. Preserve the host API contract. Update `apps/docs/api.md` before or with any Service route or response-shape change.
3. Keep Service thin: validate UI input, normalize request/response shapes, call Make adapters, and return stable UI-facing contracts.
4. Do not read local DSL/YAML as a published runtime data source. Runtime schema and data come from Make/backend APIs or the host Service adapter.
5. Use shared adapters for Make Meta/Data calls, candidate APIs, lookup, files, and schema normalization. Build Make adapter URLs and `appKey` from normalized runtime config, not from route-local domains or UI input.
6. Add or update Service tests for every changed route, adapter, validation path, and error path.
7. Read only the needed reference files from the map below.

## Topic reference map

| Task / topic | Read |
| --- | --- |
| Service route shapes and UI-Service response contracts | `references/service-api-contracts.md` |
| Service folder structure, layering, logging, errors | `references/service-layering.md` |
| Make Data API adapter rules, schema, records, files, lookup, candidates | `references/make-data-adapter.md` |
| Test requirements, contract checks, safety review | `references/testing-and-safety.md` |
| Auth proxy, cookies, unified login, 401/403 behavior | Use `make-app-auth` |
| Service build output, port `3000`, `dist/server.js`, package scripts, publish readiness | Use `make-app-runtime` |
| UI layout, forms, detail display, visual states | Use `makeui` |
| Make field/table rendering in CanvasTable | Use `canvas-table-integration` |

## Scope boundary

- `make-app-service` defines Service-owned app APIs such as schema, records, candidates, lookup options, file proxy, and thin custom orchestration.
- It may document route names, query/body shapes, response envelopes, and adapter behavior.
- It may define Service-side Make adapter config semantics and environment variable names used by Service source, such as `MAKE_APP_KEY` and `MAKE_API_BASE_URL`, while leaving deployment injection to runtime/operations.
- It must not decide authentication implementation, OAuth/session mechanics, or `/api/make/auth/**` behavior; those belong to `make-app-auth`.
- It must not decide build output, Service port, Docker/K8s entrypoint, package scripts, workspace manifests, or publish readiness; those belong to `make-app-runtime`.
- It must not define business models, entities, field meanings, relations, or DSL YAML; those belong to `makedsl`.
- It must not decide UI layout, component choice, Drawer layout, or CanvasTable rendering; those belong to `makeui` and `canvas-table-integration`.
- It must not hard-code environment-to-domain mapping. Make API base URL, gateway routing, and secret injection come from runtime config, backend/operations, or Make tooling.

## Default Service responsibilities

Generated or refactored Make App Service code should provide these capabilities when the UI needs them and the host project does not already have equivalent routes:

- public health/config: `/health`, `/api/config`
- runtime schema: `/api/schema`, `/api/entities/:entityKey/fields`
- records: list, get, create, update, delete, cell update
- lookup options and safe lookup relation updates
- user candidates and department candidates
- file upload/delete/download proxy
- thin custom orchestration when requested, for example OCR result creation

Keep route handlers small. Put Make/backend calls in adapter modules, cross-route business orchestration in `services/`, and pure schema/value helpers in `utils/`.

## Hard rules

- `apps/docs/api.md` is the UI-Service contract source. Do not change Service route behavior without updating it.
- UI-facing APIs return stable, normalized shapes. Do not leak raw Make response envelopes unless the route contract explicitly says so.
- Service route handlers validate query/body/path params before calling Make adapters and return 400 for invalid client input.
- Service adapters own Make request details such as `appKey`, `X-Make-Target`, Make response code checks, pagination translation, file body mapping, and consuming a prepared login/session forwarding context. Auth/session mechanics and shared forwarding helpers belong to `make-app-auth`; publish/runtime proxy header contracts belong to `make-app-runtime`.
- Make-backed record read APIs must call Make gateway Data API path `/data/v1/record` through the Service Make adapter. This applies to record list, record detail, lookup target-record reads, and any custom Service route that reads Make records.
- Service Make adapters must forward the incoming request's established login context to Make gateway for Make-backed data reads and writes. At minimum, preserve the browser `Cookie` session header when the host uses cookie/unified-login auth, preserve an existing `Authorization` header only when the host contract already uses bearer auth, and apply the host gateway context headers such as `X-Forwarded-Host` and `X-Forwarded-Proto` through the shared auth/runtime helper. Do not invent auth policy here; use `make-app-auth` for auth mechanics, but do not drop the login context before calling gateway.
- Published/runtime Service APIs must never use `makecli` as a data source. Do not shell out to `makecli`, `npx makecli`, local makecli config, or makecli JSON stdout to serve schema, records, candidates, lookup options, files, or custom API data. Online Service containers do not have makecli, so runtime data must come from Make gateway/API adapters.
- Make-backed Service config must read `appKey` from deployment-injected `MAKE_APP_KEY`. Generated production code must not invent, hard-code, or accept `appKey` from UI requests.
- If `MAKE_APP_KEY` is missing for a Service that calls Make Meta/Data APIs, config loading must fail with a clear non-secret error before the Service is reported ready. Local test fixtures may inject `MAKE_APP_KEY` explicitly.
- New generated Service code reads Make adapter runtime config from `apps/service/src/config.ts` or the host equivalent. `MAKE_API_BASE_URL` is the preferred Make base URL env var; `MAKE_SERVER_URL` is a compatibility alias only.
- If neither `MAKE_API_BASE_URL` nor `MAKE_SERVER_URL` is configured for a Make-backed Service, config loading must fail with a clear non-secret error before the Service is reported ready.
- `MAKE_AUTH_BASE_URL` and `MAKE_BUSINESS_BASE_URL` may override auth/business/data forwarding bases; when absent, they fall back to the normalized Make API base URL. `MAKE_SCHEMA_PATH` defaults to `/meta/v1/schema`.
- When Service calls an internal make-gateway service, the normalized `MAKE_API_BASE_URL`, `MAKE_AUTH_BASE_URL`, and `MAKE_BUSINESS_BASE_URL` values must include the gateway `/make` path scope, for example `http://make-gateway.make-dev/make`. Do not configure a bare internal gateway host such as `http://make-gateway.make-dev` and then append `/meta/v1/**`, `/data/v1/**`, or `/auth/**`; that produces the wrong upstream URL.
- Service-to-gateway calls inside the cluster must not use the browser-facing `/api/make` prefix. `/api/make/**` belongs to same-origin browser access and Service ingress; Service internal upstream URLs must be under `/make/**`, such as `http://make-gateway.make-dev/make/meta/**`, `http://make-gateway.make-dev/make/data/**`, and `http://make-gateway.make-dev/make/auth/**`.
- Service source must not hard-code concrete Make dev/test/prod domains, infer namespace-local gateway addresses, or map deployment environments to domains.
- Runtime Service code must not require `apps/dsl/**`, `/dsl/**`, or copied `*.yaml` files to start or serve schema/data in published Apps.
- Schema APIs normalize backend schema variants before UI sees them. Handle known variants such as `entity.properties.fields`, `entity.fields`, or the host-documented equivalent at the Service/API boundary.
- Record list and detail are separate contracts. Do not implement detail by calling list and guessing the first row when a single-record Make call exists.
- User and department candidates come from Service routes such as `GET /api/users` and `GET /api/departments` or the host equivalent; do not use local demo arrays in generated Service.
- Lookup option APIs must resolve target object/field from schema metadata and return `{ options, total }`. Do not expose full target records to selector UIs by default.
- File routes proxy upload/delete/download through Service. UI should not expose raw backend file URLs when a Service download proxy is available.
- Add boundary logs at route/adapter entry, success, and failure. Redact tokens, cookies, Authorization, API keys, signed download query strings, and unnecessary personal data.
- Tests are required for route contracts, invalid input, adapter payloads, Make error mapping, and any schema/value normalization added by this skill.

## Default route baseline

Prefer these UI-Service contracts for new Make App Service projects unless the host project already documents equivalent routes:

```text
GET    /health
GET    /api/config
GET    /api/schema
GET    /api/entities/:entityKey/fields
GET    /api/entities/:entityKey/records
GET    /api/entities/:entityKey/records/:recordID
POST   /api/entities/:entityKey/records
PATCH  /api/entities/:entityKey/records/:recordID
DELETE /api/entities/:entityKey/records/:recordID
PATCH  /api/entities/:entityKey/records/:recordID/cells/:fieldKey
GET    /api/users
GET    /api/departments
GET    /api/lookup-options
POST   /api/entities/:entityKey/records/:recordID/files/:fieldKey
DELETE /api/entities/:entityKey/records/:recordID/files/:fieldKey
GET    /api/files/download/*
```

Lookup relation update routes are optional and should be generated only when the UI needs editable lookup relationships and the Service can preserve a full `qfei_relation` snapshot safely.

## Collaboration rules

- With `makeui`: this skill provides Service contracts and normalized API shapes; `makeui` decides how UI renders them.
- With `canvas-table-integration`: this skill provides schema/records/candidate APIs; table rendering and editing UI stay in the canvas skill.
- With `make-app-auth`: this skill may preserve Service-fronted app route shape, but auth proxy and session behavior stay in auth.
- With `make-app-runtime`: this skill writes Service source and tests; runtime build/start/port checks stay in runtime.
