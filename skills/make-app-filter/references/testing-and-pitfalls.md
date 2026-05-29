# Testing and Pitfalls

Use this reference before finishing advanced filter work.

## Required tests

Filter model and operators:

- default field chooses first supported operator
- field change resets operator and value
- unsupported fields are excluded
- single select/user/department only expose equality operators
- multi select/user/department expose collection and empty operators
- DateRange, File, Lookup, and unknown types are skipped by default

Expression compiler:

- string escaping
- numeric comparisons
- nested group parentheses
- collection `has_any`, `not_contains`, `eq`, `neq`
- empty and not-empty for collection fields
- empty condition rows do not compile
- invalid field identifiers do not compile
- search group merges with advanced filter through `AND`

UI behavior:

- toolbar buttons remain in order: search, `筛选`, `刷新`
- opening with no conditions inserts one default draft condition
- popover renders as one white panel surface; root condition rows are not inside a second tinted/gray body container
- nested condition groups use a single light neutral group surface, not a colored card inside another colored card
- value editor and delete button are connected with no gap, no double border seam, and no rounded corner between them for select/input/number/date/user/department editors
- edits do not reload records before `确认`
- `确认` commits and closes only when validation passes
- validation failure marks invalid controls and keeps the popover open
- required value editors are marked invalid for every editor type: text, number, select, multi-select, date/date-time, user, and department
- after a failed `确认`, typing or selecting a valid value clears that control's error state immediately while other invalid rows stay marked
- field or operator changes recompute the row value and validation; operators that do not require a value clear stale value errors
- outside click discards unconfirmed draft changes
- `清空所有` clears applied filters only after confirmation
- active trigger shows `已筛选 N 个条件`

Header linkage:

- header suffix menu opens from the more icon
- outside click closes the menu
- scroll closes the menu
- active header suffix icon is `always` while its menu is open
- `按该字段筛选` closes the menu and opens advanced filter draft
- clicking header filter does not reload records before advanced filter confirmation
- unsupported fields hide header filter action

Service and integration:

- UI sends `filter: { expression }`
- empty expression omits `filter`
- Service rejects blank filter query with 400
- Service passes `filter.expression` to Make Data API
- Service still handles legacy payloads only when the host project already needs compatibility

## Common regressions

- submitting on every keystroke instead of waiting for `确认`
- closing the popover but keeping unconfirmed draft changes
- sending `filter: []` or `{}` when no valid condition exists
- showing File, DateRange, or Lookup in advanced filter without backend semantics
- using display labels instead of ids for user/department filters
- locally filtering already loaded rows instead of requesting backend-filtered records
- creating a second header-only filter state that drifts from advanced filter
- opening the header menu resets table scroll position
- table scroll leaves a floating header menu in the wrong place
- unsupported fields still show `按该字段筛选`
- error UI shows a global warning while the exact invalid control is not marked
- value select/multi-select/date/user/department controls do not turn red after `确认`
- fixed value controls remain red after the user enters or selects a valid value
- changing an operator to empty/not-empty leaves an old value error on the row
- advanced filter body has two competing backgrounds and looks split into outer/inner panels
- delete icon is rendered as a detached gray button instead of the attached final segment of the value control
- one side of the value/delete pair is rounded while the adjacent seam is also rounded
