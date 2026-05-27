# Service Layering

Use this reference when structuring `apps/service/src` code.

## Default folder responsibilities

Preserve existing project structure when it already separates these concerns. For new projects, prefer:

```text
apps/service/src/
  app.ts
  server.ts
  config.ts
  logger.ts
  routes/ or app route registration
  make-client/
  services/
  utils/
```

Responsibilities:

- `server.ts`: load config, create app, listen. Runtime entry/build details belong to `make-app-runtime`.
- `app.ts` or `routes/`: Express/Fastify route registration, request parsing, response sending, error middleware.
- `config.ts`: read runtime config; do not decide environment-to-domain mapping in code.
- `logger.ts`: safe logging/redaction.
- `make-client/`: Make/backend adapter functions.
- `services/`: multi-step orchestration such as lookup relation updates or OCR result creation.
- `utils/`: pure helpers for schema identity, display name resolution, value normalization, and validation.

## Route handler rules

Route handlers should:

- parse and validate path/query/body input
- call a service or Make adapter
- send the documented response shape
- log boundary start/success/failure with safe context
- delegate errors to common error middleware

Route handlers should not:

- build raw Make request bodies inline for every route
- parse schema variants repeatedly in JSX-like or route-local code
- call local DSL/YAML files for published runtime schema
- contain large multi-step business workflows
- swallow adapter errors and return empty success

## Error mapping

Use consistent errors:

- invalid client input -> `400 BAD_REQUEST`
- missing/expired auth/session -> owned by `make-app-auth`
- forbidden app/business access -> `403` when Service owns the check
- not found -> `404` when the record/entity is known missing
- Make/backend failure -> `502` or a documented Service error status
- unexpected Service error -> `500`

Default error body:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Request body must include a data object"
  }
}
```

If the host project already uses `{ code, message }` or another shape, preserve it and document it in `apps/docs/api.md`.

Do not expose backend stack traces, tokens, signed URLs, raw cookies, or internal config in error responses.

## Logging

Add logs at boundary functions:

- route start/success/failure
- Make adapter request start/success/failure
- key orchestration branches such as lookup relation snapshot merge

Safe log context:

- app/entity/field keys
- record id
- request path without signed query
- pagination sizes
- counts and status codes

Do not log:

- `Authorization`
- cookies/session values
- tokens/API keys
- full signed download URLs
- uploaded file contents
- unnecessary personal data

## Security and local exposure

The Service API may be a local dev proxy or deployed app backend. Preserve the host mode.

Default guidance:

- keep `/health` and `/api/config` public
- protect Make-backed `/api/*` routes when the host project has a Service API key or auth middleware
- keep CORS scoped to documented UI origins in local development
- do not introduce a permissive wildcard CORS policy for generated Apps
- do not make Service listen on a wider interface as part of this skill; port/host runtime policy belongs to `make-app-runtime`

## Runtime config boundary

`make-app-service` may use config values, but does not own build/start/port contracts.

Service code should:

- read Make adapter config from `config.ts` or the host equivalent
- trim env strings and normalize trailing slashes in adapters
- avoid hard-coded Make domains in route handlers
- keep secrets out of public config

If the task is to change `apps/service/src/config.ts` structure for port, build, start, or runtime artifact reasons, use `make-app-runtime`.
