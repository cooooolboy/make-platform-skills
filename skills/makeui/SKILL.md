---
name: skills/makeui
description: Use when designing or generating Make App frontend UI, `apps/ui` code, UI, 界面, or 前端代码 with React + Vite + React Router. This skill covers general page layout, visual styling, component placement, simple page interactions, responsive behavior, dynamic object routes, schema-driven Make forms, list pages, create/edit drawers, detail drawers, component-library selection guidance, and route-based form/detail pages when explicitly requested. It requires Make record tables to use `@qfei-design/canvas-table` through `canvas-table-integration`, including cell editing when needed. It does not cover business modeling, APIs, permissions, data persistence, approval flows, or canvas-table internals.
version: 0.3.16
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
- `apps/service`: required Service layer for server-side orchestration, scripts, logs, custom APIs, and the UI -> Service -> Make API flow when the host project requires it
- `apps/dsl`: Make App / Entity / Relation DSL
- `apps/docs`: PRD and UI/Service API contracts
- `apps/packages/ui`, `apps/packages/types`, `apps/packages/config`: shared packages when needed

Preserve the host project's declared data flow:

- If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, keep that flow. UI code must use the Service API contract, must not hold Make tokens, and must not directly call Make APIs.
- If the project is generating a gateway/unified-login Make App frontend, runtime Make data access may use:

```text
apps/ui -> @qfei/make-app-auth -> /api/make -> make-gateway -> Make Platform
```

Do not silently switch an existing Service-based project to the gateway/auth-SDK flow, and do not silently route a gateway/auth-SDK project's runtime Make data through `apps/service`. Explain the proposed change and wait for user confirmation before changing the data flow. `apps/service` is still part of the required project structure. This project structure rule is for generated Make App projects; it does not mean the `makeui` skill repository itself should be reorganized into `apps/`.

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

## Make App auth baseline

When generating a gateway/unified-login Make App frontend, wire authentication through `@qfei/make-app-auth` by default. This is only the frontend authentication/access boundary; it does not define business API semantics. If the host project already declares the UI -> Service -> Make API flow, do not replace that flow with the auth-SDK gateway flow without explicit user confirmation.

Prefer copying the minimal setup shape from:

```text
make-app-auth-sdk/templates/vibe-app
```

Use the Git dependency unless the host project already has a published package source:

```json
{
  "dependencies": {
    "@qfei/make-app-auth": "git+ssh://git@git.qtech.cn/make/make-app-auth-sdk.git#main"
  }
}
```

Bootstrap should stay thin. Generated Vibe Apps should check the current App session first, render their own login screen when unauthenticated, and only jump to Org when the user clicks login:

```js
import { createMakeAppAuth } from '@qfei/make-app-auth';

const auth = createMakeAppAuth({ gatewayBaseUrl: '/api/make' });
const boot = await auth.init({ redirect: false });

if (boot.status === 'authenticated') {
  renderApp({ auth, context: boot.context });
} else if (boot.status === 'forbidden') {
  renderForbidden();
} else {
  renderLogin({ onLogin: () => auth.login({ redirect: true }) });
}
```

For unified login local debugging, Vite must listen on `0.0.0.0:5174`, proxy `/api/make` to make-gateway, and expose only port `5174` through ngrok. Use `MAKE_GATEWAY_PROXY_TARGET` for the proxy target and default to `https://dev-make.qtech.cn` when the project has no stricter Make gateway target.

Business requests should go through `auth.api` under `/api/make/**`. Do not generate raw `fetch('/api/make/...')` or `window.fetch('/api/make/...')` calls:

```js
await auth.api.post('/data/v1/record', {
  app: 'your_app_name',
  entity: 'your_entity_name',
  fields: [],
  pagination: { page: 1, size: 10 }
}, {
  headers: {
    'X-Make-Target': 'MakeService.ListResources'
  }
});
```

Only include `filter` when the App has actual filter conditions. Do not send `filter: []` for an unfiltered list request.

Do not:

- read or persist Org tokens, `zs_session`, or `make_app_session`
- bypass the SDK by hand-writing `Authorization`; token mode must use SDK token options
- expose Make tokens through browser `VITE_*` config; in gateway/unified-login Apps, also do not expose Service URLs
- build Org OAuth URLs inside the App
- handle `redirect_uri`, `state`, `code_challenge`, or token exchange inside the App
- use the App domain directly as the Org logout `redirect_uri`
- monkey patch `window.fetch` or make the SDK intercept third-party requests
- bypass `/api/make/**` to call meta/data services directly
- route Make runtime data through `apps/service` in a gateway/unified-login App unless the user explicitly requested a server-side orchestration contract

## Node runtime

Use Node.js `>=22.12.0` for Make App frontend projects.

- Recommend the current active LTS for new projects. At the time of this update, use Node.js 24 LTS by default.
- Do not choose Node.js 20 as the default for new projects.
- For new projects, add `package.json` `engines.node` as `>=22.12.0`.
- If the project uses a version manager, prefer a simple major-version file such as `.nvmrc` or `.node-version` with `24`.
- If an existing project already has a stricter Node requirement, keep the stricter project requirement.

## Service-based local dev baseline

For Service-based Make App projects, preserve the host project's existing dev port. If changing the UI dev port, update the whole local contract in the same change:

- UI Vite server config and any shared dev-server config helper
- Service CORS allowlist
- `.env.example` or local environment documentation
- `apps/docs/api.md` when the UI / Service contract mentions local origins
- focused tests for the UI port config and Service CORS behavior

Do not copy the gateway/unified-login `5174` port rule into a Service-based project unless that project explicitly uses the gateway flow.

## Pre-flight workflow

Before generating or editing UI:

1. Inspect the project for existing Node runtime requirements, frontend stack, component library, styling solution, routes, layout shell, and page patterns.
2. Use existing project conventions first.
3. Identify the host data flow: UI -> Service -> Make API, or auth-SDK gateway. Preserve existing project instructions and API contracts unless the user confirms a change.
4. If reorganizing into `apps/`, verify the workspace package baseline and plan any missing `package.json`, workspace, scripts, and Node engine changes before editing UI code.
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
13. For gateway/unified-login Make App frontend projects, especially any login module or runtime Make data access, read `references/auth-sdk-integration.md`, use `@qfei/make-app-auth` for authentication bootstrap, and use `/api/make/**` gateway requests through `auth.api`.
14. For any Make record table or list table, use `@qfei-design/canvas-table` through `canvas-table-integration`. This includes table display and cell editing. This skill only defines the surrounding layout and placement. Do not add pagination controls, page-size controls, page state, page query params, total-count handling, or paginated data-fetch logic unless the user explicitly asks for pagination.

## Required references

Read only the reference files needed for the request:

- General boundaries and defaults: `references/principles.md`
- App shell, side navigation, top header, and height chain: `references/app-shell-layout.md`
- List pages and toolbar button placement: `references/list-page-layout.md`
- Create/edit/detail Drawer layout: `references/drawer-layout.md`
- Route-based create/edit/detail pages: `references/page-route-layout.md`
- Make App auth SDK integration for gateway/unified-login projects: `references/auth-sdk-integration.md`
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
