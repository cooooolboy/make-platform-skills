# Component usage

## Contents

- [Selection strategy](#selection-strategy)
- [Default candidate mapping](#default-candidate-mapping)
- [Make schema-driven field components](#make-schema-driven-field-components)
- [Table component rule](#table-component-rule)
- [Action hierarchy](#action-hierarchy)
- [Optional action policy](#optional-action-policy)

## Selection strategy

Use this priority:

1. User-specified component library.
2. Existing project component library.
3. New-project selection among Ant Design, Arco Design, TDesign, and shadcn/ui when no library exists.

Do not add a new component library to an existing project unless the user asks.

Use this same rule for icons and styling tools.

For new projects, component-library selection is a blocking decision. Actively ask the user to choose one of:

- Ant Design
- Arco Design
- TDesign
- shadcn/ui

Recommend Ant Design, but do not select it automatically. Until the user chooses, do not scaffold or edit component-library-specific UI code, imports, theme setup, icons, or package dependencies. If progress is still useful before the answer, produce only a component-library-neutral plan, file map, or pseudocode.

Do not mix Ant Design, Arco Design, TDesign, and shadcn/ui in the same app unless the existing project already does so and the user asks to keep it.

When shadcn/ui is selected, treat it as a source-code component system, not a traditional prebuilt UI package. Follow the official Vite path for new or existing Vite projects:

- ensure Tailwind CSS is configured before generating shadcn/ui components
- ensure the `@/*` alias is configured in TypeScript and Vite
- run the shadcn CLI from `apps/ui` or pass the correct config path for the workspace
- add only the components actually needed by the generated UI
- keep generated shadcn/ui components under the host project's established component path, usually `src/components/ui`
- use `lucide-react` icons unless the project has another established icon system

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

When shadcn/ui is the selected component system:

- shell: CSS/Tailwind layout with project-local shell components
- sidebar navigation: project-local sidebar/menu components, or shadcn/ui navigation primitives when already added
- global and page actions: `Button`
- search: `Input` with a lucide search icon
- optional filters: `Popover`, `Sheet`, or compact form controls
- create/edit/detail: right-side `Sheet` by default
- route forms: `Form` with type-appropriate field controls
- read-only details: simple grids or project-local panels; avoid inventing nested card layouts
- feedback: `Alert`, `Skeleton`, toast/sonner, and explicit empty states when those components are installed
- avatar and user menu: `Avatar` and `DropdownMenu`

## Make schema-driven field components

Before generating Make forms or field editors, identify the runtime schema API and candidate APIs. Use Service `/api/schema`, `/api/entities/:entityKey/fields`, or the host project's equivalent schema endpoints. Do not hand-write static form controls when the schema API is available, and do not generate UI or Service runtime code that reads `apps/dsl`, `/dsl`, or YAML schema files.

If no schema API or response sample exists, stop and call out the missing contract instead of falling back to local DSL reads or generated constants.

Use type-appropriate controls:

| Make field group | Default control |
| --- | --- |
| `ID`, generated fields | read-only text |
| `Text`, `TextArea`, `URL` | text, textarea, or URL input |
| `Number`, `Currency`, `Percent` | numeric input with display formatting kept out of submit values |
| `Date`, `DateTime`, `DateRange` | date, date-time, or range picker |
| `SingleSelect`, `MultiSelect` | single or multiple select from schema options |
| `SingleUser`, `MultiUser` | searchable user selector backed by `/api/users` or host equivalent |
| `SingleDepartment`, `MultiDepartment` | searchable department selector backed by `/api/departments` or host equivalent |
| `File` | create: omit when upload requires `recordID`; edit: attachment component only with saved record id; detail: attachment display |
| `Lookup` | read-only lookup display by default; association selector only when schema/API explicitly supports editing |

Do not silently degrade date, user, department, select, file, or lookup fields to a bare `Input`.

If a field type is unknown, prefer a read-only display or an explicit unsupported-field fallback. Do not pretend it is a plain text field unless the user confirms that downgrade.

File fields are mode-sensitive. If the backend upload API requires a persisted `recordID`, create forms must omit `Make.Field.File` controls and create payload values. Render attachment upload/edit only after a record exists and the stable id is available. Detail views may display existing attachments.

User and department candidate APIs are required for production selectors. When the real APIs are missing and the user confirms a placeholder, use a searchable selector shell that:

- displays the current value from the record
- leaves a clear integration point for the real candidate API
- avoids fake global demo candidates in production code
- shows loading, empty, error, and retry states

For Ant Design, the default form-control mapping is:

- text: `Input`, long text: `Input.TextArea`
- number/currency/percent: `InputNumber`
- date/date-time/date-range: `DatePicker` / `DatePicker.RangePicker`
- select/user/department/lookup candidates: `Select` with `showSearch`, backend search for user/department, and `mode="multiple"` for multi-value fields
- file: no create upload when `recordID` is required; edit/detail attachment UI after persistence

## Table component rule

For Make record lists and related-data tables, do not use the table component from the selected UI library.

Always use:

- package: `@qfei-design/canvas-table`
- skill: `canvas-table-integration`

This applies to:

- table display
- row sequence numbers and row-head detail entry by default for every table unless the user explicitly opts out
- pagination or virtual loading layout around the table, only when explicitly requested
- row selection, only when requested
- cell editing, when requested

The selected UI library can still provide surrounding controls such as buttons, inputs, drawers, popovers, forms, and feedback components.

Do not add pagination controls, page-size selectors, page state, page query params, total-count handling, or paginated data-fetch logic unless the user explicitly asks for pagination.

## Action hierarchy

- Primary action: create/new, save, submit, or the user's stated main action.
- Secondary actions: refresh, export, import, settings, cancel.
- Destructive actions: visually separated from primary actions.

Do not make every toolbar button primary.

## Optional action policy

Optional controls only appear when requested:

- pagination
- filter
- group
- sort
- column settings
- import
- export

If requested, place them according to `list-page-layout.md`.
