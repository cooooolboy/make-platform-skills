# Component usage

## Selection strategy

Use this priority:

1. User-specified component library.
2. Existing project component library.
3. Ant Design as the recommended default when no library exists.

Do not add a new component library to an existing project unless the user asks.

Use this same rule for icons and styling tools.

For new projects, the recommended component library is Ant Design. If the user wants alternatives, Arco Design and TDesign are acceptable choices because both support React.

Do not mix Ant Design, Arco Design, and TDesign in the same app unless the existing project already does so and the user asks to keep it.

## Default candidate mapping

When Ant Design is the selected or default component library:

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

## Table component rule

For Make record lists and related-data tables, do not use the table component from the selected UI library.

Always use:

- package: `@qfei-design/canvas-table`
- skill: `canvas-table-integration`

This applies to:

- table display
- row selection
- pagination or virtual loading layout around the table
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
