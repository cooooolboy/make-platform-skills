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
- edits do not reload records before `确认`
- `确认` commits and closes only when validation passes
- validation failure marks invalid controls and keeps the popover open
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
