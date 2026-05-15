# App shell layout

## Structure

Use a fixed-height application shell:

- root shell: full viewport height
- top header: fixed height
- left sidebar: optional, collapsible, independently scrollable
- content region: fills the remaining width and height

The shell should prevent body-level scrolling. Scrolling happens inside the sidebar, table, drawer body, or route content area.

For generated Make App UI, the application shell is mandatory. Start layout work from the shell, not from an isolated list page. Only skip shell generation when an existing project already provides a reusable shell and the task is explicitly to plug a page into that shell.

Default Make App shell:

- left full-height sidebar for modules or Make object navigation
- right-side vertical workspace
- fixed top header inside the workspace
- content region below the header
- no body-level scroll

## Header

Use the top header for global context and actions:

- left side: current object/module name, breadcrumb, or current module context
- right side: global actions such as settings, notifications, help, and user avatar

Keep the header visually stable and do not place page-specific bulk actions there unless the page has no local toolbar.

For object list pages, the header should show the selected object name on the left and current user/avatar on the right. Do not replace this stable header with a large app-title band above the whole page.

## Sidebar

Use the sidebar for app modules or object navigation.

- Support collapse / expand when the app has enough navigation items to benefit from it.
- Keep navigation labels concise.
- Object navigation items should link to a dynamic object route, for example `/objects/:objectKey`, instead of separate hard-coded pages per object.
- If navigation is long, scroll inside the sidebar only.
- Do not let sidebar overflow force page-level scrolling.

For a schema-driven Make App, build navigation from modules or object groups when available. If no grouping exists, list objects directly. Object entries still use a dynamic route such as `/objects/:objectKey`.

## Content height chain

Every container between the shell and the working area should preserve height:

- `height: 100%` or viewport-height equivalent at the shell boundary
- `flex: 1`
- `min-height: 0`
- `min-width: 0`
- `overflow: hidden` on layout containers that should not scroll

Use this rule especially for list pages with table regions.

## Page content

The content region owns page-local layout:

- list pages: no page-level scroll; table scrolls
- drawer forms/details: drawer body scrolls
- route forms/details: route content may scroll inside the content region
