# edit common pitfalls

Read this file before finalizing a canvas-table cell-edit integration.

## 1. Putting everything inside `customEdit`

Symptom:

- one large callback handles field detection, saving, rollback, outside-click, API calls, and UI logic

Fix:

- split responsibilities into edit controller, editor container, field editors, and save layer

## 2. Forcing a new UI library into the project

Symptom:

- the editor path ignores the project's existing components and adds a new library without need

Fix:

- first inspect the current project and reuse existing business/UI components

## 3. Mixing display value and submit value

Symptom:

- select/person/department/attachment editors save the wrong shape

Fix:

- explicitly separate display-friendly values from API submission values

## 4. Treating all field editors as the same interaction model

Symptom:

- text, date, select, attachment, and people pickers all use the same close/save policy

Fix:

- distinguish submit-style editors from realtime-style editors

## 5. Ignoring scroll-follow behavior

Symptom:

- the editor opens correctly, then drifts away from the cell while scrolling

Fix:

- update editor position during scroll and respect fixed-column behavior

## 6. Blindly closing on outside click

Symptom:

- complex editors lose changes or close in the middle of host-controlled interaction

Fix:

- outside-click should usually flow through value extraction, validation, save/rollback, and reset
- popup roots should be declared with `relatedElements()` before adding host-owned global listeners

## 7. No stable editor interface

Symptom:

- each field editor exposes different methods or none at all

Fix:

- normalize around a shared interface such as `focus()` and `updateVal()`

## 8. Letting canvas-table write before the business layer accepts the value

Symptom:

- draft save or immediate API save fails, but the canvas cell already shows the new value
- rollback has to fight table-internal row data

Fix:

- use `editApplyMode: "controlled"` when a save/draft layer owns writes
- call `setCellData(...)` or `setRowData(...)` only after commit acceptance

## 9. Recreating the table on every draft update

Symptom:

- editor closes unexpectedly
- focus returns to `body`
- dirty row colors or selection state disappear

Fix:

- keep table initialization dependencies stable
- use refs for latest rows/callbacks where needed
- update table data with `setData(...)`
- reapply dirty row colors when recreation is unavoidable

## 10. Using `autoClose: false` for every popup editor by default

Symptom:

- every editor needs its own keyboard/outside-click listener
- Esc/Tab behavior drifts across field types

Fix:

- prefer object `autoClose`
- use `relatedElements()` for popup roots
- use `enter: "ignore"` only for editors whose popup owns Enter

## 11. Attachment support stops at render

Symptom:

- the table shows file/image thumbnails, but there is no real attachment editor contract

Fix:

- explicitly design the host attachment editor workflow and value structure

## 12. Upload logic bypasses the data-source layer

Symptom:

- attachment editor code or table-wrapper code calls the backend upload API directly
- create flow tries to upload files before the backend has returned a saved record id

Fix:

- keep real upload calls in the host data-source / adapter layer
- require a stable backend record id, for example `recordID`, before enabling persisted attachment upload
- let the editor produce normalized attachment metadata or pending files, then let the save/data layer decide how to persist them

## 13. Dirty checks depend on generated attachment ids

Symptom:

- an attachment row stays dirty after save/discard even though visible file data matches
- local generated `uid` values differ between normalization passes

Fix:

- normalize attachment arrays before comparing
- ignore generated `uid` fields during dirty comparison
- compare stable file fields such as `name`, `url`, `filePath`, `size`, and `type`

## 14. Copying a Vue sample directly into React

Symptom:

- Vue-style exposed methods and composable assumptions are copied without React equivalents

Fix:

- convert the pattern into hooks, refs, and imperative handles while preserving the same contract

## 15. Restoring focus to a stale canvas after immediate save

Symptom:

- Tab commit saves correctly, but focus ends on `body`
- the next keyboard action no longer reaches the table

Fix:

- after accepted commit or rollback, focus the current canvas instance, not only the instance captured when editing opened
- in React, resolve `tableRef.current?.canvas` in each delayed focus attempt

## 16. Initializing the table with a collapsed container height

Symptom:

- the table renders with a tiny canvas height
- row hit testing, editor coordinates, or empty state behavior feel inconsistent

Fix:

- use explicit height when available
- otherwise use measured container height only when it is usable
- fall back to a conservative default height

## 17. Assuming date picker OK has already parsed typed text

Symptom:

- selecting a date works, but typing a full date-time and clicking OK saves the old value

Fix:

- before OK commits, resolve the current typed input into the editor's selected value/ref
- keep display value and submit value normalized to the agreed date-time format
