# Make Field Display Patterns

Use this reference when a canvas-table page must display Make platform schema fields and backend values. This is display guidance, not an editing contract.

## Goal

Turn schema fields plus raw backend values into stable canvas-table display:

1. schema field -> column config
2. raw value -> normalized display value
3. display group -> focused canvas renderer

Keep the adapter pure. Keep I/O such as option, department, or user candidate loading outside cell renderers.

## Default Make Schema Table Baseline

For new Make App projects, any Make schema-driven business table should follow this ExpensePoc-derived display baseline unless the user explicitly asks for a different table style.

Default structure:

- use `@qfei-design/canvas-table` as the table implementation; this baseline is not for UI-library tables
- wait for runtime schema fields before creating or updating the table columns
- derive `IColumn[]` from runtime schema fields, not from a hand-maintained static column list
- keep `fieldType`, `fieldSchema`, and `renderKind` or equivalent metadata on each generated column
- keep business ordering or primary-link roles as a thin config layer; generic rendering still branches by field type
- normalize each raw cell value once through a pure field-display adapter before rendering
- route normalized display groups to focused canvas renderers: `text`, `tag`, `user`, `attachment`, `lookup`, and generic fallback
- keep option, user, department, file, and lookup candidate loading in hooks/data sources; never fetch from a cell renderer
- keep `showSN` sequence numbers and the hover-revealed row detail entry through `bodyRowHeadSuffixOptions`

Default visual rules:

- text/link cells use 14px sans-serif text, 8px horizontal padding, `#1f2937`, ellipsis, and tooltip on overflow
- empty values render muted `-` with `#9ca3af`
- clickable text, safe URLs, and openable lookup references use `#1677ff`
- number, currency, and percent cells are right-aligned
- tags are 22px tall, 4px radius, 12px text, 8px horizontal text padding, and use `+N` overflow when space runs out
- select tags use `#eef4ff` background and `#1677ff` text
- department tags use `#f2f4f7` background and `#344054` text
- user values render a 22px avatar, fallback deterministic color circle with the last two name characters, name text, and `+N` overflow
- file values render 22px image thumbnails for images, otherwise a 22px file-extension block, and `+N` overflow
- lookup references render blue clickable text only when entity + `recordID` exist and the reference is not deleted; deleted references render muted with strikethrough

## Initialization Contract

Before constructing `CanvasTableComponent` or rendering a project wrapper around it for a Make schema table:

1. load the runtime schema fields from the host API
2. normalize and de-duplicate schema fields by stable field key
3. build `IColumn[]` from schema field type, width, alignment, ellipsis, and renderer kind
4. prepare a render registry by display group
5. keep a pure value adapter available to every render callback
6. pass `showSN` and `bodyRowHeadSuffixOptions` unless explicitly disabled

Do not initialize a Make schema table from `Object.keys(row)` or temporary generic text columns while schema is loading. Show loading/error/empty chrome around the canvas host until schema is ready.

## Suggested Ownership

Use these folders when the host project does not already have a clearer structure:

- `config/`: schema-to-column mapping, width, alignment, `renderKind`, `showEllipsis`
- `renderers/`: canvas shape renderers by display group
- `hooks/`: preloaded display data, for example department candidates
- `types/`: shared display/table contracts
- `lib/`, `adapters/`, or `field-display/`: pure field display normalization

Do not force these exact names into an existing codebase if it already separates responsibilities clearly.

## Display Model

A useful display adapter returns a small object like:

```ts
type FieldDisplayValue = {
  group: "text" | "url" | "number" | "date" | "select" | "user" | "department" | "file" | "lookup" | "unknown";
  kind: string;
  text: string;
  labels: string[];
  empty: boolean;
  href?: string;
  attachments: AttachmentDisplayItem[];
  users: UserDisplayItem[];
  lookupReferences: LookupReferenceItem[];
};
```

The exact type name can change. The important part is that renderers do not parse backend objects directly.

## Supported Field Types

The current backend supports these 18 field types. Treat this list as the current contract, with a safe fallback for unknown future types.

| Field type | Group | Expected value formats | Display behavior |
| --- | --- | --- | --- |
| `Make.Field.ID` | text | primitive, object fallback | text with ellipsis |
| `Make.Field.Text` | text | string/number/boolean/object | text with ellipsis |
| `Make.Field.TextArea` | text | string/object | wider text column, ellipsis + tooltip |
| `Make.Field.URL` | url | string or `{ href/url/value, label/name }` | clickable text only for safe hrefs |
| `Make.Field.Number` | number | number or numeric string | right-aligned number text |
| `Make.Field.Currency` | number | number or numeric string | currency text, default symbol can be host-defined |
| `Make.Field.Percent` | number | number or numeric string | percent text |
| `Make.Field.Date` | date | parseable date string/value | `YYYY-MM-DD` or host date format |
| `Make.Field.DateTime` | date | parseable date-time string/value | `YYYY-MM-DD HH:mm` or host date-time format |
| `Make.Field.DateRange` | date | `[begin,end]` or `{ begin/end/start/from/to }` | join non-empty endpoints |
| `Make.Field.SingleSelect` | select | raw value, option object, one-item array | tag label from `properties.options`, fallback raw value |
| `Make.Field.MultiSelect` | select | array of raw values/option objects | tag list with `+N` overflow |
| `Make.Field.SingleUser` | user | object or backend one-item array | avatar/name renderer |
| `Make.Field.MultiUser` | user | array of user objects | avatar/name list with `+N` overflow |
| `Make.Field.SingleDepartment` | department | object or id/string | department tag |
| `Make.Field.MultiDepartment` | department | array of objects/ids | department tag list with `+N` overflow |
| `Make.Field.File` | file | URL string, JSON string, object, or array | thumbnail/file icon list with overflow count |
| `Make.Field.Lookup` | lookup | object/JSON, often `{ entity, field, data }` | extract labels from `data`, then tag/text fallback |

