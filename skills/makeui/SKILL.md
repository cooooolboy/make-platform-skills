---
name: makeui
description: Use when designing, generating, refactoring, or reviewing Make App frontend UI and `apps/ui` React UI code. Also triggered by mentions of makeui or `skills/makeui`. Covers UI, 界面, app shell, page layout, styling, component placement, responsive behavior, dynamic object routes, field-metadata-driven UI rendering, list pages, create/edit/detail drawers, route-based form/detail pages, user/department selector UI candidate-source usage, and UI states. Requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`. Does not cover authentication/login, build output, publishing/deployment, Service runtime, business API design, permissions, data persistence, business modeling, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# makeui

Current skill revision: 0.3.31.

Use this skill for Make App frontend UI work in `apps/ui`. The default stack is React + Vite + React Router, but `makeui` only owns UI structure and presentation decisions.

`makeui` owns app shell layout, navigation layout, list-page layout, toolbar placement, component-library usage, field-control presentation, create/edit/detail layout, user/department selector UI behavior, responsive behavior, visual states, and UI polish. It does not own authentication/login, frontend build or publish rules, Service runtime structure, business API/data contracts, permissions, persistence, business modeling, domain mapping, or `canvas-table` internals.

## Quick start

1. Inspect the existing UI stack, routes, shell, component library, styling system, and page layout conventions.
2. Preserve the host project's data and auth behavior. Do not design login, tokens, business API routes, Service orchestration, deployment, or build output in this skill.
3. Use host-provided object/field metadata to render UI. Do not invent business fields or API contracts.
4. Use the dense object-management layout by default: left navigation, flat workspace header, local toolbar directly above the table, and no extra list-title card. Sidebar color follows the project theme.
5. Wrap object routes with visible UI states: loading, empty, error, forbidden, expired-session, not-found, retry, and render-error fallback.
6. Use the ExpensePoc-style create/edit/detail layout by default: right Drawer, desktop two-column field grid, full-span rows only for wide fields, and one-column only on small screens or explicit user request.
7. Render detail values through a field-type display adapter. Do not display raw objects, arrays, or JSON wrapper text when the field type has a stable Make display shape.
8. Read only the needed reference files from the map below.

## Topic reference map

| Task / topic | Read |
| --- | --- |
| UI scope, boundaries, shell defaults, dynamic routes | `references/principles.md` |
| App shell, sidebar, top header, viewport height chain | `references/app-shell-layout.md` |
| Object list page, toolbar placement, default actions | `references/list-page-layout.md` |
| Create/edit/detail Drawer, stacked Drawers, mask close, header actions | `references/drawer-layout.md` |
| Route-based create/edit/detail pages or URL-addressable state | `references/page-route-layout.md` |
| Component library choice, field-type UI controls, detail value display | `references/component-usage.md` |
| Spacing, density, responsive layout, loading/empty/error states | `references/styling-and-responsive.md` |
| Make record table display or cell editing | Use `canvas-table-integration` |
| Authentication, login, logout, token, session behavior | Use `make-app-auth`; `makeui` only owns visual slot placement |
| Build output, Service runtime, packaging, publish readiness | Use `make-app-runtime`; `makeui` does not own runtime contracts |

## Hard rules

### Scope boundary

- Do not add or modify authentication/login, token, OAuth, cookie, logout, `/api/make/**`, domain, gateway, deployment, Docker/K8s, Node runtime, package-manager, build-output, or Service runtime rules in `makeui`.
- Do not define business API paths, Service contracts, data persistence, permissions, approval flows, or environment mapping in `makeui`. The only allowed endpoint guidance here is the default user/department candidate-source behavior for UI selectors. Route names must yield to host project docs and the owning Service/API skill when the host documents a different transport.
- If the task needs auth/login/logout/session behavior, use `make-app-auth`. If the task needs build output, Service runtime, packaging, or publish-readiness rules, use `make-app-runtime`.
- `makeui` may consume host-provided object/field metadata for UI rendering, but must not decide how that metadata is fetched, stored, authenticated, or deployed.

### UI metadata and states

- Generated UI consumes normalized, host-provided object/field metadata. Do not pass raw backend schema variants directly into table, form, detail, route, or shell components.
- `apps/dsl` is a modeling artifact, not a UI runtime dependency. Generated UI must not read `apps/dsl/**`, `/dsl/**`, or copied `*.yaml` files as its field source.
- If object/field metadata is missing or inconsistent, show a visible UI dependency/error state and report the missing dependency. Do not invent business API paths, parse local DSL, or create fake user/department/business fallback data in `makeui`.
- Schema, data, route, and render failures must resolve to visible object-shell states: loading, empty, error, forbidden, expired-session, retry, not-found, or render-error. Do not let exceptions become a blank page.

### UI defaults

- Default object-list layout: left navigation, flat workspace header with title only, local toolbar, then `canvas-table`.
- Sidebar has a brand area, section labels, single-line object items, and a clear active state. Background color follows the project theme; do not default to dark.
- Sidebar active item highlight must be centered inside the sidebar content gutter, with consistent left/right inset and no overflow to the sidebar edge.
- Sidebar items and workspace header titles do not get subtitles, descriptions, helper lines, schema summaries, or overview copy unless the user asks.
- The local toolbar sits above the table. Put search/filter/refresh on the left and create/new on the right. Do not put refresh in the global header, object title header, table header row, canvas-table header area, or column header area.
- Do not insert a summary/title card between the workspace header and table for default object lists.
- Do not add pagination, views, import/export, grouping, sorting, column settings, selection, or Kanban/split views unless requested.
- Make record tables must use `@qfei-design/canvas-table` via `canvas-table-integration`; do not replace them with UI-library tables.
- CanvasTable wrapper and host must fill the available content width and remaining height; use a flex height chain or accurate `calc()` fallback instead of fixed table dimensions.
- CanvasTable defaults to `showSN` sequence numbers and a hover-revealed row-head detail icon through `bodyRowHeadSuffixOptions`, unless the user explicitly says the table does not need it.
- Create/edit/detail must use right-side Drawer-style surfaces for default Make object CRUD. Ant Design uses `Drawer placement="right"`; shadcn/ui uses `Sheet side="right"`. Width defaults to `60%` and may become `100%` on small screens, but the surface still opens from the right. Do not use bottom Drawer/Sheet, centered Modal/Dialog, or bottom sheet unless the user explicitly asks for that different surface.
- Create/edit/detail desktop layouts default to two columns. Do not render all fields as one full-width column on desktop unless the user explicitly asks or the viewport is too narrow.
- Create/edit fields default to a vertical-label two-column grid. Common fields occupy one column; wide fields such as `TextArea`, `URL`/link, `File`, `Lookup`/relation selectors, long text, and rich controls span the full row. Collapse to one column on small screens.
- Detail views default to a compact two-column label/value grid. Common fields occupy one column; long text, `TextArea`, `URL`/link-rich values, `File`, `Lookup`/relation values, attachment-heavy values, and rich content span the full row.
- Detail values must be normalized by Make field type before rendering. Date range objects such as `{ begin, end }` or arrays such as `[begin, end]` display as a formatted range, not raw JSON; select/user/department/file/lookup values use their type-specific read-only renderers. Empty values display a muted `-`.
- Detail Drawer/page titles should show the complete selected object or record title whenever space permits. Give the title area flexible width and use ellipsis only for true overflow; keep the full title available through a tooltip or accessible title. Do not create a tiny title slot that truncates otherwise displayable titles.
- Create/edit forms use type-appropriate controls. Date, select, user, department, file, and lookup fields must not silently degrade to plain text inputs. File upload is omitted in create mode when upload requires an existing record identity.
- User and department selector UI must consume host candidate APIs. Generated Make App UI-Service defaults are `GET /api/users?keyword=&page=&size=` and `GET /api/departments?keyword=&page=&size=`, normalized to selector options with `userId/userName` and `departmentId/departmentName`, unless the host project documents equivalent Service/API routes.
- Do not use field schema `options`, local demo arrays, row samples, hardcoded names, or stale client-only lists as the source of truth for user/department selectors. Current record values may be merged into options only to echo existing selections while the real candidate API is loading or temporarily empty. If the selector appears inside advanced filter or CanvasTable cell editing, implement the surface with `make-app-filter` or `canvas-table-integration` while preserving this candidate-source contract.
- Use dynamic object routes such as `/objects/:objectKey`. Do not generate one hard-coded route component per object.

## Out of scope

- Authentication, login, token, logout, session, or SDK integration
- Frontend build output, package scripts, publishing, deployment, Docker, K8s, or runtime readiness
- Service structure, Service config, Service port, API proxy, or API orchestration
- Business fields or field meaning
- Query/save API design
- Validation rules tied to business policy
- Permission checks and approval flows
- Business data modeling or DSL changes
- `@qfei-design/canvas-table` implementation or cell-edit lifecycle
