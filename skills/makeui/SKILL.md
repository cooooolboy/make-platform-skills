---
name: makeui
description: Use when designing, generating, refactoring, or reviewing Make App frontend UI and `apps/ui` code with React, Vite, and React Router. Also triggered by mentions of makeui or `skills/makeui`. Covers UI, 界面, 前端代码, app shell, page layout, styling, component placement, responsive behavior, dynamic object routes, schema-driven Make forms, list pages, create/edit/detail drawers, route-based form/detail pages, project structure, `apps/ui/dist` build output, and Service config entrypoint guidance. Requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, and authentication/login work to use `make-app-auth`. Does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/makeui
---

# makeui

Current skill revision: 0.3.19.

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

## Quick start

For Make App UI work:

1. Inspect the existing project stack, routes, shell, component library, styling, Node runtime, and `apps/` structure.
2. Verify `apps/ui`, `apps/service`, package manifests, workspace config, `apps/ui/dist`, and Service config entrypoint requirements when creating or reorganizing projects.
3. Preserve the host data flow and auth mode; use `make-app-auth` for authentication details and `canvas-table-integration` for Make record tables.
4. Read the minimum references from the topic map below.
5. Generate schema-driven UI only after reading DSL/schema; do not silently turn typed Make fields into plain text.
6. Keep list pages simple by default: shell, local toolbar, search, refresh, create, and a canvas-table region with no pagination unless requested.

## Topic reference map

Read only the references needed for the current task:

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

## Common gotchas

- Do not consider an `apps/ui` or `apps/service` move complete until the child `package.json` files and `apps/pnpm-workspace.yaml` exist.
- Do not put frontend build artifacts anywhere except `apps/ui/dist`.
- Do not omit the Service config entrypoint; new projects use `apps/service/src/config.ts`.
- Do not add pagination, views, import/export, filters, grouping, sorting, or selection unless the user asks.
- Do not replace Make record tables with UI-library tables; use `canvas-table-integration`.
- Do not invent business API shapes, permissions, approval states, persistence rules, or DSL changes from `makeui`.

## Target Make App structure

When generating or reorganizing a Make App project, follow the makecli agent target structure:

- `apps/ui`: React + Vite + React Router frontend
- `apps/service`: required Service layer for server-side orchestration, scripts, logs, custom APIs, and the UI -> Service -> Make API flow when the host project requires it
- `apps/dsl`: Make App / Entity / Relation DSL
- `apps/docs`: PRD and UI/Service API contracts
- `apps/packages/ui`, `apps/packages/types`, `apps/packages/config`: shared packages when needed

Preserve the host project's declared data flow:

- If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, keep that flow. UI code must use the Service API contract, must not hold Make tokens, and must not directly call Make APIs.
- Service-based unified-login Apps may still use `@qfeius/make-app-auth`: UI calls `auth.api("/app/**")`, App Service owns `/api/make/app/**`, and Service calls make-gateway internally. Do not replace this with UI direct `/data/**` or `/meta/**` calls.
- If the project is generating a gateway/unified-login Make App frontend, runtime Make data access may use:

```text
apps/ui -> @qfeius/make-app-auth auth.api -> /api/make/** -> make-gateway -> Make Platform
```

Do not silently switch an existing Service-based project to the gateway/auth-SDK flow, and do not silently route a gateway/auth-SDK project's runtime Make data through `apps/service`. Explain the proposed change and wait for user confirmation before changing the data flow. UI code must not hold Make tokens, bypass `auth.api`, or rely on a Vite token proxy such as `/make-api`. `apps/service` is still part of the required project structure. This project structure rule is for generated Make App projects; it does not mean the `makeui` skill repository itself should be reorganized into `apps/`.

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

## Build and Service config baseline

When generating or reorganizing a Make App project:

- The frontend build output must be `apps/ui/dist`. Generated or updated `apps/ui/vite.config.ts` should set `build.outDir: "dist"` and `build.emptyOutDir: true`. Do not publish, upload, or point static asset discovery at a root `dist` or `apps/dist`.
- Service must have one centralized runtime config entry. For new projects, use `apps/service/src/config.ts`. For legacy projects, preserve an existing equivalent config entry if it already centralizes runtime config; otherwise add `apps/service/src/config.ts`.
- Service config may read environment variables such as `MAKE_API_BASE_URL`, `MAKE_SERVER_URL`, or the host project's existing equivalent name. Follow existing naming instead of forcing a rename.
- `makeui` must not decide which environment connects to which Make domain, gateway, or API host. Domain mapping, gateway routing, and secret injection belong to backend, operations, Make tooling, or the deployed Service runtime.
- `apps/service/.env.example` may expose config keys with blank placeholders, but must not include real tokens or hard-code production, staging, or test Make API domains. Make API URL examples belong to `makedsl`/`makecli` references, not Make UI generation rules.

## Make App Auth Dependency

When generating or modifying Make App frontend authentication, always apply `make-app-auth`.

