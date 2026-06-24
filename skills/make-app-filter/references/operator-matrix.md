# Operator Matrix

Use this reference when mapping Make field metadata to package operators and value editors.

## Source of truth

Use backend Record filter docs for what Make Data can accept, and package APIs for what the host UI can safely expose. The backend contract is owned by `makedsl`; read its EntityDataFilterUsage reference when you need the full contract. Do not re-create it in host UI code.

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

The package owns the exact UI matrix. The current package baseline is:

| Make field type | Filter kind | Operators | Value editor |
| --- | --- | --- | --- |
| `Make.Field.ID` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.Text` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.TextArea` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.URL` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.Number` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.Currency` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.Percent` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.SingleSelect` | singleSelect | `eq`, `neq`, `in` | select |
| `Make.Field.MultiSelect` | multiSelect | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | multi select |
| `Make.Field.SingleUser`, `Make.Field.User` | singlePerson | `eq`, `neq` | remote user select |
| `Make.Field.MultiUser` | multiPerson | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote multi-user select |
| `Make.Field.SingleDepartment`, `Make.Field.Department` | singleDepartment | `eq`, `neq` | remote department select |
| `Make.Field.MultiDepartment` | multiDepartment | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote multi-department select |
| `Make.Field.Date` | date | `eq`, `neq`, `lt`, `gt` | date picker |
| `Make.Field.DateTime` | dateTime | `eq`, `neq`, `lt`, `gt` | date-time picker |

Backend-supported but package-gated field types:

- `Make.Field.File`
- `Make.Field.DateRange`
- `Make.Field.Lookup`

The backend Record list filter supports these field types through `filter.expression`:

- File: filename contains/not-contains, attachment count comparison, empty/not-empty
- DateRange: contains date, does not contain date, fully contains, is contained by, equals, empty/not-empty
- Lookup: expression references the current Entity's Lookup field key, then backend validates operators and values against the configured `targetFieldKey` type

Expose these fields in advanced filter UI only when the installed `@qfei-design/make-filter` public APIs support the field and operator combination. If the backend supports a field but the package does not, upgrade or fix the package before exposing it; do not hand-write a host-only operator matrix, value normalizer, or CEL compiler.

Still unsupported:

- unknown field types
- fields with invalid CEL identifiers

Hide package-unsupported fields from field selectors and hide header "按该字段筛选" for them.

## Value identity rules

- Select values use option values, not display labels.
- User values use `userId`; display labels use `userName`.
- Department values use `departmentId`; display labels use `departmentName`.
- Multi-value fields use arrays of identities.
- Do not submit formatted table/detail display strings as filter values.
- Preserve non-string scalar option values such as numbers or booleans.

## Candidate sources

User and department selectors must use remote candidate sources:

- users: `GET /api/make/app/users?keyword=&page=&size=`
- departments: `GET /api/make/app/departments?keyword=&page=&size=`

Pass normalized options through package `candidateSources`:

```ts
{
  users: { options, loading, onSearch },
  departments: { options, loading, onSearch }
}
```

Use remote search. Do not filter stale local demo arrays, field schema options, current table rows, or hardcoded fixtures for production filters. Current applied values may be merged only to keep selected labels visible while remote candidates load.
