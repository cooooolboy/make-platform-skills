---
name: makeui
description: Use when designing, generating, refactoring, or reviewing Make App frontend UI and `apps/ui` React UI code. Also triggered by mentions of makeui or `skills/makeui`. Covers UI, 界面, app shell, page layout, styling, component placement, responsive behavior, dynamic object routes, field-metadata-driven UI rendering, list pages, create/edit/detail drawers, route-based form/detail pages, and UI states. Requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`. Does not cover authentication/login, build output, publishing/deployment, Service runtime, APIs, permissions, data persistence, business modeling, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# makeui

Current skill revision: 0.3.28.

Use this skill for Make App frontend UI work in `apps/ui`. The default stack is React + Vite + React Router, but `makeui` only owns UI structure and presentation decisions.

`makeui` owns app shell layout, navigation layout, list-page layout, toolbar placement, component-library usage, field-control presentation, create/edit/detail layout, responsive behavior, visual states, and UI polish. It does not own authentication/login, frontend build or publish rules, Service runtime structure, API/data contracts, permissions, persistence, business modeling, domain mapping, or `canvas-table` internals.

## Quick start

1. Inspect the existing UI stack, routes, shell, component library, styling system, and page layout conventions.
2. Preserve the host project's data and auth behavior. Do not design login, tokens, API routes, Service orchestration, deployment, or build output in this skill.
3. Use host-provided object/field metadata to render UI. Do not invent business fields or API contracts.
4. Use the dense object-management layout by default: left navigation, flat workspace header, local toolbar directly above the table, and no extra list-title card. Sidebar color follows the project theme.
5. Wrap object routes with visible UI states: loading, empty, error, forbidden, expired-session, not-found, retry, and render-error fallback.
6. Use the ExpensePoc-style create/edit/detail layout by default: right Drawer, desktop two-column field grid, full-span rows only for wide fields, and one-column only on small screens or explicit user request.
7. Read only the needed reference files from the map below.

## Topic reference map

| Task / topic | Read |
| --- | --- |
| UI scope, boundaries, shell defaults, dynamic routes | `references/principles.md` |
| App shell, sidebar, top header, viewport height chain | `references/app-shell-layout.md` |
| Object list page, toolbar placement, default actions | `references/list-page-layout.md` |
| Create/edit/detail Drawer, stacked Drawers, mask close, header actions | `references/drawer-layout.md` |
| Route-based create/edit/detail pages or URL-addressable state | `references/page-route-layout.md` |
| Component library choice and field-type UI controls | `references/component-usage.md` |
| Spacing, density, responsive layout, loading/empty/error states | `references/styling-and-responsive.md` |
| Make record table display or cell editing | Use `canvas-table-integration` |
| Authentication, login, logout, token, session behavior | Use `make-app-auth`; `makeui` only owns visual slot placement |
| Build output, Service runtime, packaging, publish readiness | Use `make-app-runtime`; `makeui` does not own runtime contracts |

## Hard rules

### Scope boundary

- Do not add or modify authentication/login, token, OAuth, cookie, logout, `/api/make/**`, domain, gateway, deployment, Docker/K8s, Node runtime, package-manager, build-output, or Service runtime rules in `makeui`.
- Do not define API paths, Service contracts, data persistence, permissions, approval flows, or environment mapping in `makeui`.
- If the task needs auth/login/logout/session behavior, use `make-app-auth`. If the task needs build output, Service runtime, packaging, or publish-readiness rules, use `make-app-runtime`.
- `makeui` may consume host-provided object/field metadata for UI rendering, but must not decide how that metadata is fetched, stored, authenticated, or deployed.

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
- Create/edit/detail use right-side Drawers by default. Drawer width defaults to `60%`, may become `100%` on small screens, and mask close is enabled.
- Create/edit/detail desktop layouts default to two columns. Do not render all fields as one full-width column on desktop unless the user explicitly asks or the viewport is too narrow.
- Create/edit fields default to a vertical-label two-column grid. Common fields occupy one column; wide fields such as `TextArea`, `URL`/link, `File`, `Lookup`/relation selectors, long text, and rich controls span the full row. Collapse to one column on small screens.
- Detail views default to a compact two-column label/value grid. Common fields occupy one column; long text, `TextArea`, `URL`/link-rich values, `File`, `Lookup`/relation values, attachment-heavy values, and rich content span the full row.
- Create/edit forms use type-appropriate controls. Date, select, user, department, file, and lookup fields must not silently degrade to plain text inputs. File upload is omitted in create mode when upload requires an existing record identity.
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
