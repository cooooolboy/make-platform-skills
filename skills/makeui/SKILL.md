---
name: skills/makeui
description: Use when designing or generating Make App frontend UI, `apps/ui` code, UI, 界面, or 前端代码 with React + Vite + React Router. This skill covers general page layout, visual styling, component placement, simple page interactions, responsive behavior, dynamic object routes, list pages, create/edit drawers, detail drawers, component-library selection guidance, and route-based form/detail pages when explicitly requested. It requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, including cell editing when needed. It does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
version: 0.3.2
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

## Pre-flight workflow

Before generating or editing UI:

1. Inspect the project for existing frontend stack, component library, styling solution, routes, layout shell, and page patterns.
2. Use existing project conventions first.
3. If the project is being created from scratch, allow the user to choose the component library when that choice is in scope. Recommend Ant Design by default; Arco Design and TDesign are acceptable React alternatives.
4. If the user did not specify a styling solution and the project has none, Less is an acceptable default candidate.
5. Identify the page type:
   - list page
   - create/edit UI
   - detail UI
6. Identify the container mode:
   - create/edit/detail default to right-side Drawer
   - route-based pages only when the user explicitly asks for a page, route, navigation, or standalone screen
7. Use React Router dynamic params for Make object routes. Do not generate a separate hard-coded route component per object.
8. For any Make record table or list table, use `@qfei-design/canvas-table` through `canvas-table-integration`. This includes table display and cell editing. This skill only defines the surrounding layout and placement.

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

- Do not create a "view" concept by default. No view tabs, view dropdowns, Kanban view, split view, or view switcher unless the user explicitly asks.
- A default list page includes only:
  - search
  - refresh
  - create/new
- Do not add filter, group, sort, column settings, import, or export unless the user explicitly asks.
- Create, edit, and detail open in a right-side Drawer by default.
- Drawer default width is `75%`; on small screens it may become `100%`.
- Use route-based create/edit/detail pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.
- Object list navigation should use a dynamic object route such as `/objects/:objectKey` unless the host project already has a different dynamic convention.
- If create/edit/detail needs URL-addressable state, use dynamic child routes under the object route while keeping Drawer presentation by default.
- Make record tables must use `@qfei-design/canvas-table`; do not replace them with Ant Design Table, Arco Table, TDesign Table, or a hand-written HTML table.

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
- data modeling or DSL
- `@qfei-design/canvas-table` implementation details
- canvas-table cell editing lifecycle
