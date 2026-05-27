# Make Data Adapter

Use this reference when implementing Service adapters that call Make platform APIs.

## Adapter ownership

The adapter layer owns Make/backend-specific details:

- base URL and path construction from runtime config
- `X-Make-Target`
- consuming already-prepared auth or forwarded request context from the host auth/runtime layer without inventing auth policy
- Make response envelope parsing
- Make API error detection
- pagination translation
- request/response shape normalization
- file upload/download body mapping

Route handlers and UI code should not know these details.

## Request wrapper

Use a shared request wrapper for Make calls.

The wrapper should:

- build the URL from normalized config and a relative path
- attach required Make headers
- send JSON or multipart bodies
- parse JSON envelopes safely
- treat non-2xx HTTP as errors
- treat Make `code !== 200` as errors
- throw a typed adapter error with path, target, status, and Make code
- log start/success/failure with redacted context

Do not duplicate Make fetch logic in each route.

## Schema adapter

Schema adapter should:

- fetch remote runtime schema from Make/backend API
- normalize app display name, entities, fields, relations, options, and lookup metadata
- support known backend variants such as `entity.properties.fields` and `entity.fields`
- expose `getAppSchema()` and `getEntityFields(entityKey)` or host-equivalent methods
- cache or reuse in-flight schema requests when the host project needs it, but provide a clear invalidation path for refresh

Do not use local DSL/YAML as the only schema source for published runtime.

## Record adapter

Record adapter should expose stable operations:

```ts
type MakeRecordAdapter = {
  listRecords(entityKey, params): Promise<{ records: unknown[]; total: number }>;
  getRecord(entityKey, recordID): Promise<unknown>;
  createRecord(entityKey, data): Promise<string>;
  updateRecord(entityKey, recordID, data): Promise<void>;
  deleteRecords(entityKey, recordIDs): Promise<unknown[]>;
};
```

Rules:

- list response normalizes total count; if backend total is missing, use returned record count as fallback
- detail uses the backend single-record operation when available
- create returns `recordID` only when that is the UI contract; otherwise document the exact response shape
- update/delete return stable success shape to routes
- skip empty filters only when the backend rejects them and document the behavior
- do not mutate formatted UI display labels into submit payloads

## User and department adapters

Default candidate adapter contracts:

```text
listUsers({ keyword, pagination }) -> { users, total }
listDepartments({ keyword, pagination }) -> { departments, total }
```

Rules:

- user id is `userId`; label is `userName`; optional avatar is `avatar`
- department id is `departmentId`; label is `departmentName`
- flatten department trees before returning selector-ready lists when UI expects flat options
- preserve backend pagination where available
- do not fabricate local candidates in production
- do not call these adapters per table cell

## Lookup options adapter/service

Lookup option service should:

1. read runtime schema
2. find the source entity and lookup field
3. resolve relation metadata and target entity
4. find the target display field
5. list target records with only needed fields
6. return `{ options: [{ label, value }], total }`

Rules:

- `value` is target `recordID`
- label comes from the target display field, with a safe fallback only when documented
- reject unsupported relation direction, non-lookup fields, and missing target metadata with 400
- do not leak full target records into dropdown APIs by default

## Lookup relation update service

Use a service layer, not a route-local helper, for editable lookup relation updates.

Rules:

- editable lookup fields require an allowlist or host policy
- read current record before updating when Make replaces all relations from submitted `qfei_relation`
- synthesize the full relation snapshot server-side
- preserve unrelated relations
- validate single vs multiple cardinality
- reject client-submitted `qfei_relation` or strip it before update
- test clearing, replacing, multi-field updates, and non-allowlisted fields

## File adapter

File adapter should expose:

```ts
uploadFiles(entityKey, recordID, fieldKey, files)
deleteFile(entityKey, recordID, fieldKey, { fileName, filePath })
downloadFile(downloadPath)
```

Rules:

- upload requires persisted `recordID`
- map host route `fieldKey` to the backend file field key expected by Make
- normalize non-ASCII multipart filenames if the backend cannot handle them
- preserve content type and extension where possible
- download proxy should stream backend status/content-type/content-disposition where safe
- redact download query strings in logs

## Forwarded headers

When the host runtime contract says Service must pass request-origin context to a gateway, the adapter may preserve standard forwarded headers from the incoming request or host proxy contract:

- `X-Forwarded-Host`
- `X-Forwarded-Proto`

The requirement for these headers belongs to `make-app-runtime`. The exact auth/session forwarding behavior belongs to `make-app-auth` when unified login or cookies are involved.
