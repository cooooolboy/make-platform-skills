# UI Style

Use this reference when mounting the package `AdvancedFilterPanel` inside a host UI.

## Placement

The filter trigger belongs in the local list toolbar:

```text
search input -> 筛选 -> 刷新 -> optional view switch
```

Use `makeui` for the surrounding toolbar layout. This skill owns the package-backed trigger behavior and panel contents.

Default trigger:

- button text: `筛选`
- icon: filter icon from the host icon library
- active text: `已筛选 N 个条件`
- active style: green-tinted border/background/text

## Host overlay

The package does not render Popover, Modal, Drawer, or scroll containers. The host chooses the mounting surface. Default Make object lists use a bottom-left Popover.

Default host Popover behavior:

- trigger: click
- placement: `bottomLeft`
- close without confirm calls package `resetDraft`
- open calls package `beginDraft`
- content width: `min(724px, calc(100vw - 48px))`
- content max height: `min(560px, calc(100vh - 160px))`
- body overflow: `auto`
- border radius: `8px`
- shadow: `0 14px 40px rgb(15 23 42 / 16%)`

Do not hard-code a fixed initial height when content is shorter than the max height.

## Package panel

Render package `AdvancedFilterPanel` inside the host container:

```tsx
function handleConfirm() {
  const validation = controller.confirm();
  if (validation.valid) setOpen(false);
}

<AdvancedFilterPanel
  candidateSources={candidateSources}
  components={components}
  fields={filterableFields}
  value={controller.draftValue}
  validationErrors={controller.validationErrors}
  onChange={controller.setDraftValue}
  onClear={controller.clearDraft}
  onConfirm={handleConfirm}
/>
```

Package `styles.css` owns:

- single white panel surface
- fixed header/footer inside the panel
- scrollable body inside the host container
- condition rows
- nested group surface
- attached value editor and delete button
- control-level error states
- compact relation selector

Host CSS may size `.advanced-filter-popover` or equivalent outer wrapper. It must not fork package internals such as `.advanced-filter__row`, `.advanced-filter__condition-line`, or `.advanced-filter__value-action` unless there is a documented package bug and a local compatibility shim is temporary.

## Condition and validation behavior

Keep the package defaults:

- row controls share one connected line
- value editor and delete button are attached with no gap
- every value editor type supports the same error status
- validation failure keeps the popover open
- fixed value controls clear their red state immediately after a valid draft change
- `清空所有` clears draft first and clears applied filters only after `确认`

## Defaults to avoid

- Do not build a custom advanced-filter panel when `AdvancedFilterPanel` satisfies the requirement.
- Do not use a full-screen Drawer for the default advanced filter.
- Do not style host overlay internals by copying package CSS into the app.
- Do not render the delete button as a detached block with a gap from the value editor.
- Do not submit on every keystroke.
- Do not place advanced filter controls inside the CanvasTable header row.
- Do not add saved views, saved filters, import/export/group/sort controls as part of this skill.