`makeui` must not implement authentication details itself. Do not generate auth, OAuth, token, cookie, logout, or `/api/make/**` request logic directly from this skill.

Default generated UI should use `make-app-auth` token mode for local development. Unified login, OAuth, SSO, cookies, logout, redirect callbacks, and authenticated `/api/make/**` requests are owned by `make-app-auth` and its references.

Preserve the host project's declared data flow. If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, keep that flow and do not replace it with the auth-SDK gateway flow without explicit user confirmation. If the project uses Service-fronted unified login, use `auth.api` only for same-origin `/api/make/app/**` Service APIs and let Service call make-gateway. If the project uses a gateway/unified-login Make App runtime path, coordinate auth and `/api/make/**` behavior through `make-app-auth`. `apps/service` remains required project structure.

Hard boundary:

- Use `@qfeius/make-app-auth` for auth bootstrap and `auth.api` for `/api/make/**`.
- All Make backend requests must go through a shared Make API adapter or data-source layer that wraps `auth.api`; do not scatter direct `auth.api` calls across UI components without the shared 401/403 handler.
- Schema/meta, list, get, create, update, delete, attachment/file, lookup, user, and department candidate requests are all Make backend requests and must follow the same adapter rule.
- In unified-login mode, generated SDK config should set `apiAuthRedirect: true` with `@qfeius/make-app-auth >= 0.1.2`, unless the project has a deliberate custom error flow.
- If App code needs to pass SDK `gatewayBaseUrl`, reuse the host Make backend config / `makecli` `server-url` value. Do not create another URL setting for the same Make backend.
- Do not hand-write `Authorization`.
- Do not hard-code Org, unified-login, or account-center domains; those URLs must come from make-gateway through `make-app-auth`.
- Do not read or persist Org tokens, `zs_session`, or `make_app_session`.
- In unified-login mode, direct unauthenticated App entry should go to the Org login page through `auth.init({ redirect: true })`; do not design an App-owned login page, login transition page, or signed-out completion page.
- Do not build Org OAuth/logout URLs in App UI code.
- Do not bypass `/api/make/**` to call meta/data services directly.
- For Service-based Apps, do not bypass Service by calling `/data/**` or `/meta/**` from UI; use `/app/**` paths through `auth.api` according to the Service API contract.
- In unified-login authenticated state, render a visible `退出账号` action in the App shell header and wire it to the auth wrapper/SDK `auth.logout()` only.
- If logout should return users to the phone/code login flow, rely on the SDK and the next `auth.init({ redirect: true })`; do not add UI-side account-center URL rewriting.

## Node runtime

Use Node.js `>=22.12.0` for Make App frontend projects.

- Recommend the current active LTS for new projects. At the time of this update, use Node.js 24 LTS by default.
- Do not choose Node.js 20 as the default for new projects.
- For new projects, add `package.json` `engines.node` as `>=22.12.0`.
- If the project uses a version manager, prefer a simple major-version file such as `.nvmrc` or `.node-version` with `24`.
- If an existing project already has a stricter Node requirement, keep the stricter project requirement.

## Service-based local dev baseline

For Service-based Make App projects, the `apps/service` local service port is fixed to `3000`.

When generating, reorganizing, or changing a Service-based Make App frontend, configure the App Service process to listen on `0.0.0.0:3000` or `localhost:3000` according to the host project's existing server binding style. Do not choose another App Service port and do not preserve an existing non-3000 Service port unless the user explicitly overrides this rule for the current project.

Any frontend Service port change must update the whole local contract in the same change:

- `apps/service` runtime config, listen host, listen port, and any shared server config helper
- UI Vite proxy or Service base URL config that points to the App Service
- Service CORS allowlist for the UI origin and equivalent host bindings used by the project
- `.env.example` or local environment documentation
- `apps/docs/api.md` when the UI / Service contract mentions local origins
- focused tests for the App Service port config, UI proxy/base URL config, and Service CORS behavior

Do not copy the gateway/unified-login `5174` port rule into a Service-based project unless that project explicitly uses the gateway flow.

## Pre-flight workflow

Before generating or editing UI:

1. Inspect the project for existing Node runtime requirements, frontend stack, component library, styling solution, routes, layout shell, and page patterns.
2. Use existing project conventions first.
3. Identify the host data flow: UI -> Service -> Make API, Service-fronted unified login (`auth.api("/app/**")` -> Service), or direct auth-SDK gateway. Preserve existing project instructions and API contracts unless the user confirms a change.
4. If reorganizing into `apps/`, verify the workspace package baseline, `apps/ui/dist` build output, and Service config baseline before editing UI code.
5. Verify the project Node runtime is compatible with the Make default baseline or the project's stricter requirement.
6. If the project is being created from scratch and no component library is established, stop before scaffolding component-library-specific UI and require the user to choose Ant Design, Arco Design, or TDesign. Recommend Ant Design, but do not choose it for the user. If the user has not chosen, only produce a component-library-neutral plan or ask the selection question.
7. If the user did not specify a styling solution and the project has none, Less is an acceptable default candidate.
8. Before generating Make object lists, Drawer forms/details, route forms/details, or schema-driven fields, read the available DSL/schema source. Prefer existing `apps/dsl`, then Service `/api/schema`, then project-local schema/meta types or fixtures. If no schema source exists, explain the missing source and the explicit downgrade strategy before generating UI.
9. Identify the Make field types that drive form controls and table display. Date, user, department, select, file, and lookup fields must not silently become plain text inputs.
10. Identify the page type:

