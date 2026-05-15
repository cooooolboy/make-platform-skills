# Component usage

## Selection strategy

Use this priority:

1. User-specified component library.
2. Existing project component library.
3. New-project selection among Ant Design, Arco Design, and TDesign when no library exists.

Do not add a new component library to an existing project unless the user asks.

Use this same rule for icons and styling tools.

For new projects, component-library selection is a blocking decision. Actively ask the user to choose one of:

- Ant Design
- Arco Design
- TDesign

Recommend Ant Design, but do not select it automatically. Until the user chooses, do not scaffold or edit component-library-specific UI code, imports, theme setup, icons, or package dependencies. If progress is still useful before the answer, produce only a component-library-neutral plan, file map, or pseudocode.

Do not mix Ant Design, Arco Design, and TDesign in the same app unless the existing project already does so and the user asks to keep it.

## Default candidate mapping

When Ant Design is the selected component library:

- shell: `Layout`
- sidebar navigation: `Menu`
- global and page actions: `Button`
- search: `Input` with a search icon or search affordance
- optional filters: `Drawer`, `Popover`, or compact form controls
- create/edit/detail: `Drawer`
- route forms: `Form`
- read-only details: `Descriptions`, simple grids, or cards/panels
- feedback: `message`, `Alert`, `Result`, `Spin`, `Empty`
- avatar and user menu: `Avatar`, `Dropdown`

Use project-standard icons first. If using Ant Design, prefer `@ant-design/icons`.

## Make schema-driven field components

Before generating Make forms or field editors, read the available DSL/schema source. Use existing `apps/dsl`, Service `/api/schema`, or project-local schema/meta types. Do not hand-write static form controls when the schema is available.

Use type-appropriate controls:

| Make field group | Default control |
| --- | --- |
| `ID`, generated fields | read-only text |
| `Text`, `TextArea`, `URL` | text, textarea, or URL input |
| `Number`, `Currency`, `Percent` | numeric input with display formatting kept out of submit values |
| `Date`, `DateTime`, `DateRange` | date, date-time, or range picker |
| `SingleSelect`, `MultiSelect` | single or multiple select from schema options |
| `SingleUser`, `MultiUser` | searchable user selector |
| `SingleDepartment`, `MultiDepartment` | searchable department selector |
| `File` | create: omit when upload requires `recordID`; edit: attachment component only with saved record id; detail: attachment display |
| `Lookup` | read-only lookup display by default; association selector only when schema/API explicitly supports editing |

Do not silently degrade date, user, department, select, file, or lookup fields to a bare `Input`.

File fields are mode-sensitive. If the backend upload API requires a persisted `recordID`, create forms must omit `Make.Field.File` controls and create payload values. Render attachment upload/edit only after a record exists and the stable id is available. Detail views may display existing attachments.

When real user or department candidate APIs are missing, use a searchable selector shell that:

- displays the current value from the record
- allows an explicit manual-input fallback only when the product needs it
- leaves a clear integration point for the real candidate API
- avoids fake global demo candidates in production code

## Table component rule

For Make record lists and related-data tables, do not use the table component from the selected UI library.

Always use:

- package: `@qfei-design/canvas-table`
- skill: `canvas-table-integration`

This applies to:

- table display
- row sequence numbers and row-head detail entry
- pagination or virtual loading layout around the table
- row selection, only when requested
- cell editing, when requested

The selected UI library can still provide surrounding controls such as buttons, inputs, drawers, popovers, forms, and feedback components.

## Action hierarchy

- Primary action: create/new, save, submit, or the user's stated main action.
- Secondary actions: refresh, export, import, settings, cancel.
- Destructive actions: visually separated from primary actions.

Do not make every toolbar button primary.

## Optional action policy

Optional controls only appear when requested:

- filter
- group
- sort
- column settings
- import
- export

If requested, place them according to `list-page-layout.md`.
