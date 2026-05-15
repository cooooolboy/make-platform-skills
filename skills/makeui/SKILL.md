---
name: skills/makeui
description: Use when designing or generating Make App frontend UI, `apps/ui` code, UI, 界面, or 前端代码 with React + Vite + React Router. This skill covers general page layout, visual styling, component placement, simple page interactions, responsive behavior, dynamic object routes, schema-driven Make forms, list pages, create/edit drawers, detail drawers, component-library selection guidance, and route-based form/detail pages when explicitly requested. It requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, including cell editing when needed. It does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
version: 0.3.10
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# skills/makeui

Use this skill for **Make App frontend UI design and generation**.

The skill focuses only on:

- page layout
- visual UI styling
- component placement
- simple page interactions
- responsive behavior

It does **not** decide business semantics, data APIs, permissions, persistence, approval flows, or table internals.

## Default frontend stack

Make App frontend defaults to:

- React
- Vite
- React Router

Do not switch to another full-stack frontend framework unless the user explicitly requests it and the project already supports it.

## Target Make App structure

When generating or reorganizing a Make App project, follow the makecli agent target structure:

- `apps/ui`: React + Vite + React Router frontend
- `apps/service`: Service layer for Make API credentials, schema, records, files, users, and departments
- `apps/dsl`: Make App / Entity / Relation DSL
- `apps/docs`: PRD and UI/Service API contracts
- `apps/packages/ui`, `apps/packages/types`, `apps/packages/config`: shared packages when needed

The target data flow is:

```text
apps/ui -> apps/service -> Make Data API -> Make Platform
```

UI code must use the Service base URL and must not hold Make tokens, call Make APIs directly, or rely on a Vite token proxy such as `/make-api`. This project structure rule is for generated Make App projects; it does not mean the `makeui` skill repository itself should be reorganized into `apps/`.

## Node runtime

Use Node.js `>=22.12.0` for Make App frontend projects.

- Recommend the current active LTS for new projects. At the time of this update, use Node.js 24 LTS by default.
- Do not choose Node.js 20 as the default for new projects.
- For new projects, add `package.json` `engines.node` as `>=22.12.0`.
- If the project uses a version manager, prefer a simple major-version file such as `.nvmrc` or `.node-version` with `24`.
- If an existing project already has a stricter Node requirement, keep the stricter project requirement.

## Pre-flight workflow

Before generating or editing UI:

1. Inspect the project for existing Node runtime requirements, frontend stack, component library, styling solution, routes, layout shell, and page patterns.
2. Use existing project conventions first.
3. Verify the project Node runtime is compatible with the Make default baseline or the project's stricter requirement.
4. If the project is being created from scratch and no component library is established, stop before scaffolding component-library-specific UI and require the user to choose Ant Design, Arco Design, or TDesign. Recommend Ant Design, but do not choose it for the user. If the user has not chosen, only produce a component-library-neutral plan or ask the selection question.
5. If the user did not specify a styling solution and the project has none, Less is an acceptable default candidate.
6. Before generating Make object lists, Drawer forms/details, route forms/details, or schema-driven fields, read the available DSL/schema source. Prefer existing `apps/dsl`, then Service `/api/schema`, then project-local schema/meta types or fixtures. If no schema source exists, explain the missing source and the explicit downgrade strategy before generating UI.
7. Identify the Make field types that drive form controls and table display. Date, user, department, select, file, and lookup fields must not silently become plain text inputs.
8. Identify the page type:
   - list page
   - create/edit UI
   - detail UI
9. Identify the container mode:
   - create/edit/detail default to right-side Drawer
   - route-based pages only when the user explicitly asks for a page, route, navigation, or standalone screen
10. Use React Router dynamic params for Make object routes. Do not generate a separate hard-coded route component per object.
11. For any Make record table or list table, use `@qfei-design/canvas-table` through `canvas-table-integration`. This includes table display and cell editing. This skill only defines the surrounding layout and placement.

