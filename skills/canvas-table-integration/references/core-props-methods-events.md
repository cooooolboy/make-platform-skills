# core props, methods, and events

Use this file for the first-version consumer-facing API surface.

Keep to documented public APIs. Prefer `PUBLIC_API.md` plus the package feature docs over internal source assumptions.

## 1. Common `IColumn` fields

Use these first:

- `key`: unique field key
- `title`: header title
- `width`: column width
- `minWidth`: minimum width when needed
- `align`: body-cell text alignment
- `headerAlign`: header text alignment
- `fixed`: currently use only `left`
- `showEllipsis`: truncate long content
- `render`: custom body-cell rendering hook
- `headerRender`: custom header rendering hook
- `prefixRender` / `suffixRender`: lightweight header prefix/suffix icon rendering

First-pass guidance:

- Prefer plain text columns first.
- Add `fixed: 'left'` only to key identity columns such as id, name, code, or action anchors.
- Use `showEllipsis` for long business text.
- Use `render` only when built-in text rendering is not enough.

## 2. Common `TableCanvasProps`

Use these props first:

- `columns`
- `canvasWidth`
- `canvasHeight`
- `style`
- `rowKey`
- `virtualOptions`
- `showSN`
- `selectable`
- `rowSortable`
- `bodyRowHeadSuffixOptions`
- `showSummary`
- `summaryRowHeight`
- `summaryData`
- `summaryRenderer`
- `emptyStateOptions`
- `rowStyleOptions`
- `showHeader`
- `showBody`

### Useful notes

#### `rowKey`

Can be:

- a string field name, e.g. `rowKey: 'id'`
- a function, e.g. `(row, index) => ...`

Prefer a stable backend identity field whenever possible. For persisted records, use the system record id returned by the backend, for example `id`, `recordId`, or a platform-specific system id.

Do not use a mutable or business-only display field as the technical row key when row state, drafts, detail routes, or attachment uploads depend on the key.

#### `showSN`

Useful for sequence numbers.

- `enabled: true`
- optional `formatter(row, index)` for custom numbering

#### `selectable`

Use for row selection:

- `enabled: true`
- `type: 'single' | 'multiple'`

#### `rowSortable`

Use for row drag sorting:

- `enabled: true`
- optional `rowDisabled(row, index)`

#### `bodyRowHeadSuffixOptions`

Use for compact row-head actions that visually belong beside the sequence number, selector, or drag handle.

- `enabled: true`
- `width`: the reserved suffix width
- `render({ group, cell, x, y, height, rowData, index })`: add shapes to the provided row-head group

For an open-detail icon after the sequence number, read `row-head-action-patterns.md`.

#### `emptyStateOptions`

Useful fields:

- `text`
- `imageUrl`
- `render`

#### `rowStyleOptions`

Use for lightweight row highlighting based on business state.

## 3. Common instance methods

Use these methods first:

- `setData(data, page?)`
- `updateProps(newProps)`
- `updateCanvasSize(width, height, refresh?)`
- `refreshCanvas()`
- `getTableData()`
- `getSelectionInfo()`
- `clearSelection()`
- `updateSummaryData(newSummaryData)`
- `setSummaryLoading(loading, columnKey?)`
- `refreshEmptyState()`
- `destroy()`

### Behavioral notes

#### `setData`

- local mode: `setData(rows)`
- virtual mode: `setData(rows, page)`

Do not omit `page` in virtual mode.

#### `getTableData()`

Treat this as current in-memory table data.

In virtual mode, do **not** treat it as the guaranteed full remote dataset.

#### `updateProps(...)`

Use for:

- resized width/height
- changed columns
- changed summary config
- changed table behavior flags

#### `destroy()`

Always call on unmount / cleanup.

## 4. Stable first-version event surface

Prefer these events in first-pass integrations:

### Data and lifecycle

- `data:load`
- `first-screen-rendered`

### Scroll and selection

- `scroll:change`
- `selection:change`

### Business interaction

- `row:click`
- `cell:click`
- `cell:dbclick`
- `cell:contextmenu`
- `shape:click`

### Example wiring

```ts
const off = globalEventBus.onWithNamespace('selection:change', table.tableId, (snapshot) => {
  console.log(snapshot)
})
```

Prefer `table.tableId` as the namespace key.

## 5. Capability-to-API mapping

### Row selection

- prop: `selectable`
- method: `getSelectionInfo`, `clearSelection`
- event: `selection:change`

### Row drag

- prop: `rowSortable`
- method: `getTableData`
- note: there is no dedicated documented drag-finished event in the first-version path

### Fixed columns

- column field: `fixed: 'left'`
- optional method: `scrollTo`

### Summary row

- props: `showSummary`, `summaryData`, `summaryRenderer`, `summaryRowHeight`
- methods: `updateSummaryData`, `setSummaryLoading`

### Empty state

- prop: `emptyStateOptions`
- methods: `setData([])`, `refreshEmptyState`, `clearData`

### Clickable business content

- column field: `render`
- shape: `TextShape`
- events: shape click or shape-level event handlers

For render patterns, read `shape-render-patterns.md`.
