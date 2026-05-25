# makeui principles

## Contents

- [Role](#role)
- [Hard boundaries](#hard-boundaries)
- [Default Make App pattern](#default-make-app-pattern)
- [Runtime schema and candidates](#runtime-schema-and-candidates)
- [Schema identity rules](#schema-identity-rules)
- [Project runtime baseline](#project-runtime-baseline)
- [Node runtime](#node-runtime)
- [Decision order](#decision-order)
- [Dynamic object routes](#dynamic-object-routes)
- [Do not create views by default](#do-not-create-views-by-default)

## Role

`makeui` guides UI generation for Make App pages created from natural language. It should make layout and interface decisions, not business decisions.

## Hard boundaries

- Do not invent business fields, field meanings, API shapes, permission rules, approval states, or persistence behavior.
- Do not generate UI or Service runtime code that reads local DSL files. `apps/dsl` is a source/modeling artifact, not a deployed runtime dependency.
- Do not generate Make object lists, Drawer forms/details, or route forms/details before identifying the runtime schema and candidate APIs. Prefer the host Service contract such as `/api/schema`, `/api/entities/:entityKey/fields`, `/api/users`, and `/api/departments`.
- Do not infer that a requested table needs pagination, cell editing, virtual loading, or custom renderers; table implementation belongs to `canvas-table-integration`.
- Make record tables and list tables must use `@qfei-design/canvas-table` through `canvas-table-integration`. If cell editing is needed, use `canvas-table-integration` for the editing design too.
- Do not add product capabilities that were not requested, especially pagination, views, advanced filters, grouping, sorting, column settings, import, or export.
- Do not force Ant Design or Less when the user or project already has another UI/styling system.
- Do not silently choose Ant Design, Arco Design, TDesign, or shadcn/ui for a new project. Component-library selection is blocking until the user chooses.
- Do not skip the Make App shell for generated object-list UI. Start from the shell unless the project already has one.
- Do not silently downgrade `Date`, `User`, `Department`, `Select`, `File`, or `Lookup` Make fields to plain text inputs. Explain any missing schema/API and use an explicit fallback.
- Do not use fake global users, departments, or select candidates in production code. Candidate data must come from schema/options or backend APIs.
- Do not show attachment upload fields in create flows when upload requires a saved record identity. New records do not have `recordID`; omit file fields until edit/detail after persistence.
- Do not treat an `apps/ui` or `apps/service` directory as complete unless its required workspace package manifest exists.

## Default Make App pattern

Use a focused object-management layout:

- global shell with top header and left navigation for generated Make App object-list UI
- list page as the main entry
- object navigation through dynamic React Router params
- create/edit/detail as right-side Drawer by default
- route pages only on explicit user request
- table area fills remaining content height

For generated object-list UI, the shell structure is:

1. left full-height sidebar for module/object navigation
2. right fixed header with selected object/module name on the left
3. current user/avatar and global actions on the header right
4. local list toolbar below the header
5. canvas-table region filling the remaining height

Do not add pagination to generated object-list UI unless the user explicitly asks for it.

Generated Make App projects should follow the makecli agent target structure:

- `apps/ui`
- `apps/service`
- `apps/dsl`
- `apps/docs`
- `apps/packages/ui`, `apps/packages/types`, and `apps/packages/config` when shared packages are useful

Preserve the host project's declared data flow. If project instructions, `apps/docs/api.md`, or existing code require `apps/ui -> apps/service -> Make Data API`, UI code must use the Service API contract and must not directly call Make APIs or hold Make credentials. If the user is generating a gateway/unified-login Make App, authentication and `/api/make/**` access must be handled through `@qfeius/make-app-auth` and the separate `make-app-auth` skill: generated UI calls `auth.api('/api/make/**')`, then reaches make-gateway and Make Platform. UI code must not hold Make credentials, bypass `auth.api`, directly call meta/data service domains, or silently replace a Service-based contract with the gateway/auth-SDK flow. `apps/service` remains part of the required project structure.

## Runtime schema and candidates

Runtime schema and candidate data must come from backend APIs, not local DSL files.

- The generated app must not use `fs.readFile`, static imports, `import.meta.glob`, YAML parsers, copied schema files, or path-based reads for `apps/dsl/**`, `/dsl/**`, or `*.yaml`.
- Table columns, form fields, field labels, editability, required state, select options, and lookup relation metadata should be read from the runtime schema contract.
- Prefer the host project's API docs and Service client. The default Make UI contract is `GET /api/schema` for app schema and `GET /api/entities/:entityKey/fields` for one object's fields.
- User and department selectors must query backend endpoints such as `GET /api/users` and `GET /api/departments`, or the host project's equivalent endpoints.
- Schema should be reloadable after model changes. Do not freeze dynamic object fields into generated constants when a schema API exists.
- If schema or candidate endpoints are missing, report the API contract gap and ask for confirmation before generating a degraded placeholder. Do not use local DSL as the fallback field source.

## Schema identity rules

- For Make v0.3.0 schemas, use `entity.key` as the route/API key and `entity.name` as display text. Do not route by Chinese object names.
- Use `field.key` for record data keys, canvas-table column keys, filters, sort fields, edit commits, and API payloads.
- Use `field.name` only for labels, column titles, detail display, and menu text.
- Lookup relation form logic reads `field.properties.relation` as relation key and `field.properties.targetFieldKey` as target field key.
- Relation writes use `qfei_relation: [{ entityKey, id }]`.

## Project runtime baseline

When reorganizing a project into `apps/`, directories alone are not enough. Required workspace files are:

- `apps/package.json`
- `apps/pnpm-workspace.yaml`
- `apps/ui/package.json`
- `apps/service/package.json`

`apps/pnpm-workspace.yaml` must include `ui`, `service`, and `packages/*`. `apps/package.json` scripts such as `app:ui`, `app:service`, and `dev` must use `pnpm --filter` targets that match the actual package names, including scoped names when used. Legacy refactors are incomplete until the required manifests and scripts for the chosen structure exist.

Frontend build output must be `apps/ui/dist`. Generated or updated Vite config should set `build.outDir: "dist"` and `build.emptyOutDir: true`; do not publish or point static asset discovery at a root `dist` or `apps/dist`.

Service projects must have one centralized runtime config entry. For new projects use `apps/service/src/config.ts`; for legacy projects, preserve an existing equivalent config entry if it already centralizes runtime config, otherwise add `apps/service/src/config.ts`.

Service HTTP port is fixed to `3000`. Generated or refactored `apps/service` code, config defaults, `.env.example`, docs, health checks, tests, and UI Service base URL examples must point to port `3000`. If a legacy project uses another Service port, migrate it to `3000` during the makeui refactor and update UI Service base URL, CORS, docs, and tests together. If local `3000` is occupied, report the conflict instead of silently choosing another port.

`makeui` does not decide which environment connects to which Make domain, gateway, or API host. Service config may read `MAKE_API_BASE_URL`, `MAKE_SERVER_URL`, or the host project's existing equivalent name, but domain mapping, gateway routing, and secret injection belong to backend, operations, Make tooling, or the deployed Service runtime. Env examples may expose blank config keys, but must not include real tokens or hard-code production, staging, or test Make API domains.

## Node runtime

Make App frontend projects use Vite, so Node runtime compatibility must be checked before scaffolding or changing frontend dependencies.

Default baseline:

- minimum Node.js: `>=22.12.0`
- recommended for new projects: current active LTS; at the time of this update, Node.js 24 LTS
- avoid Node.js 20 as the default for new projects

For new projects, add this to `package.json`:

```json
{
  "engines": {
    "node": ">=22.12.0"
  }
}
```

If the project uses `.nvmrc` or `.node-version`, prefer `24` unless the user or project requires another active LTS.

If an existing project already declares a stricter Node requirement, keep the stricter project requirement.

For Service-based local development, Service stays on port `3000`. Preserve the host UI port unless the user asks to change it. When the UI port changes, update Vite config, Service CORS, env examples or docs, API docs when they mention local origins, and tests together. Do not apply gateway/unified-login port defaults to a Service-based project unless the project explicitly uses that data flow.

## Decision order

1. User's explicit request.
2. Existing project stack and UI conventions.
3. Make defaults in this skill.

If a detail is not requested and not present in the project, choose the simplest useful UI.

For a new project with no established component library, ask the user to choose Ant Design, Arco Design, TDesign, or shadcn/ui. Recommend Ant Design, but do not choose it automatically. If the user has not chosen, pause component-library-specific implementation and only provide a neutral plan or ask the selection question. If the user chooses shadcn/ui, follow the official Vite installation path, configure Tailwind and aliases first, and add only the needed shadcn/ui components.

## Dynamic object routes

Make apps can be generated from different object definitions. Do not create one hard-coded route component per object when a dynamic route can represent the object.

Prefer a dynamic object route such as:

```text
/objects/:objectKey
```

If the host project already uses another dynamic convention, follow that convention.

## Do not create views by default

Make currently has no confirmed view capability. Do not create:

- view tabs
- view dropdowns
- saved views
- Kanban / split / chart view switchers
- "all records / my records" view concepts

Only add these when the user explicitly asks.
