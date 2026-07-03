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
- old object/array DSL such as `filter: [{...}]`

## CEL subset

The package owns CEL output. Do not hand-concatenate expression strings in the host.

Backend Record list currently accepts a constrained CEL subset parsed as DNF: outer `OR` groups, inner `AND` predicates. Do not emit `(A || B) && C`; distribute to `(A && C) || (B && C)` through package helpers.

Important current shapes:

- scalar comparisons: `field == value`, `field != value`, `field > value`
- text contains: `field.contains(value)`
- collection `has_any`: `(field != null && [values].exists(x, x in field))`
- collection empty checks are parenthesized before joining with other conditions
- search OR groups are parenthesized before merging with advanced filter through `AND`
- system variables are right-hand values such as `_currentUser`, `_currentUserDepartment`, `_today`, or `_now`; do not use them as field keys
- DateRange, File, and Lookup are backend-supported when the package emits supported field/operator expressions

Use `parseCelToAdvancedFilter` only for supported expression echo or deep-link compatibility. Unsupported CEL should remain backend-only fallback, not fake UI conditions.

## Safety rules

- Field keys must match the package field-key pattern.
- Unsupported field/operator combinations compile to no expression.
- Conditions with missing field, operator, or required value compile to no expression.
- DateRange, File, and Lookup may be exposed only when the installed package publicly supports their field/operator semantics. Unknown field types are not compiled.
- Empty/not-empty expressions must follow backend field-type semantics. Do not invent `size(field)` forms for scalar fields or target-field paths for Lookup.
- Lookup filters reference the Lookup field key on the current Entity, not `lookupField.targetField`, `targetEntity.field`, or other cross-object paths.

## Service validation

Service should:

- parse JSON query params safely
- accept `{ expression }` when non-empty
- treat missing, `null`, or blank `filter.expression` as no filter when matching the backend contract
- optionally normalize a raw non-blank CEL string only when the host project already needs legacy compatibility
- reject malformed filter query values with 400; reject blank raw string query values when the route documents raw strings as invalid client input
- validate sort separately; do not confuse filter `fieldKey` rules with sort rules
- log only safe context, never tokens or raw signed URLs

Use `make-app-service` for route implementation, adapter logging, and Service tests.
