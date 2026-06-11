# Service Translation

Use this reference when sending package filter output to Service.

## Contract

New Make App code sends record filters as:

```json
{
  "filter": {
    "expression": "title.contains(\"客户\")"
  }
}
```

Use package `compileListFilter`:

```ts
const filter = compileListFilter({
  fields,
  searchText,
  advancedFilter: appliedGroup,
});

const query = filter ? { filter } : {};
```

When using a GET route, JSON-encode the `filter` query value if the host API expects query strings.

If no valid expression exists, omit `filter`.

Invalid empty values:

- `filter: []`
- `filter: {}`
- `filter: { "expression": "" }`
- blank raw string

## CEL subset

The package owns CEL output. Do not hand-concatenate expression strings in the host.

Important current shapes:

- scalar comparisons: `field == value`, `field != value`, `field > value`
- text contains: `field.contains(value)`
- collection `has_any`: `(field != null && [values].exists(x, x in field))`
- collection empty checks are parenthesized before joining with other conditions
- search OR groups are parenthesized before merging with advanced filter through `AND`

Use `parseCelToAdvancedFilter` only for supported expression echo or deep-link compatibility. Unsupported CEL should remain backend-only fallback, not fake UI conditions.

## Safety rules

- Field keys must match the package field-key pattern.
- Unsupported field/operator combinations compile to no expression.
- Conditions with missing field, operator, or required value compile to no expression.
- DateRange, File, Lookup, and unknown field types are not compiled by default.
- Do not emit scalar empty/not-empty with `size(field)` unless backend semantics are explicitly added to the package.

## Service validation

Service should:

- parse JSON query params safely
- accept `{ expression }` when non-empty
- optionally normalize a raw non-blank CEL string only for legacy compatibility
- reject blank or malformed filter query with 400
- validate sort separately; do not confuse filter `fieldKey` rules with sort rules
- log only safe context, never tokens or raw signed URLs

Use `make-app-service` for route implementation, adapter logging, and Service tests.
