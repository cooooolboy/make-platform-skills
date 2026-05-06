---
name: canvas-table-integration
description: Use when the user wants to integrate `@qfei-design/canvas-table` / `@qfei/canvas-table` into an existing app or page. This skill covers two major tracks: (1) base consumer integration of local or virtual tables, public props/methods/events, selection, drag, fixed columns, summary rows, empty states, and lightweight `render + TextShape + shape click` interactions; (2) host-side cell-edit architecture, including `customEdit`, `commit/cancel`, object `autoClose`, `relatedElements`, `overlayOptions`, `destroy`, `editApplyMode: controlled`, editor-container patterns, draft-vs-immediate save layers, popup editors, and attachment editor integration using the host project's existing component system. Read the installed package AI docs first, choose the correct track, use only documented public APIs, and verify the integration after editing. Do not use this skill to modify the table library itself.
---

# canvas-table-integration

Use this skill only for **consumer-side integration** of `@qfei-design/canvas-table` / `@qfei/canvas-table`.

This skill has two tracks:

- **Track A: first-version base integration**
  - basic local table
  - virtual remote table
  - common public props / methods / events
  - row selection / drag / summary / empty state
  - lightweight `render + TextShape + shape click`
- **Track B: second-version cell-edit enhancement**
  - `editType` / `customEdit`
  - `commit` / `cancel`
  - object `autoClose`
  - `relatedElements` / `overlayOptions` / `destroy`
  - `editApplyMode: "controlled"`
  - host-side edit controller architecture
  - editor-container patterns
  - field-editor mappings
  - draft save layer vs immediate save layer
  - positioning / scroll / popup close handling
  - attachment editor integration

Choose the track first. Do not mix a basic table integration request with a full cell-edit architecture refactor unless the user clearly wants the editing workflow.

## Typical requests

### Track A: base integration

- 在页面里接入 `canvas-table`
- 把现有列表替换成 canvas table
- 接一个本地数据表格
- 接后端分页 / 虚拟滚动表格
- 做行选择、汇总、空状态、固定列
- 把单元格渲染成可点击文本 / 链接
- 把 JSON meta 转成 `IColumn[]`

### Track B: cell-edit enhancement

- 给 canvas table 增加单元格编辑
- 设计或接入 `customEdit`
- 复用项目已有输入框 / 下拉 / 日期 / 人员 / 部门 / 附件组件
- 处理编辑器定位、滚动、关闭、保存、回填、回滚
- 增加文本 / 数字 / 日期 / 选项 / 人员 / 部门 / 附件字段编辑
- 把现有项目字段编辑器接进 canvas table

## Do not use this skill for

- publishing `@qfei-design/canvas-table`
- editing the table library itself
- maintaining `package.ai.json`, `recipes.json`, examples, or docs inside the table library repo
- configuring private npm registries
- treating grouped-table architecture as the default answer
- forcing a new UI component library into a project that already has an editor/component system

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

Then choose the track-specific references.

### For Track A: base integration

Read as needed:

- `references/core-props-methods-events.md`
- `references/virtual-table-patterns.md` when using paginated virtual loading
- `references/column-patterns.md` when shaping columns
- `references/shape-render-patterns.md` when adding custom clickable cell content
- `references/common-pitfalls.md` before finalizing changes

### For Track B: cell-edit enhancement

Read in this order:

1. package-level cell-edit docs and source entry points
2. `references/edit-contract.md`
3. `references/edit-host-architecture.md`
4. `references/edit-interaction-lifecycle.md`
5. `references/field-editor-patterns.md`
6. `references/editor-component-selection.md`
7. `references/attachment-editor-patterns.md` when attachment fields are in scope
8. `references/edit-common-pitfalls.md` before finalizing changes

If any required package file is missing, stop and tell the user exactly which file is missing.

## Track A: first-version base integration scope

Use Track A for:

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

## Track B: second-version cell-edit enhancement scope

Use Track B when the user explicitly needs editable cells or a host-side field-editor system.

