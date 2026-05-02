# edit host architecture

Use this file to design the host-side editing system around canvas-table.

Do not put the entire editing workflow directly into one `customEdit` callback.

## 1. Recommended layering

Split editing into these layers:

1. column-definition layer
2. edit-controller layer
3. editor-container layer
4. field-editor layer
5. save / data-sync layer

## 2. Column-definition layer

Responsibilities:

- decide whether a field is editable
- decide whether it uses `input` or `custom`
- expose field metadata needed by editors

Typical metadata used here:

- field type
- required / optional
- single / multiple mode
- precision
- date format
- attachment shape

## 3. Edit-controller layer

Responsibilities:

- store the current edit context
- store old value and current candidate value
- manage save / reset / rollback
- manage click-outside close
- distinguish submit-style vs realtime-style editors
- optionally maintain render-side mapping data for complex fields

Good host abstractions:

- Vue: composable
- React: hook

This layer should not be tightly coupled to one specific editor component.

## 4. Editor-container layer

Responsibilities:

- receive the current edit context
- choose a field-editor component by field type
- normalize the editor interface for the table bridge

Recommended common interface:

- `focus()`
- `updateVal()`

This layer is where framework-specific patterns differ, but the contract should stay stable.

## 5. Field-editor layer

Each field editor should mostly handle:

- local UI state
- local focus behavior
- local value extraction
- field-specific display/submit transformations

Do not let each field editor independently own:

- global save orchestration
- global rollback rules
- global outside-click policy

## 6. Save / data-sync layer

Responsibilities:

- validate required fields
- decide whether the value actually changed
- submit to the host API
- rollback on failure when needed
- backfill the table cell or row data
- restore canvas focus after accepted commit or rollback
- update render-mapping caches for special field types if needed

### Draft vs immediate save

Support both modes explicitly when the product may need them:

- draft mode: update page-level draft state, show dirty state, persist later from a save button
- immediate mode: call the save API when editing completes, then backfill the canvas cell after the API succeeds

When either mode must approve writes, set `editApplyMode: "controlled"` and backfill with `setCellData(...)` or `setRowData(...)` only after acceptance.

If immediate save refreshes host rows, focus restoration should resolve the latest table instance. Avoid focusing a stale canvas captured by the edit-start closure.

### Dirty state belongs outside the table wrapper

Keep dirty patches, dirty row keys, save/discard buttons, and unsaved-change guards in the page/container layer. The table wrapper should receive merged rows and dirty row keys, then apply visual state through canvas-table APIs such as `setRowColors(...)`.

## 7. Recommended React mapping of the Vue-style pattern

A Vue sample may use:

- composable + reactive state
- `defineExpose({ focus, updateVal })`

A React equivalent should generally map to:

- hook for edit control state
- `forwardRef` / `useImperativeHandle` for editor-container and field editors
- host-managed refs for `focus()` and `updateVal()` access
- refs for latest rows/callbacks when those values should not recreate the canvas-table instance

The exact framework syntax can change; the architecture should not.

## 8. Architecture smell checks

If any of these happen, the host design is probably getting unhealthy:

- `customEdit` contains all field-specific branches inline
- field editors directly call backend APIs without a shared save layer
- every field type has its own outside-click policy
- display values and submit values are mixed together everywhere
- the host introduces a whole new component library instead of reusing the current one
- the canvas-table instance is recreated on every draft or callback change
- dirty row colors disappear after resize or table recreation
- Tab commit saves but keyboard focus remains on `body`
- date typed input plus OK saves the previous value
