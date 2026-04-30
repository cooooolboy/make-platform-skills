# validated usage notes

This file is for maintainers of the skill, not for the primary end-user path.

Use it to track which capabilities have been validated in real consumer projects, and which capabilities are still mainly documented but not yet strongly validated by downstream integration work.

Current validation sample:

- `/Users/caojianbo/ZSQF/make-group/expensePoc/frontend`

## 1. Validated by real project usage

The following first-version capabilities are already validated by `expensePoc/frontend`.

### Basic local table integration

Validated in:

- `src/components/claim-table/index.tsx`
- `src/components/item-table/index.tsx`

Observed patterns:

- `CanvasTableComponent` is instantiated in a React `useEffect`
- the table is bound to a real DOM container
- local rows are injected with `setData(rows)`
- the instance is destroyed in cleanup

### Common column configuration

Validated fields include:

- `key`
- `title`
- `width`
- `align`
- `showEllipsis`

This supports the first-version guidance that these are the most common consumer-facing column fields.

### Formatting outside the table core

Validated pattern:

- business formatting happens before `setData(...)`
- examples include currency, time, and status formatting

This supports the guidance that display formatting should usually stay in the host data layer.

### Row selection

Validated in `claim-table`:

- `selectable.enabled = true`
- `selectable.type = 'multiple'`
- `selection:change`
- namespaced event subscription via `table.tableId`

### `render + TextShape` clickable business anchor

Validated in `claim-table`:

- the `claimNo` field is rendered through `render`
- a `TextShape` is used as a clickable business anchor
- shape events stop propagation before triggering the business jump

This strongly validates the first-version emphasis on lightweight clickable shape patterns.

### Responsive width synchronization

Validated in both table components:

- host components use `ResizeObserver`
- host width is synchronized before / during table use

This supports the hard-rule guidance about real container sizing.

### `showSN`

Validated in `claim-table`:

- `showSN.enabled = true`
- custom formatter usage is present

### Business-field `rowKey`

Validated examples:

- `rowKey: 'claimNo'`
- `rowKey: 'itemName'`

This supports the guidance that host code should prefer a stable business identifier and not assume `id` is always available.

### Detail-page subtable usage

Validated in:

- `claim-detail` -> `ItemTable`

This confirms that canvas-table is not only for main list pages, but also works well for embedded display-oriented subtables.

## 2. Not yet strongly validated by this sample project

The following capabilities still exist in package docs, but are not yet strongly validated by `expensePoc/frontend`.

### Virtual remote table

Not yet validated here.

Implication:

- keep the path in the skill
- do not overstate it as project-validated by `expensePoc/frontend`

### Group table

Not yet validated here.

Implication:

- deferring it from the first-version primary path remains correct

### Cell-edit workflow

Not yet included in this validation pass.

Implication:

- do not move edit workflows into the first-version primary path
- wait for real project editing samples before writing the next enhancement pass

### Built-in summary row

The project has summary information in page UI, but not yet as a validated built-in canvas-table summary integration.

### Built-in empty state

Not yet directly validated in this sample project.

## 3. Known observation points

### `mainField`

`claim-table` currently uses a `mainField: true` field on a column.

This field is not currently part of the first-version public emphasis in the skill.

Implication:

- do not promote it into the main skill path yet
- revisit later if multiple real projects rely on it

## 4. Maintenance guidance

Use this file when deciding whether to:

- move a documented capability into the first-version primary path
- keep a capability in references only
- postpone a capability to a later enhancement phase

Prefer real consumer-project validation over purely source-level discovery when deciding what to emphasize in the skill.
