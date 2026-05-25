# App shell layout

## Contents

- [Structure](#structure)
- [Header](#header)
- [Sidebar](#sidebar)
- [Content height chain](#content-height-chain)
- [Page content](#page-content)

## Structure

Use a fixed-height application shell:

- root shell: full viewport height
- top header: fixed height
- left sidebar: optional, collapsible, independently scrollable
- content region: fills the remaining width and height

The shell should prevent body-level scrolling. Scrolling happens inside the sidebar, table, drawer body, or route content area.

For generated Make App UI, the application shell is mandatory. Start layout work from the shell, not from an isolated list page. Only skip shell generation when an existing project already provides a reusable shell and the task is explicitly to plug a page into that shell.

Default Make App shell:

- left full-height sidebar for app branding, section labels, modules, and Make object navigation
- right-side vertical workspace on a light neutral background
- fixed flat top header inside the workspace
- content region below the header
- no body-level scroll

When no project-specific shell already exists, use the ExpensePoc-style dense object-management shell as the default:

- sidebar width around 220px
- compact brand block at the top
- brand block may show app logo, app name, and app-level metadata such as object count
- navigation is grouped by module/category section labels
- object navigation items are single-line labels with an icon when available
- active object item uses a clear filled highlight
- workspace header is flat, compact, and only shows the current title plus global right-side user/actions
- content area starts with the local toolbar, then the table region
- sidebar background color follows the existing project theme or design system; do not default to a dark sidebar unless the project or user asks for it

## Header

Use the top header for global context and actions:

- left side: current object/module name, breadcrumb, or current module context
- right side: global actions such as settings, notifications, help, and user avatar

Keep the header visually stable and do not place page-specific bulk actions there unless the page has no local toolbar.

For object list pages, the header should show the selected object name on the left and current user/avatar on the right. Do not replace this stable header with a large app-title band above the whole page.

Header titles are primary labels only by default:

- show the current object/module name
- do not render a subtitle, description, helper line, schema summary, or "overview" copy under the title unless the user explicitly asks
- keep page-specific actions such as refresh, create, filter, import, export, or batch actions out of the header when a local toolbar exists
- do not insert an additional object-summary title card below the header just to repeat the current title

## Sidebar

Use the sidebar for app modules or object navigation.

- Support collapse / expand when the app has enough navigation items to benefit from it.
- Keep navigation labels concise.
- Default sidebar navigation items are single-line primary labels only. Do not add per-object subtitles, descriptions, helper text, or second-line summaries by default.
- Object navigation items should link to a dynamic object route, for example `/objects/:objectKey`, instead of separate hard-coded pages per object.
- If navigation is long, scroll inside the sidebar only.
- Do not let sidebar overflow force page-level scrolling.

For a schema-driven Make App, build navigation from modules or object groups when available. If no grouping exists, list objects directly. Object entries still use a dynamic route such as `/objects/:objectKey`.

If object descriptions exist in schema or API metadata, do not show them under each sidebar item by default. Use them only when the user asks for richer navigation, and prefer a tooltip or detail surface over making every item two lines.

Sidebar active-item alignment is a layout requirement:

- put nav items inside a padded sidebar content area, then let the item fill that content width
- keep active highlight left and right inset consistent; do not let the highlight touch one sidebar edge while leaving extra space on the other side
- avoid negative margins, absolute positioning, or hard-coded left offsets for active backgrounds
- use `box-sizing: border-box`, `width: 100%`, and `align-items: center` for clickable nav rows
- keep icon/text, active background, and hit area vertically centered in the same row height

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
