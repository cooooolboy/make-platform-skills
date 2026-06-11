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

Important expected shapes from package output:

- scalar comparisons: `field == value`, `field != value`, `field > value`
- scalar list membership: `field in [values]`, `!(field in [values])`
- text contains: `field.contains(value)`
- collection operators: `[values].exists(v, v in field)`, `[values].all(v, v in field)`, `![values].exists(v, v in field)`
- date/date-time ranges: `field.isWithin({"begin":"2026-04-01","end":"2026-04-30"})`, `field.isNotWithin({...})`
- DateRange methods: `field.containsDate("2026-04-15")`, `field.doesNotContainDate(...)`, `field.fullyContains({...})`, `field.isContainedBy({...})`
- File fields: `attachments.contains("proposal.pdf")`, `attachments > 2`, `attachments == 1`
- Lookup fields: `profileName.contains("张")`, `courseScore >= 60`; compile the Lookup field key, never a target-field path
- empty checks use the field-type shapes from AgenticDSL, such as scalar `field == null`, text `field == null || field == ""`, collection `field == null || size(field) == 0`, and DateRange `field['begin'] == null || field['end'] == null`

Search and advanced filter merge must be DNF-safe. Do not emit `(A || B) && C`; distribute the `AND` into outer `OR` branches before sending to Make Data API:

```text
(title.contains("客户") && status == "open")
|| (description.contains("客户") && status == "open")
```

Use `parseCelToAdvancedFilter` only for supported expression echo or deep-link compatibility. Unsupported CEL should remain backend-only fallback, not fake UI conditions.

## Safety rules

- Field keys must match the package field-key pattern.
- Unsupported field/operator combinations compile to no expression.
- Conditions with missing field, operator, or required value compile to no expression.
- DateRange, File, and Lookup compile only when package capabilities declare support. If a host needs them but the installed package cannot compile them, stop and require a package upgrade or capability update.
- Unknown field types, invalid field keys, incomplete Lookup metadata, Lookup-to-Lookup targets, and calculated/presentation-only field types compile to no expression.
- Do not emit scalar empty/not-empty with `size(field)`.
- Do not emit Lookup cross-object paths such as `profile.name`, `profileName.name`, or `targetEntity.field`.

## Service validation

Service should:

- parse JSON query params safely
- accept `{ expression }` when non-empty
- optionally normalize a raw non-blank CEL string only for legacy compatibility
- reject blank or malformed filter query with 400
- validate sort separately; do not confuse filter `fieldKey` rules with sort rules
- log only safe context, never tokens or raw signed URLs

Use `make-app-service` for route implementation, adapter logging, and Service tests.
