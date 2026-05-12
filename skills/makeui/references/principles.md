# makeui principles

## Role

`makeui` guides UI generation for Make App pages created from natural language. It should make layout and interface decisions, not business decisions.

## Hard boundaries

- Do not invent business fields, field meanings, API shapes, permission rules, approval states, or persistence behavior.
- Do not infer that a requested table needs cell editing, virtual loading, or custom renderers; table implementation belongs to `canvas-table-integration`.
- Make record tables and list tables must use `@qfei-design/canvas-table` through `canvas-table-integration`. If cell editing is needed, use `canvas-table-integration` for the editing design too.
- Do not add product capabilities that were not requested, especially views, advanced filters, grouping, sorting, column settings, import, or export.
- Do not force Ant Design or Less when the user or project already has another UI/styling system.

## Default Make App pattern

Use a focused object-management layout:

- global shell with top header and optional left navigation
- list page as the main entry
- object navigation through dynamic React Router params
- create/edit/detail as right-side Drawer by default
- route pages only on explicit user request
- table area fills remaining content height

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

## Decision order

1. User's explicit request.
2. Existing project stack and UI conventions.
3. Make defaults in this skill.

If a detail is not requested and not present in the project, choose the simplest useful UI.

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