## Value Extraction Rules

Use tolerant extraction. Do not fail the cell because one key is absent.

- generic object label priority: `label`, `name`, `title`, `displayName`, `value`
- select labels: `field.properties.options[]` with `{ value, label }`, fallback to raw value
- user label priority: `name`, `userName`, `displayName`, `label`, `userId`, `id`, `recordID`
- user identity priority: `recordID`, `userId`, `id`; fallback to name for display-only avatar color
- user avatar priority: `avatar`, `avatarM`, `avatarL`, `avatarS`, `avatarOrigin`, `userAvatar`
- department label priority: `name`, `departmentName`, `displayName`, `label`, `departmentId`, `id`, `recordID`
- URL href priority: `href`, `url`, `value`; text priority: `label`, `name`, href
- attachment URL priority: string value, `url`, `fileURL`; allow `http(s)`, absolute app paths, protocol-relative URLs, `data:`, and `blob:` for local previews
- attachment name priority: `name`, `fileName`, filename from URL
- attachment metadata: `uid`, `filePath`, `size`, `fileSizeInBytes`, `type`, optional local `File`
- lookup wrapper: if object or JSON string has `data`, extract labels from `data`; if `data` is empty, show empty
- lookup references: when `data` items contain target entity, `recordID`, display value, and deletion status, normalize those into explicit reference items before rendering. Only clickable references with entity + `recordID` and not-deleted status should trigger detail navigation.

## Renderer Guidance

Keep renderers focused and canvas-only:

- `text` / `number` / `date` / unknown: `TextShape`, ellipsis, tooltip on overflow, muted `-` for empty
- `url`: validate href; render clickable text only for safe `http(s)`, protocol-relative, or absolute app paths
- `select` and `department`: tag renderer; reserve room for `+N`; tooltip can contain full label list
- `user`: avatar image if present, otherwise deterministic color circle plus short name; render name with ellipsis; use `+N` for hidden users
- `file`: image attachments use `ImgShape`; other files use a file icon/extension block; bind click to open safe URL; show `+N` only when width cannot fit all visible items
- `lookup`: after normalization, usually reuse tag or text rendering
- clickable lookup text should use shape-level click handlers only for valid reference items; missing `recordID` or deleted references render as plain text

Use package text utilities such as `textEllipsis` and `getTextWidth` when available. Add an estimate fallback so unit tests and non-browser environments do not break.

## Column Defaults

Reasonable starting widths:

- number/currency/percent: 120, right-aligned
- date: 140
- date-time, lookup, multi-select, multi-user, multi-department: 180
- URL and date range: 220
- file: 150, no built-in text ellipsis because custom renderer owns overflow
- text area: 240
- default: 160

These widths are starting points, not a design law. Tune them to the host layout.

## Testing

Add focused tests before or with implementation:

- field type -> display group/kind mapping covers all 18 supported types
- table initialization waits for schema fields and never infers Make columns from row keys
- Make schema table defaults include `showSN` and `bodyRowHeadSuffixOptions` unless explicitly disabled
- backend variants: primitive, object, array, JSON string, empty value
- select option label fallback
- user backend shapes with `name`, `userName`, `recordID`, `userId`, and avatar keys
- department backend shapes with `name`, `departmentName`, `recordID`, and tree/candidate data when relevant
- file URL/object/JSON normalization and image vs file rendering
- lookup `{ entity, field, data }` object and JSON-string wrappers
- renderer overflow: tags, users, attachments, and lookup references keep a visible `+N`
- empty values render `-` without throwing

Mock canvas-table shapes in unit tests when the host test environment cannot draw real canvas.

## Pitfalls

- Do not parse backend values inside every column render callback. Normalize once through the display adapter.
- Do not initialize Make schema tables before schema fields are available.
- Do not infer Make columns from returned row object keys.
- Do not branch generic display behavior by business field name. Field names are only for explicit business roles, such as a claim number link.
- Do not let custom renderers fetch data per cell.
- Do not flatten select, user, department, file, or lookup values into plain text when the schema type supports richer default rendering.
- Do not render raw JSON wrapper text when a label can be extracted.
- Do not make this display adapter responsible for edit/submit payload conversion.
- Do not crash on unknown field types. Use safe generic text fallback and log only at a boundary if needed.
