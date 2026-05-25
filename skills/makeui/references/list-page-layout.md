# List page layout

## Contents

- [Default list page](#default-list-page)
- [Recommended structure](#recommended-structure)
- [Optional actions](#optional-actions)
- [Table boundary](#table-boundary)
- [Density](#density)

## Default list page

Default Make list pages are simple object lists.

They must live inside the Make App shell. Do not generate a list page that owns the app title, user identity, and object navigation in the page body. Those belong to `app-shell-layout.md`.

Default object-list scaffold:

1. App shell
2. Left sidebar with module/object navigation
3. Workspace header with selected object name on the left and current user/avatar on the right
4. Local page toolbar
5. CanvasTable container

The default layout should match the ExpensePoc-style dense list screen:

- left app sidebar; background color follows the project theme
- flat workspace header with title only
- local toolbar directly under the header
- search/filter/refresh on the toolbar left
- create/new on the toolbar right
- canvas-table directly under the toolbar
- no separate object-title card, count summary card, schema-source card, or descriptive band above the table

Sidebar and workspace header labels are terse by default:

- sidebar object items show only the object/module label, with no subtitle or description line
- workspace header shows only the current object/module title, with no subtitle or helper line
- schema descriptions, source summaries, and "overview" copy belong in an explicit detail or help surface only when requested

Do not add pagination by default. Pagination is an explicit user requirement, not a default list-page behavior.

Unless the user asks for pagination, do not add:

- visible pagination controls
- page-size selectors
- page state
- page query params
- total-count handling
- paginated fetch logic

Do not create a view switcher. A default list page includes only:

- search
- refresh
- create/new
- table area

## Recommended structure

Use this order:

1. local page toolbar
2. table container

Add pagination below or inside the table container only when the user explicitly requests it.

Do not add an intermediate card or panel that repeats the object title and record count before the toolbar/table. Record count can appear only when the host table component already supports it in a compact table status area or when the user asks for it.

Toolbar placement:

- search input on the left
- optional filter next to search only when requested or already established by the project
- refresh near the search input or in the secondary action group
- create/new as the rightmost primary action
- refresh must sit in this local toolbar above the table; do not place it in the global header, object title header, table header row, canvas-table header area, or column header area

The table container fills remaining height. The list page itself should not scroll.

The local toolbar sits below the workspace header, not inside the header. Keep page actions out of the global header unless there is no local toolbar.

## Optional actions

Only add these when the user explicitly asks:

- pagination
- filter
- group
- sort
- column settings
- import
- export

Recommended placement:

- filter: near search, usually immediately after search or refresh
- group and sort: after filter, as data-organization controls
- column settings: near the table's right side or after group/sort
- import/export: right action group, usually left of create/new or inside a more-actions menu
- batch actions: appear only after rows are selected, in a selection-state toolbar above the table
- pagination: bottom-right or bottom-center inside the list/table container; do not reserve pagination space when pagination is not requested

Do not add optional actions as decorative placeholders.

## Table boundary

Use `@qfei-design/canvas-table` through `canvas-table-integration` for table implementation.

This skill only specifies:

- where the table sits
- how much space it gets
- how toolbar and optional pagination wrap around it
- where optional controls should appear

Do not use Ant Design Table, Arco Table, TDesign Table, or a hand-written HTML table for Make record lists.

For Make object lists, table columns and headers come from the runtime schema API, not local DSL files:

- prefer `GET /api/schema`, `GET /api/entities/:entityKey/fields`, or the host project's equivalent Service client
- pass schema-derived fields to `canvas-table-integration` to build columns
- refresh or invalidate schema when the user expects recently changed fields to appear
- do not read `apps/dsl`, `/dsl`, or YAML files at runtime
- do not hard-code static canvas-table columns as the default for schema-driven object lists

If the user asks for cell editing, still use `canvas-table-integration`; do not design a separate DOM-table editor system in `makeui`.

The table region should have:

- stable height
- `min-height: 0`
- `overflow: hidden` around the canvas table host
- internal table scroll instead of page scroll

Default CanvasTable row behavior for every table unless the user explicitly says the table does not need a detail entry:

- enable `showSN` row sequence numbers by default
- enable `bodyRowHeadSuffixOptions` with an open-detail icon by default
- normal state shows only the sequence number; row hover or keyboard focus reveals the detail icon
- clicking the open-detail icon opens the row detail Drawer or the project's established detail surface
- do not make the whole row a default detail trigger unless the user or existing project pattern requires it
- do not enable row selection by default; enable it only when the user asks for selection, batch actions, or multi-record operations

## Density

Object list pages may be dense. Prefer compact, scan-friendly controls over large hero sections or marketing-style layouts.

Avoid:

- large page hero blocks
- nested cards around the table
- view tabs unless requested
- page-level vertical scrolling for normal list browsing
