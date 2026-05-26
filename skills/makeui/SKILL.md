---
name: makeui
description: Use when designing, generating, refactoring, or reviewing Make App frontend UI and `apps/ui` code with React, Vite, and React Router. Also triggered by mentions of makeui or `skills/makeui`. Covers UI, 界面, 前端代码, app shell, page layout, styling, component placement, responsive behavior, dynamic object routes, schema-driven Make forms, list pages, create/edit/detail drawers, route-based form/detail pages, project structure, `apps/ui/dist` build output, and Service config entrypoint guidance. Requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, and authentication/login work to use `make-app-auth`. Does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# makeui

Current skill revision: 0.3.26.

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

## Target Make App structure

When generating or reorganizing a Make App project, follow the makecli agent target structure:

- `apps/ui`: React + Vite + React Router frontend
- `apps/service`: required Service layer for server-side orchestration, scripts, logs, custom APIs, and the UI -> Service -> Make API flow when the host project requires it
- `apps/dsl`: Make App / Entity / Relation DSL
- `apps/docs`: PRD and UI/Service API contracts
- `apps/packages/ui`, `apps/packages/types`, `apps/packages/config`: shared packages when needed

Preserve the host project's declared data flow:

- If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, keep that flow. UI code must use the Service API contract, must not hold Make tokens, and must not directly call Make APIs.
- If the host project is Service-fronted unified login, preserve that contract: UI calls the Service API through the project auth wrapper or `auth.api`, Service owns calls to make-gateway, and UI must not bypass Service by calling `/data/**` or `/meta/**` directly.
- If the project is a direct gateway/unified-login Make App, delegate authentication and Make backend request details to `make-app-auth` instead of defining SDK options or gateway paths in `makeui`.

Do not silently switch an existing Service-based project to the gateway/auth-SDK flow, and do not silently route a gateway/auth-SDK project's runtime Make data through `apps/service`. Explain the proposed change and wait for user confirmation before changing the data flow. UI code must not hold Make tokens, bypass the project auth wrapper, or rely on a Vite token proxy such as `/make-api`. `apps/service` is still part of the required project structure. This project structure rule is for generated Make App projects; it does not mean the `makeui` skill repository itself should be reorganized into `apps/`.

## Workspace package baseline

When generating or reorganizing a Make App project into the `apps/` structure, directories alone are not enough. Each runnable app must be a valid workspace package.

Required files:

- `apps/package.json`
- `apps/pnpm-workspace.yaml`
- `apps/ui/package.json`
- `apps/service/package.json`

`apps/pnpm-workspace.yaml` must include:

```yaml
packages:
  - "ui"
  - "service"
  - "packages/*"
```

`apps/package.json` must provide runnable entry scripts such as `app:ui`, `app:service`, and `dev`. Filter targets must match the actual package names. If package names are scoped, for example `@expense-poc/ui`, use the scoped names in `pnpm --filter`.

For legacy-project refactors, do not finish after moving source files into `apps/ui` or `apps/service`. Verify and create the missing package manifests, scripts, workspace config, and Node engine declarations before considering the restructure complete. If UI and Service are published as separate K8s apps, both `apps/ui/package.json` and `apps/service/package.json` are required build inputs.

## Make App Auth Dependency

When generating or modifying Make App frontend authentication, always apply `make-app-auth`.

`makeui` must not implement authentication details itself. Do not generate auth, OAuth, token, cookie, logout, or `/api/make/**` request logic directly from this skill.

Default generated UI should follow the auth mode selected by `make-app-auth`. In the current Make App generation baseline, that means unified login by default and token mode only as an explicit local/debug override. Auth SDK options, OAuth, SSO, cookies, logout, redirect callbacks, 401/403 handling, and authenticated `/api/make/**` details are owned by `make-app-auth` and its references.

Preserve the host project's declared data flow. If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, keep that flow and do not replace it with the auth-SDK gateway flow without explicit user confirmation. If the host project is Service-fronted unified login, preserve that contract: UI calls the Service API through the project auth wrapper or `auth.api`, Service owns calls to make-gateway, and UI must not bypass Service by calling `/data/**` or `/meta/**` directly. `apps/service` remains required project structure.

Hard boundary:

- Use `@qfeius/make-app-auth` for auth bootstrap and `auth.api` for `/api/make/**`.
- Do not hand-write `Authorization`.
- Do not hard-code Org, unified-login, or account-center domains; those URLs must come from make-gateway through `make-app-auth`.
- Do not read or persist Org tokens, `zs_session`, or `make_app_session`.
- Do not build Org OAuth/logout URLs in App UI code.
- Do not bypass `/api/make/**` to call meta/data services directly.
- For Service-fronted Apps, do not bypass Service by calling `/data/**` or `/meta/**` from UI; use the Service API contract through the project auth wrapper or `auth.api`.

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
- Default generated UI follows the auth mode selected by `make-app-auth`; unified-login/OAuth/SSO/cookies/logout/callbacks, SDK `gatewayBaseUrl`, `auth.api`, and `auth.logout()` behavior belong to `make-app-auth`.
- Generated App UI must not read or persist Org tokens, `zs_session`, or `make_app_session`.
- `apps/dsl` is a modeling artifact, not a runtime dependency. Generated UI and Service runtime code must not read `apps/dsl/**`, `/dsl/**`, or copied `*.yaml` schema files.
- Objects, fields, table columns, form fields, labels, editability, required state, select options, and lookup metadata come from backend schema APIs such as `/api/schema` and `/api/entities/:entityKey/fields`, or the host equivalent.
- User and department selectors query backend candidate APIs such as `/api/users` and `/api/departments`, or the host equivalent.
- If schema or candidate APIs are missing, report the API contract gap before generating UI. Do not use local DSL as a fallback field source.

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
- Create/edit forms use type-appropriate controls. Date, select, user, department, file, and lookup fields must not silently degrade to plain text inputs. File upload is omitted in create mode when upload requires an existing `recordID`.
- Use dynamic object routes such as `/objects/:objectKey`. Do not generate one hard-coded route component per object.

## Pre-flight workflow

Before generating or editing UI:

1. Identify the host data flow: UI -> Service -> Make API, Service-fronted unified login (`auth.api("/app/**")` -> Service), or direct auth-SDK gateway. Preserve existing project instructions and API contracts unless the user confirms a change.
2. If reorganizing into `apps/`, verify the workspace package baseline, `apps/ui/dist` build output, and Service config baseline before editing UI code.
3. Use React Router dynamic params for Make object routes. Do not generate a separate hard-coded route component per object.
4. For Make App frontend authentication, login, logout, token mode, unified login, authenticated `/api/make/**`, or business-request 401/403 behavior, apply `make-app-auth`. Do not hand-write auth logic in `makeui`.

## Out of scope

- Business fields or field meaning
- Query/save API design
- Validation rules tied to business policy
- Permission checks and approval flows
- Business data modeling or DSL changes
- Authentication implementation details
- `@qfei-design/canvas-table` implementation or cell-edit lifecycle
