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
- require a stable backend record id before enabling persisted attachment upload
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

- after accepted cell-edit commit or rollback, focus the current canvas instance, not only the instance captured when editing opened
- in React, resolve `tableRef.current?.canvas` in each delayed focus attempt
- keep this focus restoration scoped to canvas-table cell editing; skip it if a host modal, drawer, dialog, popover, or form surface is open or opening
- cancel or guard delayed focus retries when row clicks or actions open host UI

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

## 18. Letting canvas focus steal host form focus

Symptom:

- opening a create/edit drawer or modal from a table row works, but inputs cannot keep focus
- clicking a form input briefly focuses it, then focus returns to the canvas
- delayed `requestAnimationFrame` or `setTimeout` focus retries run after host UI opens

Fix:

- treat modal, drawer, dialog, popover, and form components as separate host interaction surfaces that own focus while open
- do not call `table.canvas.focus()` or `tableRef.current?.canvas.focus()` after opening those surfaces
- guard delayed canvas-focus retries with an "is host surface open" check
- only restore canvas focus after canvas-table cell-edit commit/cancel/rollback when the next intended target is the table

## 19. Treating all 18 Make field types as editable

Symptom:

- `ID` or `Lookup` cells enter edit mode but the backend rejects the write
- generated values or derived lookup values are sent through the same save path as normal fields

Fix:

- classify `Make.Field.ID` and `Make.Field.Lookup` as read-only by default
- include them in field coverage documentation, but do not wire save calls unless the backend explicitly supports editing them

## 20. Submitting display strings instead of backend values

Symptom:

- currency fields submit `¥1,234.00`
- percent fields submit a string with `%`
- select, user, or department fields submit labels instead of ids
- date ranges submit `"2026-01-01 至 2026-01-31"` instead of a structured range

Fix:

- keep `renderValue`, `displayValue`, and `submitValue` separate
- normalize field values before dirty comparison and API calls
- keep formatting in render/editor display helpers, not in persisted row data

## 21. Ignoring numeric precision metadata

Symptom:

- entering three decimal places looks valid in the editor but the save API rejects the value
- the cell briefly displays a value that the backend cannot persist

Fix:

- read precision metadata such as `precision` or `decimalPlaces`
- round or validate before commit according to the host backend rule
- test the normalized submit value, not only the input display

## 22. Using fake identity options in production

Symptom:

- person or department dropdowns show local demo values that are not returned by real backend APIs
- saving a selected fake id fails backend validation

Fix:

- use real host APIs or existing business selector data sources for identity candidates
- use current cell values only as display/selection fallback, not as a fake global dictionary
- if the real API returns empty data, keep the candidate list empty unless the product explicitly requests demo mode

## 23. Defaulting complex Make fields to plain text inputs

Symptom:

- date cells use free-text inputs instead of date/date-time/range pickers
- person or department cells use text inputs even though the schema says `SingleUser`, `MultiUser`, `SingleDepartment`, or `MultiDepartment`
- select fields ignore schema options and save display labels
- file fields render attachments but have no host upload/delete path
- lookup fields enter edit mode even though the backend treats them as derived values

Fix:

- read the host Make schema and reuse the same field-type mapping as the Drawer form
- use type-appropriate editors for date, select, user, department, and file fields
- keep `Lookup` read-only unless the schema/API explicitly supports association editing
- if candidate APIs are missing, use a selector shell with current-value display and a documented API integration point instead of fake candidates
- document any explicit fallback and do not silently generate a bare `Input`

## 24. Popup editors require an extra click after edit mode starts

Symptom:

- double-clicking a date range, select, user, department, lookup, or attachment cell enters edit mode but only shows an inline input
- the real picker/dropdown/panel appears only after a third click inside the edited cell

Fix:

- make popup editors open on mount through the host component's controlled `open` or equivalent prop
- render the popup into a dedicated popup root and return that root from `relatedElements()`
- focus the editor after the framework root has rendered
- keep `autoClose.enter: "ignore"` for popup editors whose internal keyboard interaction owns Enter

## 25. Editor UI is inset inside the active cell

Symptom:

- edited text, textarea, or number cells show an extra input border, radius, margin, or blank inset
- the component does not fill the active cell height or width

Fix:

- set the editor container and actual editor component to `width: 100%` and `height: 100%`
- use borderless or visually merged editor variants
- do not wrap cell editors in `Form.Item`, cards, or bordered panels
- keep only small inner text padding when needed; do not create an extra outer box

## 26. Current value does not echo when editing starts

Symptom:

- person or department editors open empty even though the cell has a value
- date range editors show raw JSON, formatted text, or blank state
- select editors show ids instead of labels, or labels instead of selectable values

Fix:

- resolve initial editor value with `undefined` checks: prefer `options.value`, then `options.oldValue`, then `row[fieldKey]`
- do not use `??` for this fallback because `null`, `0`, `false`, `""`, and `[]` can be valid current values
- initialize editors from raw backend values, not canvas display strings
- include current record values in option/label mapping while remote candidates are loading
- normalize Make value variants before setting editor state

## 27. Unchanged close still calls the save API

Symptom:

- opening a cell editor and closing it without changes still sends update requests
- user or department fields appear dirty because returned API shapes differ from record shapes

Fix:

- compare normalized old value with `nextValue.submitValue` before routing the commit
- skip save API calls and `setCellData(...)` when unchanged
- compare numbers as numbers, date ranges by normalized begin/end, select fields by option values, identity fields by stable ids, and files by stable metadata
