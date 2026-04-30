---
name: canvas-table-integration
description: Use when the user wants to integrate `@qfei-design/canvas-table` / `@qfei/canvas-table` into an existing app or page. Focus on consumer-side integration of basic local tables, paginated virtual tables, common public props/methods/events, row selection, row drag, column drag, fixed columns, summary rows, empty states, and lightweight `render + TextShape + shape click` business interactions. Read the installed package AI docs first, choose the correct path, use only the documented public API, and verify the integration after editing. Do not use this skill to modify the table library itself. For grouped tables and cell-edit workflows, treat them as later-stage enhancements rather than the primary path for this skill.
---

# canvas-table-integration

Use this skill only for **consumer-side integration** of `@qfei-design/canvas-table` / `@qfei/canvas-table`.

Keep the first version of an integration simple: choose the correct path, get the table rendering correctly, then add the smallest useful interaction layer.

## Typical requests

- 在页面里接入 `canvas-table`
- 把现有列表替换成 canvas table
- 接一个本地数据表格
- 接后端分页 / 虚拟滚动表格
- 做行选择、汇总、空状态、固定列
- 把单元格渲染成可点击文本 / 链接
- 把 JSON meta 转成 `IColumn[]`

## Do not use this skill for

- publishing `@qfei-design/canvas-table`
- editing the table library itself
- maintaining `package.ai.json`, `recipes.json`, examples, or docs inside the table library repo
- configuring private npm registries
- designing the full grouped-table workflow as the primary solution
- designing the full cell-edit workflow as the primary solution

## First-version scope

This skill's primary path covers:

- `basic local table`
- `virtual remote table`
- common public `IColumn` / `TableCanvasProps` / instance-method usage
- stable event-bus wiring
- row selection
- row drag
- column drag
- fixed columns
- summary rows
- empty states
- lightweight `render + TextShape + shape click` business interaction

Do not turn a first-pass integration into a grouped-table or cell-edit project unless the user explicitly wants that deeper path.

## Pre-flight check

Before editing code:

1. Confirm `@qfei-design/canvas-table` or `@qfei/canvas-table` is installed in the current project.
2. If there is no `package.json`, stop and tell the user the current directory is not an npm package.
3. If the package is missing, detect the package manager from the lockfile and install it before continuing:
   - `pnpm-lock.yaml` -> `pnpm add @qfei-design/canvas-table` or `pnpm add @qfei/canvas-table`
   - `yarn.lock` -> `yarn add @qfei-design/canvas-table` or `yarn add @qfei/canvas-table`
   - `package-lock.json` -> `npm install @qfei-design/canvas-table` or `npm install @qfei/canvas-table`
4. If no lockfile exists, default to `npm install ...`.
5. If install fails, stop and report the command and error.

Prefer the package name already used by the project. Do not silently switch package names inside an existing codebase.

## Required read order

Prefer reading from the installed package:

1. `node_modules/<pkg>/package.ai.json`
2. `node_modules/<pkg>/docs/agent-usage.md`
3. `node_modules/<pkg>/recipes.json`
4. `node_modules/<pkg>/capabilities.json`
5. `node_modules/<pkg>/PUBLIC_API.md`

If the project is working directly inside the table monorepo, use the source paths instead:

1. `packages/table/package.ai.json`
2. `packages/table/docs/agent-usage.md`
3. `packages/table/recipes.json`
4. `packages/table/capabilities.json`
5. `packages/table/PUBLIC_API.md`

Then read the most relevant references from this skill:

- `references/core-props-methods-events.md`
- `references/virtual-table-patterns.md` when using paginated virtual loading
- `references/column-patterns.md` when shaping columns
- `references/shape-render-patterns.md` when adding custom clickable cell content
- `references/common-pitfalls.md` before finalizing changes

If any required package file is missing, stop and tell the user exactly which file is missing.

## Choose a primary path first

Choose one primary path before coding:

