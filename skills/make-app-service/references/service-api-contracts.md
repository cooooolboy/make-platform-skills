# Service API Contracts

Use this reference when designing or reviewing `apps/service` routes and `apps/docs/api.md`.

## Contract source

`apps/docs/api.md` is the UI-Service contract source.

Before changing code:

1. read the existing API doc
2. identify which UI calls depend on the route
3. update the API doc with route, query/body, response, and error semantics
4. then update Service code and tests

Do not leave undocumented routes as the only integration path for generated UI.

For Make Deploy Service-fronted Apps, published browser-facing Service routes live under `/api/**` because the default HTTPRoute sends `/api` to App Service and `/` to UI. In Make App projects that use `gatewayBaseUrl: "/api/make"`, document the browser-facing paths under `/api/make/**`. Prefix-free routes such as `/app/**` or `/auth/**` may exist for local Service tests or compatibility, but they must not be the only documented or tested published path.

## Public routes

Default public routes:

- `GET /api/health` -> `{ status: "ok" }` for published App Service access
- `GET /health` -> `{ status: "ok" }` when the host uses prefix-free local health or k8s probes
- `GET /api/config` -> public config only, for example `{ listPageSize }`

Public config must not expose `appKey`, tokens, Make API base URLs, session cookies, service keys, or private deployment details.

## Auth proxy routes

For Service-fronted unified-login Apps, auth implementation details belong to `make-app-auth`, but the Service route contract must expose the browser-facing proxy paths used by the host project. For `gatewayBaseUrl: "/api/make"` projects, use `/api/make/auth/**` and `/api/make/oauth/**`; for older `/api` projects, use `/api/auth/**` and `/api/oauth/**`.

- `GET/POST /api/make/auth/**` -> transparent proxy to make-gateway auth scope
- `GET/POST /api/make/oauth/**` -> transparent proxy to make-gateway oauth scope

Rules:

- Preserve upstream status, `Set-Cookie`, `Location`, and body for auth proxy responses.
- Select the upstream gateway scope by runtime mode: local preview uses makecli resolve `make_api_origin` plus `/api/make/auth|oauth/**`; published runtime uses the k8s-internal gateway plus `/make/auth|oauth/**`.
- Do not forward `/api/make/auth/**`, `/api/make/oauth/**`, `/api/auth/**`, or `/api/oauth/**` unchanged to the internal gateway.
- If local development keeps `/auth/**`, also test the published browser-facing path.

## Schema routes

Default:

- `GET /api/schema` -> normalized `MakeAppSchema`
- `GET /api/entities/:entityKey/fields` -> normalized `MakeFieldSchema[]`

Rules:

- Normalize schema variants at the Service/API boundary before UI sees them.
- Keep entity key, entity display name, field key, field name, field type, options, relation metadata, required/read-only flags, and lookup target metadata when available.
- Do not require local DSL/YAML files to serve schema in published runtime.
- If remote schema is unavailable, return a visible error status; do not silently serve stale generated fields unless the project explicitly has an offline-dev fallback.

## Record routes

Default:

- `GET /api/entities/:entityKey/records`
  - query: `fields`, `filter`, `sort`, `pagination`
  - complex values should be JSON strings unless the host contract says otherwise
  - response: `{ records, total }`
- `GET /api/entities/:entityKey/records/:recordID` -> record
- `POST /api/entities/:entityKey/records`
  - body: `{ data }`
  - response: `{ recordID }`
- `PATCH /api/entities/:entityKey/records/:recordID`
  - body: `{ data }`
  - response: `{ ok: true }`
- `DELETE /api/entities/:entityKey/records/:recordID`
  - response: `{ ok: true }` or the host documented empty success
- `PATCH /api/entities/:entityKey/records/:recordID/cells/:fieldKey`
  - body: `{ value }`
  - response: `{ ok: true }`

Rules:

