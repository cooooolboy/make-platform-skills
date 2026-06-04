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
- shell out to `makecli`, `npx makecli`, or read local makecli config/credentials to serve published runtime data
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
- for Make-backed record/data routes, forward the established request login context to Make gateway through the adapter; do not replace this with makecli or local credentials
- keep CORS scoped to documented UI origins in local development
- do not introduce a permissive wildcard CORS policy for generated Apps
- do not make Service listen on a wider interface as part of this skill; port/host runtime policy belongs to `make-app-runtime`

## Runtime config boundary

`make-app-service` may use config values, but does not own build/start/port contracts.

Service code should:

- read Make adapter config from `apps/service/src/config.ts` or the host equivalent
- expose a pure `loadConfig(env = process.env)` or host-equivalent function so config behavior can be unit tested without mutating global process state
- trim env strings and normalize trailing slashes before adapters consume base URLs
- avoid hard-coded Make domains in route handlers
- keep secrets out of public config
- treat `makecli` as unavailable in online Service runtime; runtime adapters use gateway/API calls, not local CLI commands

Default new-project config semantics:

- `appKey`: read deployment-injected `env.MAKE_APP_KEY`. Make-backed Services that call Make Meta/Data APIs must fail config loading when it is missing. Do not invent, hard-code, or read `appKey` from UI requests in generated production code.
- `makeApiBaseUrl`: read `env.MAKE_API_BASE_URL || env.MAKE_SERVER_URL`, trim it, and remove trailing slashes. `MAKE_API_BASE_URL` is preferred; `MAKE_SERVER_URL` is a compatibility alias.
- `makeAuthBaseUrl`: read `env.MAKE_AUTH_BASE_URL`, otherwise fall back to `makeApiBaseUrl`.
- `makeBusinessBaseUrl`: read `env.MAKE_BUSINESS_BASE_URL`, otherwise fall back to `makeApiBaseUrl`.
- `makeSchemaPath`: read `env.MAKE_SCHEMA_PATH`, otherwise use `/meta/v1/schema`.
- When `MAKE_APP_KEY` is missing, or both `MAKE_API_BASE_URL` and `MAKE_SERVER_URL` are missing in a Make-backed Service, throw a clear non-secret config error during `loadConfig`.

Recommended shape:

The `port` field may appear in the same `config.ts` because Service runtime settings are often loaded together. Its fixed value, build/start contract, and publish readiness checks still come from `make-app-runtime`; this section only defines Make adapter config semantics.

```ts
export type ServiceConfig = {
  appKey: string;
  port: number;
  makeApiBaseUrl: string;
  makeAuthBaseUrl: string;
  makeBusinessBaseUrl: string;
  makeSchemaPath: string;
};

export const loadConfig = (
  env: NodeJS.ProcessEnv = process.env,
): ServiceConfig => {
  const appKey = env.MAKE_APP_KEY?.trim();
  const makeApiBaseUrl = stripTrailingSlash(
    env.MAKE_API_BASE_URL || env.MAKE_SERVER_URL || "",
  );

  if (!appKey) {
    throw new Error("MAKE_APP_KEY is required");
  }

  if (!makeApiBaseUrl) {
    throw new Error("MAKE_API_BASE_URL or MAKE_SERVER_URL is required");
  }

  return {
    appKey,
    port: readPortFromRuntimeRule(env.PORT),
    makeApiBaseUrl,
    makeAuthBaseUrl: stripTrailingSlash(env.MAKE_AUTH_BASE_URL || makeApiBaseUrl),
    makeBusinessBaseUrl: stripTrailingSlash(
      env.MAKE_BUSINESS_BASE_URL || makeApiBaseUrl,
    ),
    makeSchemaPath: readTextEnv(env.MAKE_SCHEMA_PATH, "/meta/v1/schema"),
  };
};
```

Existing projects may keep equivalent names such as `baseUrl`, `serverUrl`, or `makeBaseUrl`, but they must preserve the same precedence and failure behavior. A local-only fallback app key is acceptable only when the host project has explicitly documented it for tests or local development; deployed readiness still requires `MAKE_APP_KEY`.

`GET /api/config` must expose only public UI config. Do not return `appKey`, Make base URLs, tokens, cookies, service keys, signed URLs, or deployment-internal route details.

If the task is to change `apps/service/src/config.ts` structure for port, build, start, or runtime artifact reasons, use `make-app-runtime`.