### `basic local table`

Use when the page already has all rows in client memory.

Start from:

- `recipes.json` -> `basic-local-table`
- `examples/react/basic-canvas-table.tsx`

### `virtual remote table`

Use when rows come from a paginated backend API or the dataset is too large to load at once.

Start from:

- `recipes.json` -> `virtual-remote-table`
- `examples/react/virtual-canvas-table.tsx`
- `references/virtual-table-patterns.md`

### `meta -> columns`

Use when column configuration comes from JSON/meta instead of handwritten `IColumn[]`.

Treat this as a supporting path, not the primary first-pass path, unless the page is clearly meta-driven.

If the page mixes patterns, pick the dominant path first, then add only the smallest extra behavior required by the page.

## Hard rules

Always follow these rules:

- browser / client-only; never instantiate during SSR
- use a real DOM container with explicit width and height
- use only documented public APIs
- never import from `src` or `dist`
- for normal tables, use `setData(rows)`
- when `virtualOptions.enabled === true`, listen to `data:load` and use `setData(rows, page)`
- keep the table page contract zero-based; if the backend is one-based, translate inside the loader callback
- use `table.tableId` as the namespace key for `globalEventBus.onWithNamespace(...)`
- destroy the table instance on unmount / cleanup
- never pass raw meta directly into the table runtime
- convert meta into `IColumn[]` before creating the table
- do not escalate the first integration into grouped tables or edit workflows unless explicitly needed

## First-version capability checklist

Use this skill to wire these common capabilities correctly:

- base columns: `key`, `title`, `width`, `align`, `headerAlign`, `fixed`, `showEllipsis`
- local data updates via `setData(rows)`
- virtual paged updates via `setData(rows, page)`
- `updateProps(...)` for column / size / config updates
- row selection via `selectable` + `selection:change`
- row drag via `rowSortable`
- column drag using the built-in header interaction
- summary rows via `showSummary`, `summaryData`, `summaryRenderer`
- empty states via `emptyStateOptions`
- custom cell rendering via `render`
- lightweight clickable shapes via `TextShape` and shape-level click behavior

Use references as needed:

- API surface: `references/core-props-methods-events.md`
- columns: `references/column-patterns.md`
- clickable cell content: `references/shape-render-patterns.md`
- virtual loading: `references/virtual-table-patterns.md`

## Implementation workflow

1. Check whether the package is installed.
2. If missing, install it with the lockfile-based package-manager rule above.
3. Read the package docs in the required order.
4. Choose the primary path.
5. Open the corresponding recipe and minimal example.
6. Adapt that example to the current project with the smallest reasonable diff.
7. Preserve the local framework and state-management patterns.
8. Add only the capabilities the page truly needs now.
9. Avoid unrelated refactors.
10. Run at least one concrete verification step if the environment allows it.

## What to avoid in first-pass integrations

Avoid these mistakes:

- building a grouped-table solution when a flat table is enough
- designing a full edit flow when the page only needs display + click actions
- overusing custom shapes when plain columns are sufficient
- relying on internal events or internal classes
- stuffing raw meta directly into runtime props
- skipping resize / cleanup handling

Before finishing, read `references/common-pitfalls.md`.

## Deferred topics

These topics exist in the package, but are not the primary focus of this skill version:

- grouped tables (`GroupTableComponent`, `group:load`, `group:expand`, grouped hydration)
- cell editing (`editType`, `customEdit`, `edit:end`, `paste`)
- advanced shape animation systems
- full event matrix beyond the common stable consumer path

If the user explicitly needs those, treat them as a later enhancement path and read the package feature docs directly.

## Required output

After finishing, report:

- which primary path was selected
- which recipe and example were used
- which files were changed
- which core capabilities were added (selection / drag / summary / empty / shape render / etc.)
- any important paging or meta-conversion constraints
- what was verified
- whether anything is still blocked by missing data or APIs
