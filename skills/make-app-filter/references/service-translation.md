# Service Translation

Use this reference when compiling filters and sending them to Service.

## Contract

New Make App code sends record filters as:

```json
{
  "filter": {
    "expression": "title.contains(\"客户\")"
  }
}
```

When using a GET route, JSON-encode the filter query value.

Service should pass the same expression to Make Data API as `filter.expression`. Old object-array filter payloads may be kept for compatibility in legacy projects, but new generated code should not produce them.

If no valid expression exists, omit `filter`.

Invalid empty values:

- `filter: []`
- `filter: {}`
- `filter: { "expression": "" }`
- blank raw string

## CEL subset

Default CEL output based on ExpensePoc:

| Operator | CEL shape |
| --- | --- |
| `eq` scalar | `field == value` |
| `neq` scalar | `field != value` |
| `gt` | `field > value` |
| `gte` | `field >= value` |
| `lt` | `field < value` |
| `lte` | `field <= value` |
| `contains` | `field.contains(value)` |
| `not_contains` scalar | `!field.contains(value)` |
| `has_any` collection | `field != null && [values].exists(x, x in field)` |
| `not_contains` collection | `field == null || !([values].exists(x, x in field))` |
| `eq` collection | `field != null && size(field) == N && [values].all(x, x in field)` |
| `neq` collection | `field == null || size(field) != N || !([values].all(x, x in field))` |
| `is_empty` collection | `field == null || size(field) == 0` |
| `is_not_empty` collection | `field != null && size(field) > 0` |

Use JSON string escaping for literals. Number literals must be finite. Boolean literals compile to `true` or `false`.

## Safety rules

- Field keys must match `/^[A-Za-z_][A-Za-z0-9_]*$/`.
- Skip unsupported field/operator combinations instead of emitting unknown expressions.
- Skip conditions with missing field, missing operator, or empty required value.
- DateRange, File, Lookup, and unknown field types are not compiled by default.
- Do not emit scalar empty/not-empty with `size(field)` unless the backend explicitly supports it.

## Search and advanced filter merge

Compile keyword search separately:

```text
title.contains("客户") || description.contains("客户")
```

If both keyword search and advanced filter exist, combine with `AND`:

```text
(advanced expression) && (search expression)
```

Preserve parentheses for nested groups.

## Service validation

Service should:

- parse JSON query params safely
- accept `{ expression }` when non-empty
- optionally normalize a raw non-blank CEL string to `{ expression }` for compatibility
- reject blank or malformed filter query with 400
- validate sort separately; do not confuse filter `fieldKey` rules with sort rules
- log only safe context, never tokens or raw signed URLs

Use `make-app-service` for route implementation and adapter tests.
