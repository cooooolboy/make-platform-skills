# Filter Model

Use this reference when designing advanced filter state and interactions.

## Filter IR

Default Filter IR:

```ts
type AdvancedFilterLogic = "and" | "or";

type AdvancedFilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "contains"
  | "not_contains"
  | "has_any"
  | "is_empty"
  | "is_not_empty";

type AdvancedFilterValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>;

type AdvancedFilterCondition = {
  id: string;
  fieldKey: string;
  operator: AdvancedFilterOperator;
  value?: AdvancedFilterValue;
};

type AdvancedFilterGroup = {
  id: string;
  logic: AdvancedFilterLogic;
  children: Array<AdvancedFilterGroup | AdvancedFilterCondition>;
};
```

Use stable generated ids for React keys and condition updates. Keep immutable helpers for:

- `createEmptyFilterGroup`
- `createDefaultCondition`
- `appendConditionToGroup`
- `appendGroupToGroup`
- `updateConditionInGroup`
- `removeNodeFromGroup`
- `updateGroupLogic`

## Draft and submit behavior

Advanced filter uses draft editing:

- applied value lives in page state
- opening the popover copies applied value into draft
- if applied value has no children and filterable fields exist, add one default empty condition to the draft
- editing, adding, removing, and clearing affect only draft
- `确认` validates draft and commits it
- outside click or trigger re-click closes the popover and resets draft to the applied value
- validation failure keeps the popover open

Do not reload records while the user is editing draft conditions.

## Validation lifecycle

Validation is control-specific and draft-aware:

- `确认` validates every draft condition and returns errors keyed by condition id, with separate `field`, `operator`, and `value` flags.
- The row may get an invalid class for layout/testing, but the red border belongs only to the invalid control.
- A required value editor must receive its own error state when `operatorNeedsValue(operator)` is true and the value is empty.
- This includes every value editor type: text input, number input, select, multi-select, date picker, date-time picker, user selector, and department selector.
- After the first failed `确认`, each draft change revalidates the whole latest draft or at least the changed condition against the latest tree.
- When a user types a value, selects an option, changes a date, changes field, changes operator, adds/removes a row, or clears a row, stale errors must be removed immediately for controls that are now valid.
- Other rows that are still invalid remain marked; do not clear all errors just because one row changed.
- Operators that do not need values, such as empty/not-empty, must clear any stale `value` error for that condition.
- Closing the popover without commit, opening a fresh draft, clearing all, object switch, and successful confirm reset validation state.

Do not keep a `validationErrors` snapshot that only changes on the next `确认`. That causes fixed controls to stay red and makes users think valid input is still invalid.

## Active summary

Only complete conditions count as active.

Default labels:

- no active conditions: `筛选`
- active conditions: `已筛选 N 个条件`

Default active trigger style is green-tinted, matching ExpensePoc:

- border: `#8fd19e`
- background: `#eaf7ed`
- text: `#226b36`

## Search merge

Toolbar keyword search is separate from advanced filter.

Default search behavior:

- searchable field types: `Make.Field.ID`, `Make.Field.Text`, `Make.Field.TextArea`, `Make.Field.URL`
- each searchable field becomes `field.contains(keyword)`
- searchable fields are grouped with `OR`
- search group and advanced filter group are grouped with `AND`

Do not include empty search text in the compiled expression.

## Reset on object switch

When the current object/entity key changes:

- clear applied advanced filter to an empty root group
- clear search draft and applied search text
- close any advanced filter popover
- close any table header menu
- reset table object-level transient state through the table integration rules
