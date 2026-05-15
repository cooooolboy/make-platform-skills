# List page layout

## Default list page

Default Make list pages are simple object lists.

They must live inside the Make App shell. Do not generate a list page that owns the app title, user identity, and object navigation in the page body. Those belong to `app-shell-layout.md`.

Default object-list scaffold:

1. App shell
2. Left sidebar with module/object navigation
3. Workspace header with selected object name on the left and current user/avatar on the right
4. Local page toolbar
5. CanvasTable container
6. Pagination inside the list/table container when needed

Do not create a view switcher. A default list page includes only:

- search
- refresh
- create/new
- table area
- pagination if the table needs it

## Recommended structure

Use this order:

1. local page toolbar
2. table container
3. pagination inside the list/table container

Toolbar placement:

- search input on the left
- refresh near the search input or in the secondary action group
- create/new as the rightmost primary action

The table container fills remaining height. The list page itself should not scroll.

The local toolbar sits below the workspace header, not inside the header. Keep page actions out of the global header unless there is no local toolbar.

## Optional actions

Only add these when the user explicitly asks:

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

Do not add optional actions as decorative placeholders.

## Table boundary

Use `@qfei-design/canvas-table` through `canvas-table-integration` for table implementation.

This skill only specifies:

- where the table sits
- how much space it gets
- how toolbar and pagination wrap around it
- where optional controls should appear

Do not use Ant Design Table, Arco Table, TDesign Table, or a hand-written HTML table for Make record lists.

If the user asks for cell editing, still use `canvas-table-integration`; do not design a separate DOM-table editor system in `makeui`.

The table region should have:

- stable height
- `min-height: 0`
- `overflow: hidden` around the canvas table host
- internal table scroll instead of page scroll

Default CanvasTable row behavior for Make record lists:

- show row sequence numbers by default
- show an open-detail icon in the row-head suffix by default
- clicking the open-detail icon opens the record detail Drawer or the project's established detail surface
- do not make the whole row a default detail trigger unless the user or existing project pattern requires it
- do not enable row selection by default; enable it only when the user asks for selection, batch actions, or multi-record operations

## Density

Object list pages may be dense. Prefer compact, scan-friendly controls over large hero sections or marketing-style layouts.

Avoid:

- large page hero blocks
- nested cards around the table
- view tabs unless requested
- page-level vertical scrolling for normal list browsing
