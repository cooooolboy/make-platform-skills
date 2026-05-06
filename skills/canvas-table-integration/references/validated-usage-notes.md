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
- the visible business number remains `claimNo`, while the detail route uses the backend system `recordID`

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

### Stable backend `rowKey`

Validated examples:

- `rowKey: 'recordID'` for persisted claim rows
- `rowKey: 'recordID'` for persisted item rows

This updates the row identity guidance: host code should prefer a stable backend/system identifier for persisted rows. Business fields such as `claimNo` should remain display/search fields, not technical row keys.

### Detail-page subtable usage

Validated in:

- `claim-detail` -> `ItemTable`

This confirms that canvas-table is not only for main list pages, but also works well for embedded display-oriented subtables.

### Cell-edit workflow

Validated in:

- `src/components/claim-table/index.tsx`
- `src/components/claim-table/editors/*`
- `src/components/claim-table/editing/*`
- `src/components/claim-table/hooks/use-claim-table-drafts.ts`

Validated field scope:

- text fields: `title`, `department`, `applicantName`
- select field: `status`
- date-time field: `submitDate`
- attachment field: `attachments`

Observed patterns:

- editable columns declare `editType: 'custom'`
- React host editors mount into DOM elements returned by `customEdit`
- editor components expose `focus()` and `updateVal()` through refs
- popup editors declare popup roots through `relatedElements()`
- popup editors use `overlayOptions: { overflow: 'visible' }`
- close behavior uses object `autoClose`
- business write ownership uses `editApplyMode: 'controlled'`
- accepted commits backfill canvas data with `setCellData(...)`
- default page behavior can use immediate save while preserving draft mode as a configurable alternative
- accepted immediate commits may refresh host rows, so focus restoration resolves the latest canvas instance and retries after the framework updates DOM
- usable canvas height is resolved from explicit height, measured container height, or a conservative fallback
- page-level draft state owns dirty row keys, save/discard, and unsaved-change guards
- dirty row colors use `setRowColors(...)`
- date-time editors resolve direct typed input before OK commits
- attachment values are normalized into render/editor arrays
- attachment dirty comparison ignores generated `uid` and compares stable file fields
- attachment cells render up to 3 previews/items plus `+N`
- image attachments use thumbnails and non-image attachments use extension/file chips
- attachment editor supports drag/drop and click-to-upload local file selection
- mock local files are stored as data URLs; real upload remains a data-source / adapter scope
- attachment editing is enabled only for persisted rows with backend `recordID` when real upload requires record identity
- attachment popup placement is handled by the host overlay/CSS, defaults left, switches right when right space is insufficient, and may cover the current edited cell

This supports treating Track B as a validated host-edit integration path for text/select/date fields and attachment metadata editing.

Browser validation covered:

- text Enter commit
- text Tab commit and focus restoration
- status select commit
- text Escape cancel
- text outside-click commit
- date-time typed input plus OK commit
- attachment popup open/close and local file button visibility
- page reload persistence through mock-store
- no new blocking console errors in the validated route

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

### Real attachment upload protocol

Not yet validated here.

Implication:

- keep real upload protocol guidance in the dedicated reference
- do not imply backend upload semantics are project-validated by `expensePoc/frontend`
- real upload should be integrated through the host data-source / adapter layer after the backend file API contract is available

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
