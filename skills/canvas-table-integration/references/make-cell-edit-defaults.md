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

## 3. Inline editor visual rule

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

## 4. Field-type default behavior

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
| SingleUser / MultiUser | searchable user selector opens immediately; include current value and real API candidates | user id or user id array |
| SingleDepartment / MultiDepartment | searchable department selector opens immediately; include current value and real API candidates | department id or department id array |
| File | attachment panel/editor opens as host popup; upload/delete goes through host data-source boundary | normalized file payload |
| Lookup | read-only by default; if editable, use a relation/lookup selector popup, not plain text | backend relation payload |

Reuse the host Drawer form's field-type mapping where possible so Drawer forms and table cell editors submit the same value shapes.

## 5. Initial value and echo rule

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

## 6. Value contract

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

## 7. Close, save, and rollback rule

Recommended `autoClose` split:

- single-line text and number: `{ outsideClick: "commit", escape: "cancel", enter: "commit", tab: "commitAndMove" }`
- textarea / multiline text: outside click commits, Escape cancels, Tab commits and moves; Enter should stay inside the editor when multiline input is enabled
- popup editors: `{ outsideClick: "commit", escape: "cancel", enter: "ignore", tab: "commitAndMove" }`

On commit:

1. Read the current editor value through `updateVal()`.
2. Compare normalized old value with `nextValue.submitValue` by field type.
3. If unchanged, close without calling the save API and without calling `setCellData(...)`.
4. If changed, route the commit to the host draft or immediate-save layer.
5. In `editApplyMode: "controlled"`, call `setCellData(...)` or `setRowData(...)` only after the host layer accepts the commit.
6. On save failure, rollback the canvas cell to the old value and surface the error through the host UI.

The equality check must understand field types. Examples:

- number-like fields compare numeric values after parsing and precision normalization
- date range fields compare normalized `begin` and `end`
- select fields compare option values, not labels
- user and department fields compare stable ids
- file fields compare stable file metadata, not generated local `uid`

## 8. Verification checklist

Before reporting an editable Make table as done, verify at least:

- popup fields open their picker/dropdown/panel immediately after edit mode starts
- inline editors fill the active cell and have no extra nested border or outer margin
- date range, select, user, department, number, textarea, and file fields echo existing values on entry
- unchanged close does not call the save API and does not backfill table data
- changed commit sends normalized submit values and backfills accepted render values
- `Escape` cancels without writing the candidate value
- clicking inside a popup does not close the editor because the popup root is included in `relatedElements()`
- `destroy()` removes editor and popup DOM roots
