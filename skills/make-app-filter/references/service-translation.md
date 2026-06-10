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

Default CEL output should stay inside the Make Data API `filter.expression` subset:

| Operator | CEL shape |
| --- | --- |
| `eq` scalar | `field == value` |
| `neq` scalar | `field != value` |
| `is_any_of` scalar | `field in [values]` |
| `is_none_of` scalar | `!(field in [values])` |
| `gt` | `field > value` |
| `gte` | `field >= value` |
| `lt` | `field < value` |
| `lte` | `field <= value` |
| `contains` | `field.contains(value)` |
| `not_contains` scalar | `!field.contains(value)` |
| `has_any` collection | `[values].exists(v, v in field)` |
| `has_all` collection | `[values].all(v, v in field)` |
| `has_none` collection | `![values].exists(v, v in field)` |
| `eq` collection | `field == [values]` |
| `neq` collection | `field != [values]` |
| `is_within` date/date-time | `field.isWithin({"begin":"2026-04-01","end":"2026-04-30"})` |
| `is_not_within` date/date-time | `field.isNotWithin({"begin":"2026-04-01","end":"2026-04-30"})` |
| `contains_date` date range | `field.containsDate("2026-04-15")` |
| `not_contains_date` date range | `field.doesNotContainDate("2026-04-15")` |
| `fully_contains` date range | `field.fullyContains({"begin":"2026-04-01","end":"2026-04-30"})` |
| `is_contained_by` date range | `field.isContainedBy({"begin":"2026-04-01","end":"2026-04-30"})` |
| `eq` date range | `field['begin'] == "2026-04-01" && field['end'] == "2026-04-30"` |
| `is_empty` scalar text | `field == null \|\| field == ""` |
| `is_not_empty` scalar text | `field != null && field != ""` |
| `is_empty` scalar non-text | `field == null` |
| `is_not_empty` scalar non-text | `field != null` |
| `is_empty` collection | `field == null \|\| size(field) == 0` |
| `is_not_empty` collection | `field != null && size(field) > 0` |
| `is_empty` date range | `field['begin'] == null \|\| field['end'] == null` |
| `is_not_empty` date range | `field['begin'] != null && field['end'] != null` |

Use JSON string escaping for literals. Number literals must be finite. Boolean literals compile to `true` or `false`.

File fields reuse `contains` / `not_contains` for file-name matching and numeric comparison operators for attachment count, for example `attachments.contains("proposal.pdf")` or `attachments > 2`.

Lookup fields compile with the Lookup field key, never a nested path. Choose the operator by the Lookup `targetFieldKey` type, for example `profileName.contains("张")` or `courseScore >= 60`.

## Safety rules

- Field keys must match `/^[A-Za-z_][A-Za-z0-9_]*$/`.
- Skip unsupported field/operator combinations instead of emitting unknown expressions.
- Skip conditions with missing field, missing operator, or empty required value.
- Skip Lookup fields when `relationKey`, `targetFieldKey`, target entity metadata, or target field metadata is missing.
- Skip Lookup fields whose target field is another Lookup.
- Do not emit scalar empty/not-empty with `size(field)`.
- Do not emit cross-object Lookup paths such as `profile.name` or `profileName.name`.

## Search and advanced filter merge

Compile keyword search separately:

```text
title.contains("客户") || description.contains("客户")
```

If both keyword search and advanced filter exist, combine with `AND`:

```text
(title.contains("客户") && status == "open")
|| (description.contains("客户") && status == "open")
```

Do not emit `(advanced expression) && (search expression)` when either side contains `OR`. Make Data API currently accepts DNF: outer `OR`, inner `AND`; it does not auto-expand `(A || B) && C`. Compile both sides to DNF clauses and distribute the `AND`.

Preserve parentheses only where they keep each DNF branch readable; do not use parentheses to send unsupported nested boolean structure.

## Service validation

Service should:

- parse JSON query params safely
- accept `{ expression }` when non-empty
- optionally normalize a raw non-blank CEL string to `{ expression }` for compatibility
- reject blank or malformed filter query with 400
- validate sort separately; do not confuse filter `fieldKey` rules with sort rules
- log only safe context, never tokens or raw signed URLs

Use `make-app-service` for route implementation and adapter tests.
