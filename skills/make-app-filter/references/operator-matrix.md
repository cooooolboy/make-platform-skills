# Operator Matrix

Use this reference when mapping Make field metadata to advanced filter operators and value editors.

## Default supported fields

Default support should follow the Make Data API `filter.expression` field semantics:

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
| `Make.Field.SingleUser`, `Make.Field.User` | singlePerson | `eq`, `neq`, `is_any_of`, `is_none_of`, `is_empty`, `is_not_empty` | remote searchable user select |
| `Make.Field.MultiUser` | multiPerson | `has_any`, `has_all`, `has_none`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote searchable multi-user select |
| `Make.Field.SingleDepartment`, `Make.Field.Department` | singleDepartment | `eq`, `neq`, `is_any_of`, `is_none_of`, `is_empty`, `is_not_empty` | remote searchable department select |
| `Make.Field.MultiDepartment` | multiDepartment | `has_any`, `has_all`, `has_none`, `eq`, `neq`, `is_empty`, `is_not_empty` | remote searchable multi-department select |
| `Make.Field.Date` | date | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `is_within`, `is_not_within`, `is_empty`, `is_not_empty` | date picker or date range picker |
| `Make.Field.DateTime` | dateTime | `eq`, `neq`, `lt`, `lte`, `gt`, `gte`, `is_within`, `is_not_within`, `is_empty`, `is_not_empty` | date/time picker or date-time range picker |
| `Make.Field.DateRange` | dateRange | `contains_date`, `not_contains_date`, `fully_contains`, `is_contained_by`, `eq`, `is_empty`, `is_not_empty` | date picker or date range picker |
| `Make.Field.File` | file | `contains`, `not_contains`, `gt`, `lt`, `eq`, `is_empty`, `is_not_empty` | text input for file name or number input for attachment count |
| `Make.Field.Lookup` | lookup | derive from `targetFieldKey` target field type | target-type editor |

Default unsupported fields:

- unknown field types
- `Make.Field.Lookup` when `relationKey`, `targetFieldKey`, target entity metadata, or target field metadata is missing
- `Make.Field.Lookup` whose target field is also `Make.Field.Lookup`
- calculated or presentation-only field types that the backend does not expose for `filter.expression`, such as rollup/count/formula/rich-text/cascading

Hide unsupported fields from field selectors and hide the table header "按该字段筛选" action for them. Do not generate partial or guessed filter semantics for unsupported fields.

## Lookup fields

Lookup fields are filterable through the Lookup field key on the current entity. The UI must not expose cross-object paths such as `profile.name` or `profileName.name`.

Operator selection for Lookup follows the `targetFieldKey` field type:

- Lookup to text-like target: use text operators and text input.
- Lookup to number/currency/percent target: use number operators and number input.
- Lookup to select/user/department target: use the matching scalar or collection selector behavior.
- Lookup to date/date-time/date-range target: use the matching date behavior.
- Lookup to file target: use file operators.

Do not expose a Lookup field if the target field is another Lookup. When multiple Lookup conditions in the same `AND` group share a relation, backend semantics require the same target record to satisfy all of them.

## Operator labels

Default Chinese labels:

- text: `包含`, `不包含`, `等于`, `不等于`, `为空`, `不为空`
- number: `等于`, `不等于`, `大于`, `大于等于`, `小于`, `小于等于`, `为空`, `不为空`
- single select/person/department: `是`, `不是`, `是任一`, `不是任一`, `为空`, `不为空`
- multi select: `包含任一`, `包含全部`, `不包含任一`, `等于`, `不等于`, `为空`, `不为空`
- multi person: `人员包含任一`, `人员包含全部`, `人员不包含任一`, `等于`, `不等于`, `为空`, `不为空`
- multi department: `部门包含任一`, `部门包含全部`, `部门不包含任一`, `等于`, `不等于`, `为空`, `不为空`
- date/date-time: `等于`, `不等于`, `早于`, `早于等于`, `晚于`, `晚于等于`, `在区间内`, `不在区间内`, `为空`, `不为空`
- date range: `包含日期`, `不包含日期`, `完整包含区间`, `被区间包含`, `等于`, `为空`, `不为空`
- file: `文件名包含`, `文件名不包含`, `附件数大于`, `附件数小于`, `附件数等于`, `为空`, `不为空`

## Default operator and value

When a field changes:

1. select the first operator from that field's operator list
2. reset value based on field kind and operator

Default value rules:

- operators `is_empty` and `is_not_empty` need no value
- array-value operators use `[]`
- range operators use `{ begin: "", end: "" }`
- number fields use `undefined`
- other scalar fields use `""`

## Value identity rules

- Select values should use option values, not display labels.
- User values should use `userId`; display labels use `userName`.
- Department values should use `departmentId`; display labels use `departmentName`.
- Multi-value fields use arrays of identities.
- Do not submit formatted table/detail display strings as filter values.
- DateRange values use the normalized `{ begin, end }` object.
- File `contains` and `not_contains` values are file name fragments; file count comparisons use numbers.
- Lookup values use the target field value format, while the compiled CEL field name remains the Lookup field key.

## Candidate sources

User and department selector controls must use remote candidate sources. Keep the behavior contract when route names are provided through host equivalent routes:

- users: `GET /api/users?keyword=&page=&size=` or host equivalent
- departments: `GET /api/departments?keyword=&page=&size=` or host equivalent

Use remote search; do not filter stale local demo arrays, field schema options, current table rows, or hardcoded fixtures for production filters. Current applied values may be merged only to keep selected labels visible while remote candidates load.
