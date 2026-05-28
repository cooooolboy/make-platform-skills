# Make cell edit defaults

Use this reference for Make schema-driven editable cells in `@qfei-design/canvas-table`.

These defaults are derived from the current ExpensePoc table-editing implementation. Apply them unless the user explicitly asks for another interaction.

## 1. Required editing baseline

Use `editType: "custom"` plus a host `customEdit(options)` bridge for business fields.

For Make App editable tables, prefer:

- `editApplyMode: "controlled"`
- a dedicated editor DOM element for the active cell
- a separate popup root appended to `document.body`
- `relatedElements()` returning popup roots so dropdown/date/attachment panels are not treated as outside clicks
- `overlayOptions: { overflow: "visible" }` when a popup can extend outside the edited cell
- `destroy()` that unmounts the framework root, removes popup roots, and releases editor-local resources

Do not let each field editor call backend APIs directly. Field editors extract values; the save or draft layer decides persistence, backfill, and rollback.

## 2. Activation and popup rule

When the table enters edit mode, the editor must be usable immediately.

Popup-style fields must open their popup during the same edit activation. A user may need to click or double-click the cell according to the table's activation behavior, but after edit mode starts the field popup must already be open. It is incorrect to first show a small input and require one more click to open the picker/dropdown.

Before mounting the editor, make the target cell visible. If the clicked cell is partially clipped by horizontal scroll, vertical scroll, the fixed-left region, header/body viewport boundary, or the container edge, scroll just enough to bring the full editable cell into the visible body viewport, then calculate editor placement from the updated geometry. Do not mount the editor at the old clipped coordinates and then rely on the popup to compensate.

Practical rules:

- if the cell is already fully visible, do not change scroll
- if the row is partially above/below the body viewport, adjust vertical scroll before mounting the editor
- if the column is partially left/right clipped, adjust horizontal scroll before mounting the editor
- fixed-left cells should not trigger horizontal scroll, but normal cells must not be hidden behind the row-head or fixed-left area
- after calling the table's public scroll method, recalculate or wait for the next frame before focusing/opening the editor
- use the installed package's public scroll APIs, for example `scrollTo(...)` when available; do not mutate internal scroll state directly

Default popup-style fields:

- `Make.Field.Date`
- `Make.Field.DateTime`
- `Make.Field.DateRange`
- `Make.Field.SingleSelect`
- `Make.Field.MultiSelect`
- `Make.Field.SingleUser`
- `Make.Field.MultiUser`
- `Make.Field.SingleDepartment`
- `Make.Field.MultiDepartment`
- `Make.Field.File`
- editable relation/lookup selectors when the host backend explicitly supports them

For React and Ant Design style components, this usually means controlled `open` or equivalent on mount, `getPopupContainer={() => popupRoot}`, and `focus()` in the editor handle after the editor root has rendered.

## 3. No double-border rule

The edited cell already has a canvas-table active outline. Field editor controls inside that cell must not draw a second focus border or focus shadow.

Default visual requirements:

- Select, user, department, date, and date-range triggers inside the cell are borderless, shadowless, full width, and full height.
- Ant Design style components should use borderless variants and remove selector/picker focus `box-shadow`; the dropdown/picker panel may keep its normal popup shadow.
- Single-select and identity tags can render as compact pills inside the cell, but the trigger container itself must not draw another blue rectangle.
- Clear, search, and suffix icons stay inside the same borderless trigger area and must not create a nested input box.
- The only visible blue border during normal editing is the canvas-table active cell outline. Attachment panels may draw one panel border that covers or replaces the active-cell outline.

If a screenshot shows a blue cell outline plus another blue rectangle around the Select/Input/Pick trigger, the editor is wrong.

## 4. Inline editor visual rule

Inline editors must fill the active cell.

Default inline fields:

- `Make.Field.Text`
- `Make.Field.TextArea`
- `Make.Field.URL`
- `Make.Field.Number`
- `Make.Field.Currency`
- `Make.Field.Percent`

The editor root and the actual input/textarea/number component should use `width: 100%` and `height: 100%`. Do not wrap the editor in `Form.Item`, cards, bordered panels, or components that add an extra visible border, radius, margin, or outer padding inside the active cell. The active-cell outline belongs to canvas-table; the input itself should be borderless or visually merged with the edited cell.

Small horizontal content padding is acceptable inside the input text area, but it must not create an extra inset box. Textarea editors must also fill the cell instead of rendering as a smaller bordered textarea floating inside the cell.

## 5. Attachment editor visual rule

Attachment editing should follow the ExpensePoc-style table editor unless the host project already has a better matching attachment component.

Default attachment editor shape:

- open a single attachment panel directly from the edited cell; do not render a form card inside the cell
- the panel may be wider/taller than the cell and should visually connect to the active cell
- use one blue panel/active outline, not a blue cell border plus a nested card border
- show existing image/file thumbnails or file cards first
- provide one drag/drop/click upload zone inside the same panel
- support preview/remove controls on the attachment item itself
- avoid a header row such as field title plus a separate "upload" button unless the product explicitly asks for that form-style layout

A panel that contains a title, toolbar button, inner bordered list row, and card chrome is a form layout, not the default canvas-table attachment cell editor.

## 6. Field-type default behavior