## Required references

Read only the reference files needed for the request:

- General boundaries and defaults: `references/principles.md`
- App shell, side navigation, top header, and height chain: `references/app-shell-layout.md`
- List pages and toolbar button placement: `references/list-page-layout.md`
- Create/edit/detail Drawer layout: `references/drawer-layout.md`
- Route-based create/edit/detail pages: `references/page-route-layout.md`
- Component library and styling selection: `references/component-usage.md`
- Spacing, density, scroll, states, and responsiveness: `references/styling-and-responsive.md`

## Core defaults

- New Make App UI must start from the application shell. Do not generate an object list page directly under `body` or a standalone page root unless the project already provides a reusable shell to plug into.
- The default Make object-list shell is:
  - left full-height sidebar for modules or object navigation
  - right fixed-height header with the current object/module name on the left
  - current user/avatar and global actions on the header right
  - page-local toolbar below the header
  - `canvas-table` region filling the remaining height
  - pagination inside the list/table container when needed
- Do not create a "view" concept by default. No view tabs, view dropdowns, Kanban view, split view, or view switcher unless the user explicitly asks.
- A default list page includes only:
  - search
  - refresh
  - create/new
- Do not add filter, group, sort, column settings, import, or export unless the user explicitly asks.
- Create, edit, and detail open in a right-side Drawer by default.
- Drawer default width is `60%`; on small screens it may become `100%`.
- Create/edit/detail Drawers default to header actions plus scrollable body, without a fixed footer. Save/cancel/edit/delete/close actions belong in the header action area unless the user or existing project pattern requires a footer.
- Drawer headers default to: left title area starts with fullscreen toggle when supported, followed by mode/status and title; right action area ends with one icon-only close button at the far right. Do not place a close button in the left title area and do not render both a left close icon and a right close action.
- Create forms must not render `Make.Field.File` upload/attachment controls when attachment upload requires a saved `recordID`. New records do not have `recordID`; omit file fields from create payloads and expose attachments only after the record exists, usually in edit/detail.
- Dense Make record Drawers should support a fullscreen toggle in the header when practical. When nested Drawers are opened, keep the previous Drawer underneath and close only the topmost Drawer at a time.
- Use route-based create/edit/detail pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.
- Object list navigation should use a dynamic object route such as `/objects/:objectKey` unless the host project already has a different dynamic convention.
- If create/edit/detail needs URL-addressable state, use dynamic child routes under the object route while keeping Drawer presentation by default.
- Make record tables must use `@qfei-design/canvas-table`; do not replace them with Ant Design Table, Arco Table, TDesign Table, or a hand-written HTML table.
- Make form fields must be schema-driven when DSL/schema is available. `Date`, `DateTime`, `DateRange`, `SingleUser`, `MultiUser`, `SingleDepartment`, `MultiDepartment`, `SingleSelect`, `MultiSelect`, `File`, and `Lookup` fields must use type-appropriate controls or read-only/association displays, not silent plain `Input` fallbacks. `File` fields are mode-sensitive: omit from create when upload needs `recordID`; render in edit/detail only when persisted record identity exists.
- If user/department candidate APIs are missing, create a searchable selector shell that shows the current value, supports an explicit manual-input fallback when necessary, and leaves a clear integration point for the real candidate API.

## Simple interactions this skill may guide

- sidebar collapse / expand
- search input and refresh placement
- optional filter Drawer or Popover placement
- optional sort, group, and column settings placement
- create/edit/detail Drawer layout and opening behavior
- loading, empty, error, and saving states

## Out of scope

- business fields or field meaning
- query and save APIs
- validation rules tied to business policy
- permission checks
- approval flows
- business data modeling or changing DSL; reading existing DSL/schema is required for schema-driven UI
- `@qfei-design/canvas-table` implementation details
- canvas-table cell editing lifecycle
