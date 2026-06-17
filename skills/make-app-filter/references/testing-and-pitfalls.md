# Testing and Pitfalls

Use this reference before finishing package-backed advanced filter work.

## Required tests or deterministic checks

Package source:

- `apps/ui/package.json` depends on `@qfei-design/make-filter@^0.1.4` or newer
- UI entry imports `@qfei-design/make-filter/styles.css`
- local advanced-filter shim, if any, imports from `@qfei-design/make-filter`
- host code does not contain copied operator matrix, CEL compiler/parser, validator, or `AdvancedFilterPanel` clone

Filter model and operators:

- default field chooses the package first supported operator
- field change resets operator and value through package helpers
- unsupported fields are excluded
- single select supports package operators including `in`
- multi select/user/department expose collection and empty operators
- DateRange, File, and Lookup follow package public support; if backend docs support them but the installed package does not, the UI hides them and reports the mismatch instead of compiling host-only CEL
- invalid field keys and unknown types are skipped

Expression compiler:

- string escaping
- numeric comparisons
- nested group parentheses
- DNF output: outer `OR`, inner `AND`; `(A || B) && C` is distributed or rejected before request
- collection `has_any`, `not_contains`, `eq`, `neq`
- empty and not-empty for collection fields
- DateRange/File/Lookup expressions are covered when supported by the package
- system variables are emitted only as right-hand values
- empty condition rows do not compile
- invalid field identifiers do not compile
- search group merges with advanced filter through `AND`
- `compileListFilter` returns `undefined` for no valid expression

UI behavior:

- toolbar buttons remain in order: search, `筛选`, `刷新`
- opening with no conditions inserts one default draft condition through `beginDraft`
- package panel renders inside a host-owned container
- host Popover uses max height rather than fixed initial height
- edits do not reload records before `确认`
- `确认` commits and closes only when validation passes
- validation failure marks invalid controls and keeps the popover open
- required value editors are marked invalid for text, number, select, multi-select, date/date-time, user, and department
- after a failed `确认`, typing or selecting a valid value clears that control's error state immediately while other invalid rows stay marked
- outside click discards unconfirmed draft changes
- `清空所有` clears applied filters only after confirmation
- active trigger shows `已筛选 N 个条件`

Header linkage:

- header suffix menu opens from the more icon
- unsupported fields hide `按该字段筛选`
- clicking `按该字段筛选` calls package controller `openWithField(fieldKey)` or a wrapper
- clicking header filter does not reload records before advanced filter confirmation
- outside click, table scroll, object switch, and unmount close the menu
- active header suffix icon is `always` while its menu is open

Service and integration:

- UI sends `filter: { expression }`
- empty expression omits `filter`
- Service omits or normalizes missing/null/blank `filter.expression` according to the documented route contract, and rejects malformed filter query input with 400
- Service passes `filter.expression` to Make Data API
- Service still handles legacy payloads only when the host project already needs compatibility
- URL/deep-link `advancedFilter` echoes into package panel when valid
- unsupported deep-link CEL remains backend-only fallback instead of fake UI rows

## Common regressions

- copying the old local advanced-filter implementation instead of using `@qfei-design/make-filter`
- forgetting package `styles.css`
- submitting on every keystroke instead of waiting for `确认`
- closing the popover but keeping unconfirmed draft changes
- sending `filter: []`, `{}`, `{ expression: "" }`, blank raw strings, or old object-array DSL when no valid condition exists
- hiding DateRange, File, or Lookup because old docs said backend did not support them, without checking current package and backend capabilities
- showing File, DateRange, Lookup, invalid keys, or unknown fields in advanced filter without package public support
- using display labels instead of ids for user/department filters
- locally filtering already loaded rows instead of requesting backend-filtered records
- creating a second header-only filter state that drifts from the package controller
- opening the header menu resets table scroll position
- table scroll leaves a floating header menu in the wrong place
- unsupported fields still show `按该字段筛选`
- host CSS forks package internals and breaks future package fixes
- fixed value controls remain red after the user enters or selects a valid value
- changing an operator to empty/not-empty leaves an old value error on the row