This track covers:

- `editType`
- `customEdit`
- host-side edit controller design
- editor-container design
- `focus()` / `updateVal()` style editor interfaces
- submit-style vs realtime-style field editors
- click-outside save/close patterns through `autoClose` and `relatedElements`
- positioning and scroll-follow behavior for editor overlays
- value validation, commit, rollback, and cell backfill
- attachment-field editor integration

This track does **not** require a fixed UI library. Prefer the current project's existing editor components and component library.

### Track B / Phase 1 validated architecture notes

The following points are already validated in a real host integration and should be treated as the current default guidance for first-pass editable-list work:

1. **`editType: "custom"` is the required entry point**
   - If a target column is expected to enter the host-side custom editor flow, declare `editType: "custom"` on that column explicitly.
   - Do not assume `customEdit` alone is enough.

2. **`customEdit` is viable in a React host app**
   - For first-pass text-field editing, a simple host-created DOM input is a valid starting point.
   - Do not over-engineer the editor container before at least one real editable field flow is working end to end.

3. **Prefer page-level draft state over table-internal edit state**
   - Treat the page/container as the source of truth for:
     - draft values
     - dirty row keys
     - save / discard actions
     - unsaved-change guards
   - Treat the table as a controlled consumer that receives:
     - merged rows
     - dirty row keys
     - `onCellCommit(...)`

4. **Use `edit:end` as the stable post-commit boundary**
   - The host page should consume committed values from `edit:end` (or an equivalent lifted callback path), then update page-level draft state.
   - Do not hide all data mutation inside the table wrapper.

5. **Dirty-row visualization should use canvas-table native row coloring**
   - Prefer `setRowColors(rowKeys, color)` for dirty-row highlighting.
   - Do not build a parallel DOM-layer highlight system when the table already provides row background APIs.

6. **Unsaved-change protection is part of the editable-list architecture**
   - For editable list pages, define a clear rule for context-changing actions such as:
     - tab switch
     - query/reset
     - open detail
     - create new
   - A practical Phase 1 default is: confirm first, then discard draft and continue.

7. **Validated editable-list scope covers text, select, date, and attachment metadata**
   - A real React host has validated text fields, status select, submit-date picker, and attachment metadata editing.
   - Attachment real upload remains a data-source / adapter scope and should still follow the dedicated attachment reference.

8. **Use `editApplyMode: "controlled"` when a business save or draft layer owns writes**
   - In controlled mode, canvas-table emits edit events but does not mutate row data.
   - After the draft or immediate save layer accepts the commit, call `setCellData(...)` or `setRowData(...)` to backfill canvas data.
   - Keep a clear fallback for immediate-save mode when no immediate handler exists.

9. **Popup editors should use table-provided close coordination**
   - Return `relatedElements()` for dropdown/date/attachment popup roots.
   - Return `overlayOptions: { overflow: "visible" }` when the popup must overflow the cell editor box.
   - Prefer object `autoClose`, for example `escape: "cancel"`, `enter: "ignore"`, `tab: "commitAndMove"`.
   - Avoid host-owned global outside-click listeners unless the package contract is insufficient.

10. **Keep table initialization stable during draft updates**
   - Do not recreate the canvas table just because merged rows or parent callbacks changed.
   - In React, keep latest rows/callbacks in refs where needed and update data with `setData(...)`.
   - If the table is recreated due to resize or prop changes, reapply dirty row colors after `setData(...)`.

11. **Restore focus to the current canvas after controlled commits**
   - Immediate-save mode often refreshes host rows and may recreate or update the table instance.
   - After accepted commit or rollback, focus `tableRef.current?.canvas` rather than only the canvas captured by the old edit handler.
   - Use immediate, next-frame, and short-delay focus attempts when the host framework may commit DOM updates after the save promise resolves.

12. **Guarantee a usable canvas height before initializing the table**
   - Do not rely on a padding-only container height.
   - Prefer explicit height, then measured container height, then a conservative default height.
   - Too-small canvas height causes unreliable hit testing, popup positioning, and empty-state behavior.