| Field group | Default editor behavior | Submit value |
| --- | --- | --- |
| ID | read-only | none |
| Text / URL | inline text input, select current value on focus | string |
| TextArea | inline textarea that fills the cell; commit on outside click or explicit key path | string |
| Number / Currency / Percent | inline numeric input, right-aligned display, no extra stepper box by default | number |
| Date | popup date picker opens immediately | `YYYY-MM-DD` or host agreed date string |
| DateTime | popup date-time picker opens immediately; resolve typed input before OK commit | `YYYY-MM-DD HH:mm:ss` or host agreed date-time string |
| DateRange | popup range picker opens immediately | `{ begin, end }` or host equivalent |
| SingleSelect | popup select opens immediately; single selection may request commit after change | option value |
| MultiSelect | popup multi-select opens immediately; keep responsive tags and `+N` overflow | option value array |
| SingleUser / MultiUser | searchable user selector opens immediately; include current value and candidates from `/api/users` or host equivalent | user id or user id array |
| SingleDepartment / MultiDepartment | searchable department selector opens immediately; include current value and candidates from `/api/departments` or host equivalent | department id or department id array |
| File | attachment panel/editor opens as host popup; upload/delete goes through host data-source boundary | normalized file payload |
| Lookup | read-only by default; if editable, use a relation/lookup selector popup, not plain text | backend relation payload |

Reuse the host Drawer form's field-type mapping where possible so Drawer forms and table cell editors submit the same value shapes.

## 7. Initial value and echo rule

Resolve the editor's initial value from the table edit options and row data in this order:

```ts
const initialValue =
  options.value !== undefined
    ? options.value
    : options.oldValue !== undefined
      ? options.oldValue
      : options.row?.[fieldKey];
```

Use an `undefined` check instead of `??` here. `null`, `0`, `false`, `""`, and `[]` can all be valid current field values and must not accidentally fall back to `oldValue`.

Never initialize complex editors from formatted display text.

Normalize current backend value shapes before rendering editor state:

- date range accepts `{ begin, end }`, `{ start, end }`, `{ from, to }`, or `[begin, end]`, then edits as picker values and submits the backend range object
- select values separate value and label; options use schema `{ label, value }`
- user values read ids from `recordID`, `userId`, or `id`, and labels from `name`, `userName`, `displayName`, or `label`
- department values read ids from `recordID`, `departmentId`, or `id`, and labels from `name`, `departmentName`, `displayName`, or `label`
- file values normalize to the host attachment display/payload structure

If remote user or department candidates are still loading, the current cell value must still echo from the record value. Do not show an empty select just because the candidate API has not returned yet.
User and department candidate lists must use the same host candidate adapters as Drawer forms and advanced filters. Do not source cell-editor candidates from field schema options, static fixtures, current table rows, or hardcoded demo lists; current values are only an echo fallback.

## 8. Value contract

Every field editor should expose a common handle:

- `focus()`
- `updateVal()`
- optional `getPopupRoot()`

`updateVal()` should return a value contract equivalent to:

```ts
type CellEditorValue = {
  renderValue: unknown;
  submitValue: unknown;
  displayValue?: unknown;
};
```

Use `renderValue` to backfill canvas display data, `submitValue` for dirty comparison and API payloads, and `displayValue` only for user-facing text.

Do not submit formatted values such as `¥1,260,000.00`, `2026-06-01 至 2026-12-31`, option labels, user names, department names, or attachment preview text.

## 9. Close, save, and rollback rule

Recommended `autoClose` split:

- single-line text and number: `{ outsideClick: "commit", escape: "cancel", enter: "commit", tab: "commitAndMove" }`
- textarea / multiline text: outside click commits, Escape cancels, Tab commits and moves; Enter should stay inside the editor when multiline input is enabled
- popup editors: `{ outsideClick: "commit", escape: "cancel", enter: "ignore", tab: "commitAndMove" }`

### Single-field unchanged close rule

For single-field cell editing, all close paths must run the same normalized equality check before any save side effect:

- outside click close
- dropdown/picker close
- selecting the same option
- date picker OK with the same value
- Tab commit-and-move
- Enter commit for single-line editors
- programmatic `commit(...)`
- `edit:end` fallback when the host did not capture a pending commit

If normalized old and new values are equal, the host must only close/reset the editor. It must not call the Service/API update endpoint, mark the row/cell dirty, call `setCellData(...)`, enqueue a draft patch, or emit a business save event.

`Escape` remains cancel-style and also must not call save APIs.

On commit:

1. Read the current editor value through `updateVal()`.
2. Compare normalized old value with `nextValue.submitValue` by field type.
3. If unchanged, close/reset without calling the save API, creating draft state, or calling `setCellData(...)`.
4. If changed, route the commit to the host draft or immediate-save layer.
5. In `editApplyMode: "controlled"`, call `setCellData(...)` or `setRowData(...)` only after the host layer accepts the commit.
6. On save failure, rollback the canvas cell to the old value and surface the error through the host UI.

The equality check must understand field types. Examples:

- number-like fields compare numeric values after parsing and precision normalization
- date range fields compare normalized `begin` and `end`
- select fields compare option values, not labels
- user and department fields compare stable ids
- file fields compare stable file metadata, not generated local `uid`

## 10. Verification checklist

Before reporting an editable Make table as done, verify at least:

- popup fields open their picker/dropdown/panel immediately after edit mode starts
- clicking a partially clipped editable cell scrolls it fully into view before the editor mounts
- select, date, user, and department triggers do not draw a second blue border inside the active cell
- inline editors fill the active cell and have no extra nested border or outer margin
- attachment fields use one connected popup/panel with thumbnails and one upload zone, not a nested form card
- date range, select, user, department, number, textarea, and file fields echo existing values on entry
- unchanged close from outside click, picker/dropdown close, same-value selection, Enter, Tab, or `edit:end` fallback does not call save APIs, create dirty state, or backfill table data
- changed commit sends normalized submit values and backfills accepted render values
- `Escape` cancels without writing the candidate value
- clicking inside a popup does not close the editor because the popup root is included in `relatedElements()`
- `destroy()` removes editor and popup DOM roots
