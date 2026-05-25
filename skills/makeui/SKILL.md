---
name: makeui
description: Use when designing, generating, refactoring, or reviewing Make App frontend UI and `apps/ui` code with React, Vite, and React Router. Also triggered by mentions of makeui or `skills/makeui`. Covers UI, 界面, 前端代码, app shell, page layout, styling, component placement, responsive behavior, dynamic object routes, schema-driven Make forms, list pages, create/edit/detail drawers, route-based form/detail pages, project structure, `apps/ui/dist` build output, and Service config entrypoint guidance. Requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, and authentication/login work to use `make-app-auth`. Does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# makeui

Current skill revision: 0.3.24.

Use this skill for Make App frontend UI work in `apps/ui`. The default stack is React + Vite + React Router. Do not switch frontend frameworks unless the user explicitly asks and the project already supports the alternative.

`makeui` owns UI structure, layout, visual styling, component placement, simple interactions, responsive behavior, and project UI baseline checks. It does not own business modeling, persistence, permissions, approval flows, auth internals, Make API design, or `canvas-table` internals.

## Quick start

1. Inspect the existing project stack, routes, shell, component library, styling, Node runtime, data flow, and `apps/` structure.
2. Check project baselines: workspace packages, `apps/ui/dist`, Service config entry, Service port `3000`, and Node `>=22.12.0`.
3. Preserve the host data flow. Use `make-app-auth` for auth/login work and `canvas-table-integration` for Make record tables.
4. Generate schema-driven UI from runtime schema/API responses. Do not generate UI or Service runtime code that reads local DSL/YAML files.
5. Use the dense object-management layout by default: left navigation, flat workspace header, local toolbar directly above the table, and no extra list-title card. Sidebar color follows the project theme.
6. Read only the needed reference files from the map below.

## Topic reference map

| Task / topic | Read |
| --- | --- |
| Project structure, boundaries, Node, build output, Service config | `references/principles.md` |
| App shell, sidebar, top header, viewport height chain | `references/app-shell-layout.md` |
| Object list page, toolbar placement, default actions | `references/list-page-layout.md` |
| Create/edit/detail Drawer, stacked Drawers, mask close, header actions | `references/drawer-layout.md` |
| Route-based create/edit/detail pages or URL-addressable state | `references/page-route-layout.md` |
| Component library choice and schema-driven field controls | `references/component-usage.md` |
| Spacing, density, responsive layout, loading/empty/error states | `references/styling-and-responsive.md` |
| Make record table display or cell editing | Use `canvas-table-integration` |
| Authentication, login, logout, token mode, unified login, `/api/make/**` | Use `make-app-auth` |

## Hard rules

### Project baseline

- Generated Make App projects use `apps/ui`, required `apps/service`, `apps/dsl`, and `apps/docs`.
- Runnable apps must be workspace packages: `apps/package.json`, `apps/pnpm-workspace.yaml`, `apps/ui/package.json`, and `apps/service/package.json`.
- Frontend build output is `apps/ui/dist`; Vite should set `build.outDir: "dist"` and `build.emptyOutDir: true`.
- Service has a centralized config entry. New projects use `apps/service/src/config.ts`.
- Service HTTP port is fixed to `3000`. If a legacy project uses another Service port, migrate it to `3000` and update UI base URL, CORS, docs, env examples, and tests together.
- Service config may read `MAKE_API_BASE_URL`, `MAKE_SERVER_URL`, or the host project's existing equivalent name. `makeui` must not decide environment-to-domain mapping.
- Use Node.js `>=22.12.0`; for new projects prefer the current active LTS.

### Data, schema, and auth

- Preserve the host data flow. If the project says `apps/ui -> apps/service -> Make Data API`, keep UI calls on the Service contract and do not hold Make tokens in UI.
- If the project uses a gateway/unified-login runtime, the data path is `apps/ui -> @qfeius/make-app-auth auth.api -> /api/make/** -> make-gateway -> Make Platform`.
- Do not silently switch a Service-based project to the gateway/auth-SDK flow, route a gateway/auth-SDK project through `apps/service`, bypass `auth.api`, rely on a Vite token proxy such as `/make-api`, or call meta/data service domains directly.
- Do not handwrite auth, OAuth, token, cookie, logout, `Authorization`, Org URLs, unified-login URLs, account-center URLs, or `/api/make/**` request logic in `makeui`; these belong to `make-app-auth`.
- Default generated UI may use `make-app-auth` token mode for local development. Unified login/OAuth/SSO/cookies/logout/callbacks, `auth.init({ redirect: true })`, SDK `gatewayBaseUrl`, `auth.api`, and `auth.logout()` behavior belong to `make-app-auth`.
- Generated App UI must not read or persist Org tokens, `zs_session`, or `make_app_session`.
- `apps/dsl` is a modeling artifact, not a runtime dependency. Generated UI and Service runtime code must not read `apps/dsl/**`, `/dsl/**`, or copied `*.yaml` schema files.
- Objects, fields, table columns, form fields, labels, editability, required state, select options, and lookup metadata come from backend schema APIs such as `/api/schema` and `/api/entities/:entityKey/fields`, or the host equivalent.
- User and department selectors query backend candidate APIs such as `/api/users` and `/api/departments`, or the host equivalent.
- If schema or candidate APIs are missing, report the API contract gap before generating UI. Do not use local DSL as a fallback field source.

### UI defaults

- Default object-list layout: left navigation, flat workspace header with title only, local toolbar, then `canvas-table`.
- Sidebar has a brand area, section labels, single-line object items, and a clear active state. Background color follows the project theme; do not default to dark.
- Sidebar items and workspace header titles do not get subtitles, descriptions, helper lines, schema summaries, or overview copy unless the user asks.
- The local toolbar sits above the table. Put search/filter/refresh on the left and create/new on the right. Do not put refresh in the global header, object title header, table header row, canvas-table header area, or column header area.
- Do not insert a summary/title card between the workspace header and table for default object lists.
- Do not add pagination, views, import/export, grouping, sorting, column settings, selection, or Kanban/split views unless requested.
- Make record tables must use `@qfei-design/canvas-table` via `canvas-table-integration`; do not replace them with UI-library tables.
- CanvasTable defaults to `showSN` sequence numbers and a hover-revealed row-head detail icon through `bodyRowHeadSuffixOptions`, unless the user explicitly says the table does not need it.
- Create/edit/detail use right-side Drawers by default. Drawer width defaults to `60%`, may become `100%` on small screens, and mask close is enabled.
- Create/edit forms use type-appropriate controls. Date, select, user, department, file, and lookup fields must not silently degrade to plain text inputs. File upload is omitted in create mode when upload requires an existing `recordID`.
- Use dynamic object routes such as `/objects/:objectKey`. Do not generate one hard-coded route component per object.

## Out of scope

- Business fields or field meaning
- Query/save API design
- Validation rules tied to business policy
- Permission checks and approval flows
- Business data modeling or DSL changes
- Authentication implementation details
- `@qfei-design/canvas-table` implementation or cell-edit lifecycle
