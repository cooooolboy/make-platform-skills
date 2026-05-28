# Operator Matrix

Use this reference when mapping Make field metadata to advanced filter operators and value editors.

## Default supported fields

ExpensePoc default support:

| Make field type | Filter kind | Operators | Value editor |
| --- | --- | --- | --- |
| `Make.Field.ID` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.Text` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.TextArea` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.URL` | text | `contains`, `not_contains`, `eq`, `neq` | text input |
| `Make.Field.Number` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.Currency` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.Percent` | number | `eq`, `neq`, `gt`, `gte`, `lt`, `lte` | number input |
| `Make.Field.SingleSelect` | singleSelect | `eq`, `neq` | select |
| `Make.Field.MultiSelect` | multiSelect | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | multi select |
| `Make.Field.SingleUser`, `Make.Field.User` | singlePerson | `eq`, `neq` | remote searchable user select |
| `Make.Field.MultiUser` | multiPerson | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote searchable multi-user select |
| `Make.Field.SingleDepartment`, `Make.Field.Department` | singleDepartment | `eq`, `neq` | remote searchable department select |
| `Make.Field.MultiDepartment` | multiDepartment | `has_any`, `not_contains`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote searchable multi-department select |
| `Make.Field.Date` | date | `eq`, `neq`, `lt`, `gt` | date picker |
| `Make.Field.DateTime` | date | `eq`, `neq`, `lt`, `gt` | date/time picker if supported by UI library |

Default unsupported fields:

- `Make.Field.File`
- `Make.Field.DateRange`
- `Make.Field.Lookup`
- unknown field types

Hide unsupported fields from field selectors and hide the table header "按该字段筛选" action for them. Do not generate partial or guessed filter semantics for unsupported fields.

## Operator labels

Default Chinese labels:

- text: `包含`, `不包含`, `等于`, `不等于`
- number: `等于`, `不等于`, `大于`, `大于等于`, `小于`, `小于等于`
- single select: `是`, `不是`
- multi select: `包含任一`, `不包含`, `等于`, `不等于`, `为空`, `不为空`
- single person/department: `等于`, `不等于`
- multi person: `人员包含`, `人员均不包含`, `等于`, `不等于`, `为空`, `不为空`
- multi department: `部门包含`, `部门均不包含`, `等于`, `不等于`, `为空`, `不为空`
- date/date-time: `等于`, `不等于`, `早于`, `晚于`

## Default operator and value

When a field changes:

1. select the first operator from that field's operator list
2. reset value based on field kind and operator

Default value rules:

- operators `is_empty` and `is_not_empty` need no value
- array-value operators use `[]`
- collection `eq`, `neq`, and collection `not_contains` use `[]`
- number fields use `undefined`
- other scalar fields use `""`

## Value identity rules

- Select values should use option values, not display labels.
- User values should use `userId`; display labels use `userName`.
- Department values should use `departmentId`; display labels use `departmentName`.
- Multi-value fields use arrays of identities.
- Do not submit formatted table/detail display strings as filter values.

## Candidate sources

User and department selector controls must use remote candidate sources:

- users: `GET /api/users?keyword=&page=&size=` or host equivalent
- departments: `GET /api/departments?keyword=&page=&size=` or host equivalent

Use remote search; do not filter stale local demo arrays, field schema options, current table rows, or hardcoded fixtures for production filters. Current applied values may be merged only to keep selected labels visible while remote candidates load.
