# Filter Model

Use this reference when applying package filter state, draft behavior, search merge, and URL/deep-link echo.

## Source of truth

Use `@qfei-design/make-filter` for the Filter IR and helpers:

- `AdvancedFilterGroup`
- `AdvancedFilterCondition`
- `createEmptyFilterGroup`
- `createDefaultCondition`
- `appendConditionToGroup`
- `appendGroupToGroup`
- `updateConditionInGroup`
- `removeNodeFromGroup`
- `updateGroupLogic`
- `cloneFilterGroup`
- `validateAdvancedFilter`
- `countActiveFilterConditions`

Do not hand-write these helpers in a Make App host. A migration shim is allowed only when it delegates to the package.

## Draft and submit behavior

Use `useAdvancedFilterController` for draft lifecycle:

- applied value lives in page state
- opening the host popover calls `beginDraft`
- opening with no conditions and available fields inserts one default draft condition
- editing, adding, removing, and clearing affect only draft
- `confirm` validates draft and commits only when valid
- closing without commit calls `resetDraft`
- validation failure keeps the popover open
- `openWithField(fieldKey)` appends one draft condition for header filtering

Do not reload records while the user is editing draft conditions.

## Validation lifecycle

The package returns control-level errors keyed by condition id. The host must pass `validationErrors` into `AdvancedFilterPanel`.

Required behavior:

- invalid field/operator/value controls show their own error state
- required value controls cover text, number, select, multi-select, date, date-time, user, and department editors
- after the first failed `确认`, draft changes clear fixed control errors immediately while keeping other invalid rows marked
- operators that do not need values clear stale value errors
- successful confirm, reset, object switch, and fresh open reset validation state

Do not add a host-only `validationErrors` snapshot that only updates on the next confirm.

## Active summary

Use package summary/count helpers or a shim that delegates to them.

Default trigger labels:

- no active conditions: `筛选`
- active conditions: `已筛选 N 个条件`

Default active trigger style remains green-tinted from the current Make UI baseline.

## Search merge

Toolbar keyword search is separate from advanced filter UI state. Use `compileListFilter`:

```ts
const filter = compileListFilter({
  fields,
  searchText,
  advancedFilter: appliedGroup,
});
```

Searchable defaults are package-owned. At the current baseline, text-like fields such as ID, Text, TextArea, and URL are searched with `contains`, grouped with `OR`, then combined with advanced filter through `AND`.

Do not manually concatenate CEL strings in the host.

## URL and deep-link echo

If the host supports URL filter params, prefer this shape:

```json
{
  "advancedFilter": { "id": "root", "logic": "and", "children": [] },
  "expression": "status == \"active\""
}
```

Rules:

- `advancedFilter` is the preferred UI echo source.
- `expression` may be included as a startup fallback while schema fields are still loading.
- When only a supported CEL expression exists, use `parseCelToAdvancedFilter` to echo it into the panel.
- If parsing returns unsupported, keep the expression as backend-only fallback and do not render fake UI conditions.
- After user edits search or advanced filter manually, clear one-off external/backend-only filter state unless the product explicitly wants it preserved.

## Reset on object switch

When the current object/entity key changes:

- clear applied advanced filter to an empty root group
- clear search draft and applied search text
- close any advanced filter popover
- close any table header menu
- reset table object-level transient state through `canvas-table-integration`