13. **Date editors must resolve typed input before OK commits**
   - If the date component supports direct text entry, read or resolve the typed input before calling `commit(...)`.
   - Do not assume the component has already emitted `onChange` when the user types a full date-time and clicks OK.

14. **Use backend system identity for persisted editable rows**
   - For persisted records, prefer `rowKey: "recordID"` or the host backend's equivalent system id.
   - Keep business codes such as `claimNo` as display/search fields, not as technical row keys, dirty keys, detail route keys, or attachment upload identifiers.

15. **Attachment editors are host popups with data-source upload boundaries**
   - Render attachment previews in canvas-table, but keep file selection and upload handling in host DOM/editor space.
   - Use drag/drop and click-to-upload patterns when the host has no stronger upload component.
   - If real upload needs a saved record id, disable or omit attachment editing during create and enable it only after `recordID` exists.
   - Real upload belongs in the host data-source / adapter layer, not in canvas-table or a generic table wrapper.

## Choose a primary path first

Choose one primary path before coding.

### Track A / `basic local table`

Use when the page already has all rows in client memory.

Start from:

- `recipes.json` -> `basic-local-table`
- `examples/react/basic-canvas-table.tsx`

### Track A / `virtual remote table`

Use when rows come from a paginated backend API or the dataset is too large to load at once.

Start from:

- `recipes.json` -> `virtual-remote-table`
- `examples/react/virtual-canvas-table.tsx`
- `references/virtual-table-patterns.md`

### Track A / `meta -> columns`

Use when column configuration comes from JSON/meta instead of handwritten `IColumn[]`.

Treat this as a supporting path, not the primary first-pass path, unless the page is clearly meta-driven.

### Track B / `host cell-edit architecture`

Use when the page must edit business fields in-place or through editor overlays.

Prefer to anchor this track in a real project implementation before abstracting. Reuse existing host-side edit flows when they already exist.

Before changing code, identify:

- framework: React or Vue
- existing component library
- existing business field editors
- existing upload / date / select / people / department widgets
- field metadata shape: editability, required, field type, precision, format, multi/single mode, attachment value structure
- stable backend identity: `recordID` or equivalent row key for persisted rows and attachment upload

Do not invent a new editor system if the project already has one.

## Hard rules

Always follow these rules:

- browser / client-only; never instantiate during SSR
- use a real DOM container with explicit width and height
- use only documented public APIs
- never import from `src` or `dist`
- use `table.tableId` as the namespace key for `globalEventBus.onWithNamespace(...)`
- destroy the table instance on unmount / cleanup
- never pass raw meta directly into the table runtime
- convert meta into `IColumn[]` before creating the table

### Additional Track A rules

- for normal tables, use `setData(rows)`
- when `virtualOptions.enabled === true`, listen to `data:load` and use `setData(rows, page)`
- keep the table page contract zero-based; if the backend is one-based, translate inside the loader callback

### Additional Track B rules

- do not force a fixed component library
- prefer the host project's existing editor and field components
- do not put the whole edit workflow directly inside one `customEdit` callback
- separate column config, edit control, editor container, and field-editor implementations
- for complex field editors, prefer object `autoClose`; use `autoClose: false` only when the host must fully own close behavior and the package coordination options are insufficient
- treat the editor as a DOM overlay, not a canvas-drawn widget
- make the editor follow scroll / fixed-column positioning rules
- do not mix display values and submit values for complex fields
- attachment editing must be host-driven even if attachment rendering uses `ImgShape`
- do not expose attachment upload for unsaved rows when the backend requires a record id
- do not use business-only display fields as technical row keys for persisted editable rows

## Track A capability checklist

Use Track A to wire these common capabilities correctly:

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

## Track B capability checklist

Use Track B to design and wire these capabilities correctly:

- editable column declaration via `editType`
- `customEdit` contract handling
- editor-container pattern with a stable editor interface
- edit controller for old/new value, save, reset, rollback, and outside-click handling
- submit-style field editors
- realtime-style field editors
- field-editor mapping by business field type
- editor overlay positioning and scroll-follow behavior
- `commit(...)` / `cancel(...)` / `updateValue(...)` usage, with `close(commit)` and `changeValue(...)` treated as legacy compatibility only
- `edit:end` as the post-commit event surface
- attachment field integration using host upload/file components or drag/drop DOM editors plus canvas-table render support
- backend system identity handling for row keys, dirty keys, detail routes, and attachment preconditions

Use references as needed:

- edit contract: `references/edit-contract.md`
- host architecture: `references/edit-host-architecture.md`
- interaction lifecycle: `references/edit-interaction-lifecycle.md`
- field types: `references/field-editor-patterns.md`
- component choice: `references/editor-component-selection.md`
- attachments: `references/attachment-editor-patterns.md`

## Implementation workflow

### Track A workflow

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

### Track B workflow

1. Check whether the package is installed.
2. Read package editing docs and the edit-related source entry points.
3. Identify the host framework, component library, and existing field-editor components.
4. Identify the field metadata that drives editability and field type.
5. Identify the stable row identity used by backend reads, saves, dirty state, and detail routes.
6. Design or reuse a host edit controller layer before writing field-specific code.
7. Design or reuse a single editor-container abstraction before writing individual field editors.
8. Implement or reuse field editors through a common editor interface.
9. Distinguish submit-style editors from realtime-style editors.
10. For attachment fields, identify whether upload requires a saved record id and where the data-source / adapter upload boundary lives.
11. Validate positioning, scroll behavior, click-outside close, and rollback behavior.
12. Verify at least one real editable field flow in the target project.

## What to avoid

### Avoid these mistakes in Track A

- building a grouped-table solution when a flat table is enough
- designing a full edit flow when the page only needs display + click actions
- overusing custom shapes when plain columns are sufficient
- relying on internal events or internal classes
- stuffing raw meta directly into runtime props
- skipping resize / cleanup handling

Before finishing, read `references/common-pitfalls.md`.

### Avoid these mistakes in Track B

- forcing a brand-new component library into the project
- putting all editor logic directly into `customEdit`
- failing to separate display value and submit value
- treating all field types as the same commit model
- not updating editor position during scroll
- closing complex editors without save / rollback logic
- writing attachment support as render-only without an editor contract
- putting real attachment upload calls into canvas-table or a generic table wrapper
- using a business display code as the row key when persisted edits need a backend system id
- copying a Vue pattern into React without converting it into hook/ref-based host patterns

Before finishing, read `references/edit-common-pitfalls.md`.

## Deferred topics

These topics exist in the package or adjacent project patterns, but are not the primary focus of this skill version:

- grouped tables (`GroupTableComponent`, `group:load`, `group:expand`, grouped hydration)
- grouped-table editing workflows
- rich text / relation / advanced composite field editors
- advanced shape animation systems
- full event matrix beyond the stable consumer path
- deep upload-service protocol design for attachments

If the user explicitly needs those, treat them as a later enhancement path and read the package feature docs plus the host project's real implementation first.

## Required output

### For Track A

After finishing, report:

- which primary path was selected
- which recipe and example were used
- which files were changed
- which core capabilities were added (selection / drag / summary / empty / shape render / etc.)
- any important paging or meta-conversion constraints
- what was verified
- whether anything is still blocked by missing data or APIs

### For Track B

After finishing, report:

- which editable field path was selected
- which project component library and business editor components were reused
- where the edit controller logic lives
- whether a shared editor-container abstraction was used
- which field types were implemented or documented
- which fields use submit-style updates vs realtime-style updates
- how click-outside close is handled
- how overlay positioning and scroll-follow behavior are handled
- which stable row identity is used for persisted edits, dirty rows, detail routes, and attachment preconditions
- how attachment fields are represented and edited
- what was verified in the target project
- whether anything is still blocked by missing field metadata, APIs, or host components