- list page
- create/edit UI
- detail UI

11. Identify the container mode:

- create/edit/detail default to right-side Drawer
- route-based pages only when the user explicitly asks for a page, route, navigation, or standalone screen

12. Use React Router dynamic params for Make object routes. Do not generate a separate hard-coded route component per object.
13. For Make App frontend authentication, login, logout, token mode, unified login, authenticated `/api/make/**`, or business-request 401/403 behavior, apply `make-app-auth`. Do not hand-write auth logic in `makeui`.
14. For any Make record table or list table, use `@qfei-design/canvas-table` through `canvas-table-integration`. This includes table display and cell editing. This skill only defines the surrounding layout and placement. Do not add pagination controls, page-size controls, page state, page query params, total-count handling, or paginated data-fetch logic unless the user explicitly asks for pagination.

## Required references

Read only the reference files needed for the request:

- General boundaries and defaults: `references/principles.md`
- App shell, side navigation, top header, and height chain: `references/app-shell-layout.md`
- List pages and toolbar button placement: `references/list-page-layout.md`
- Create/edit/detail Drawer layout: `references/drawer-layout.md`
- Route-based create/edit/detail pages: `references/page-route-layout.md`
- Component library and styling selection: `references/component-usage.md`
- Spacing, density, scroll, states, and responsiveness: `references/styling-and-responsive.md`

Authentication and `/api/make/**` access are handled by the separate `make-app-auth` skill.

## Core defaults

- New Make App UI must start from the application shell. Do not generate an object list page directly under `body` or a standalone page root unless the project already provides a reusable shell to plug into.
- The default Make object-list shell is:
  - left full-height sidebar for modules or object navigation
  - right fixed-height header with the current object/module name on the left
  - current user/avatar and global actions from the host/auth layer on the header right
  - page-local toolbar below the header
  - `canvas-table` region filling the remaining height
  - no pagination by default
- Do not create a "view" concept by default. No view tabs, view dropdowns, Kanban view, split view, or view switcher unless the user explicitly asks.
- A default list page includes only:
  - search
  - refresh
  - create/new
- Do not add pagination, filter, group, sort, column settings, import, or export unless the user explicitly asks.
- Create, edit, and detail open in a right-side Drawer by default.
- Drawer default width is `60%`; on small screens it may become `100%`.
- Create/edit/detail Drawers are mask-closable by default. Clicking the mask or blank area closes the current Drawer, using the same close path as the header close control.
- Create/edit/detail Drawers default to header actions plus scrollable body, without a fixed footer. Primary save/submit actions, detail contextual actions, and the final close action belong in the header action area unless the user or existing project pattern requires a footer. Do not add a separate cancel button when it only duplicates the final close action.
- Drawer headers default to: left title area starts with fullscreen toggle when supported, followed by mode/status and title; right action area ends with one icon-only close button at the far right. Do not place a close button in the left title area and do not render both a left close icon and a right close action.
- Create forms must not render `Make.Field.File` upload/attachment controls when attachment upload requires a saved `recordID`. New records do not have `recordID`; omit file fields from create payloads and expose attachments only after the record exists, usually in edit/detail.
- Dense Make record Drawers should support a fullscreen toggle in the header when practical. When nested Drawers are opened, keep the previous Drawer underneath and close only the topmost Drawer at a time.
- Lookup values may open associated record details only when the parsed lookup item has a target `entityKey`/entity and `recordID`, and is not marked deleted. Open the associated record in the established detail Drawer stack; do not create a public route just for this interaction unless the user asks. Guard async lookup-detail loads so a response cannot reopen a detail Drawer after the source Drawer has already closed.
- Use route-based create/edit/detail pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.
- Object list navigation should use a dynamic object route such as `/objects/:objectKey` unless the host project already has a different dynamic convention.
- For Make v0.3.0 schemas, always treat `entity.key` as the object route/API key and `entity.name` as display text. Do not route by Chinese object names.
- For fields, use `field.key` for record data keys, canvas-table column keys, filter fields, sort fields, edit commits, and API payloads. Use `field.name` only for labels, column titles, detail display, and menu text.
- Lookup relation form logic must read `field.properties.relation` as relation key and `field.properties.targetFieldKey` as target field key. Relation writes use `qfei_relation: [{ entityKey, id }]`.
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
