# makeui principles

## Role

`makeui` guides UI generation for Make App pages created from natural language. It should make layout and interface decisions, not business decisions.

## Hard boundaries

- Do not invent business fields, field meanings, API shapes, permission rules, approval states, or persistence behavior.
- Do not generate Make object lists, Drawer forms/details, or route forms/details before checking the available DSL/schema source. Prefer `apps/dsl`, then Service `/api/schema`, then project-local schema/meta types or fixtures.
- Do not infer that a requested table needs pagination, cell editing, virtual loading, or custom renderers; table implementation belongs to `canvas-table-integration`.
- Make record tables and list tables must use `@qfei-design/canvas-table` through `canvas-table-integration`. If cell editing is needed, use `canvas-table-integration` for the editing design too.
- Do not add product capabilities that were not requested, especially pagination, views, advanced filters, grouping, sorting, column settings, import, or export.
- Do not force Ant Design or Less when the user or project already has another UI/styling system.
- Do not silently choose Ant Design, Arco Design, or TDesign for a new project. Component-library selection is blocking until the user chooses.
- Do not skip the Make App shell for generated object-list UI. Start from the shell unless the project already has one.
- Do not silently downgrade `Date`, `User`, `Department`, `Select`, `File`, or `Lookup` Make fields to plain text inputs. Explain any missing schema/API and use an explicit fallback.
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

When reorganizing a project into `apps/`, directories alone are not enough. Required workspace files are:

- `apps/package.json`
- `apps/pnpm-workspace.yaml`
- `apps/ui/package.json`
- `apps/service/package.json`

`apps/pnpm-workspace.yaml` must include `ui`, `service`, and `packages/*`. `apps/package.json` scripts such as `app:ui`, `app:service`, and `dev` must use `pnpm --filter` targets that match the actual package names, including scoped names when used. Legacy refactors are incomplete until the required manifests and scripts for the chosen structure exist.

## Runtime baseline

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

For Service-based local development, preserve the host UI port. When the UI port changes, update Vite config, Service CORS, env examples or docs, API docs when they mention local origins, and tests together. Do not apply gateway/unified-login port defaults to a Service-based project unless the project explicitly uses that data flow.

## Decision order

1. User's explicit request.
2. Existing project stack and UI conventions.
3. Make defaults in this skill.

If a detail is not requested and not present in the project, choose the simplest useful UI.

For a new project with no established component library, ask the user to choose Ant Design, Arco Design, or TDesign. Recommend Ant Design, but do not choose it automatically. If the user has not chosen, pause component-library-specific implementation and only provide a neutral plan or ask the selection question.

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