- Make-backed list and detail routes read records through the Service Make adapter calling gateway `/make/data/v1/record`, with the incoming request's login/session context forwarded to gateway.
- Do not serve record routes from `makecli`, local makecli config, makecli stdout, generated fixtures, or local DSL/YAML in published runtime.
- List and detail are separate contracts. Use Make single-record reads for detail when available.
- Validate `sort` shape. Prefer `{ fieldKey, order }`; reject ambiguous legacy `{ field, order }` in new contracts.
- Validate `filter` shape before passing to Make. New Record list contracts should use `{ expression }` for CEL-style filters and omit `filter` when no expression exists.
- Do not generate new Service contracts that send `filter: []`, `filter: {}`, blank raw strings, or old object-array DSL to Make Data. Raw non-blank CEL strings are legacy compatibility only when the host API already documents them.
- Do not infer returned fields from arbitrary UI row keys. The UI should request fields by schema keys when it needs a smaller payload.
- Create/update payloads carry raw submit values, not formatted display labels.

## Candidate routes

Default:

- `GET /api/users?keyword=&page=&size=` -> `{ users, total }`
- `GET /api/departments?keyword=&page=&size=` -> `{ departments, total }`

Rules:

- User items expose `userId`, `userName`, and optional `avatar`.
- Department items expose `departmentId`, `departmentName`, and optional hierarchy fields. Flatten nested trees when the selector expects flat options.
- UI should not provide sort controls for these candidate APIs by default. If the Make/backend adapter supports a stable sort internally, keep it in Service.
- Do not return fake demo candidates from Service unless the project is explicitly in demo/mock mode.

## Lookup option routes

Default:

- `GET /api/lookup-options?sourceEntityKey=&lookupFieldKey=&keyword=&page=&size=`
  - response: `{ options: [{ label, value }], total }`
  - `value` is the target record identity, usually `recordID`

Rules:

- Resolve target entity and display field from runtime schema relation metadata.
- Read only the target record identity and target display field by default.
- Read target records through gateway `/make/data/v1/record` with forwarded login/session context, not through makecli.
- `keyword` applies to the target display field when supported.
- Do not let UI call generic target-record list APIs for every lookup dropdown unless the host contract explicitly chooses that path.
- Reject non-lookup fields and unsupported relation directions with 400.

## Lookup relation updates

Generate lookup update routes only when the UI needs editable lookup relations and the Service can update safely.

Default optional routes:

- `PATCH /api/entities/:entityKey/records/:recordID/lookup-relations`
- `PATCH /api/entities/:entityKey/records/:recordID/lookup-relations/:lookupFieldKey`

Rules:

- Use an allowlist for editable lookup fields.
- Read the current record relation snapshot before update when Make replaces `qfei_relation` as a whole.
- Preserve unrelated relations in the submitted `qfei_relation`.
- Ignore or reject client-provided `qfei_relation`; Service should synthesize it.
- Reject unsupported cardinality, missing target records, and non-allowlisted fields with 400.

## File routes

Default:

- `POST /api/entities/:entityKey/records/:recordID/files/:fieldKey`
  - multipart field: `file`
- `DELETE /api/entities/:entityKey/records/:recordID/files/:fieldKey`
  - body: `{ fileName, filePath? }`
- `GET /api/files/download/*`
  - proxies backend file download stream

Rules:

- Upload requires a persisted `recordID`.
- Map Service route `:fieldKey` to the backend file field parameter expected by Make; do not blindly forward route param names when backend names differ.
- Normalize multipart filenames when the backend cannot handle non-ASCII filenames.
- Do not expose raw signed backend download URLs when a Service download proxy exists.
- Strip or redact signed query strings in logs.
- Attachment previews must use a browser-compatible Service proxy URL, for example the host's `/api/files/download/*` or `/api/app/files/download/*`, not raw Make Data paths such as `/data/v1/download/*`, `/make/data/v1/download/*`, or `/api/make/data/v1/download/*`.
- When the upstream Make download endpoint needs a bearer token, document that the Service validates the current App session before proxying the binary download with a Service-side token; unauthenticated requests should return 401 and failed auth checks should return a stable 5xx/contracted error.
- `/api/config` and any UI-facing file metadata response must not expose Make download tokens.

## Custom orchestration routes

Custom routes such as OCR or generated artifact creation are allowed when the user asks for them.

Rules:

- Keep them thin and testable.
- Put multi-step orchestration in `services/`, not directly in route handlers.
- Return stable UI-facing records or result objects.
- Do not make custom routes a place for unrelated business rules unless the user explicitly requested those rules.
