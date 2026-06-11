# Operator Matrix

Use this reference when mapping Make field metadata to package operators and value editors.

## Source of truth

Use package APIs:

- `getFilterableFields`
- `getFieldFilterKind`
- `getOperatorsForField`
- `getDefaultOperator`
- `getDefaultFilterValue`
- `isAdvancedFilterFieldSupported`
- `operatorNeedsValue`
- `operatorUsesArrayValue`
- `readFilterOptions`

Do not duplicate the operator matrix in host code. If an old project keeps local helpers, they must delegate to the package and be covered by tests.

## Current package baseline

The package owns the exact matrix. The current Make Data API target baseline is below; a host may expose only rows that are declared by the installed package capabilities and supported by package helpers.

| Make field type | Filter kind | Operators | Value editor |
| --- | --- | --- | --- |
| `Make.Field.ID` | text | `contains`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | text input |
| `Make.Field.Text` | text | `contains`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | text input |
| `Make.Field.TextArea` | text | `contains`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | text input |
| `Make.Field.URL` | text | `contains`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | text input |
| `Make.Field.Number` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `is_empty`, `is_not_empty` | number input |
| `Make.Field.Currency` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `is_empty`, `is_not_empty` | number input |
| `Make.Field.Percent` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `is_empty`, `is_not_empty` | number input |
| `Make.Field.SingleSelect` | singleSelect | `eq`, `neq`, `is_any_of`, `is_none_of`, `is_empty`, `is_not_empty` | select |
| `Make.Field.MultiSelect` | multiSelect | `has_any`, `has_all`, `has_none`, `eq`, `neq`, `is_empty`, `is_not_empty` | multi select |
| `Make.Field.SingleUser`, `Make.Field.User` | singlePerson | `eq`, `neq`, `is_any_of`, `is_none_of`, `is_empty`, `is_not_empty` | remote user select |
| `Make.Field.MultiUser` | multiPerson | `has_any`, `has_all`, `has_none`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote multi-user select |
| `Make.Field.SingleDepartment`, `Make.Field.Department` | singleDepartment | `eq`, `neq`, `is_any_of`, `is_none_of`, `is_empty`, `is_not_empty` | remote department select |
| `Make.Field.MultiDepartment` | multiDepartment | `has_any`, `has_all`, `has_none`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote multi-department select |
| `Make.Field.Date` | date | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `is_within`, `is_not_within`, `is_empty`, `is_not_empty` | date picker or date range picker |
| `Make.Field.DateTime` | dateTime | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `is_within`, `is_not_within`, `is_empty`, `is_not_empty` | date-time picker or date-time range picker |
| `Make.Field.DateRange` | dateRange | `contains_date`, `not_contains_date`, `fully_contains`, `is_contained_by`, `eq`, `is_empty`, `is_not_empty` | date picker or date range picker |
| `Make.Field.File` | file | `contains`, `not_contains`, `gt`, `lt`, `eq`, `is_empty`, `is_not_empty` | text input for file name or number input for attachment count |
| `Make.Field.Lookup` | lookup | derive from `targetFieldKey` target field type | target-type editor |

Default unsupported cases:

- unknown field types
- fields with invalid CEL identifiers
- fields not declared by package capabilities or package support helpers
- `Make.Field.Lookup` without complete `relationKey`, `targetFieldKey`, target entity metadata, or target field metadata
- `Make.Field.Lookup` whose target field is also `Make.Field.Lookup`
- calculated or presentation-only field types that the backend does not expose for `filter.expression`, such as `Make.Field.Rollup`, `Make.Field.Count`, `Make.Field.Formula`, `Make.Field.RichText`, and `Make.Field.Cascading`

Hide unsupported fields from field selectors and hide header "按该字段筛选" for them.

## Lookup fields

Lookup fields are filterable only through the Lookup field key on the current entity. The host must not expose target-field paths such as `profile.name`, `profileName.name`, or `targetEntity.field`.

The package should choose Lookup operators from the `targetFieldKey` field type:

- Lookup to text-like target: text operators and text input.
- Lookup to number/currency/percent target: number operators and number input.
- Lookup to select/user/department target: matching scalar or collection selector behavior.
- Lookup to date/date-time/date-range target: matching date behavior.
- Lookup to file target: file operators.

Do not expose a Lookup field if package capabilities cannot resolve the target field. When multiple Lookup conditions in the same `AND` group share a relation, backend semantics require the same target record to satisfy all of them.

## Value identity rules

- Select values use option values, not display labels.
- User values use `userId`; display labels use `userName`.
- Department values use `departmentId`; display labels use `departmentName`.
- Multi-value fields use arrays of identities.
- Do not submit formatted table/detail display strings as filter values.
- Preserve non-string scalar option values such as numbers or booleans.
- DateRange values use normalized `{ begin, end }` objects.
- File `contains` and `not_contains` values are file name fragments; file count comparisons use numbers.
- Lookup values use the target field value format, while the compiled CEL field name remains the Lookup field key.

## Candidate sources

User and department selectors must use remote candidate sources:

- users: `GET /api/users?keyword=&page=&size=` or host equivalent
- departments: `GET /api/departments?keyword=&page=&size=` or host equivalent

Pass normalized options through package `candidateSources`:

```ts
{
  users: { options, loading, onSearch },
  departments: { options, loading, onSearch }
}
```

Use remote search. Do not filter stale local demo arrays, field schema options, current table rows, or hardcoded fixtures for production filters. Current applied values may be merged only to keep selected labels visible while remote candidates load.
