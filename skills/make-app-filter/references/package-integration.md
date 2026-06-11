# Package Integration

Use this reference when wiring `@qfei-design/make-filter` into a Make App host.

## Public package surface

Use only public package entrypoints:

- `@qfei-design/make-filter`
- `@qfei-design/make-filter/react`
- `@qfei-design/make-filter/adapters/antd`
- `@qfei-design/make-filter/styles.css`

Never import from `src`, `dist`, or package-internal files.

## Package provides

- Filter IR helpers
- Make field operator matrix
- value defaults
- validation and active-condition summary
- CEL compile and parse
- `AdvancedFilterPanel`
- `useAdvancedFilterController`
- candidate source props
- optional Ant Design adapter
- internal panel stylesheet

## Package capability gate

Backend `filter.expression` supports File, DateRange, and Lookup semantics, but Make App hosts must expose only capabilities declared by the installed package. Before showing a field or relying on a compiled expression, read the package docs/capabilities listed in `SKILL.md` and check package helpers such as `getFilterableFields`, `getOperatorsForField`, and `isAdvancedFilterFieldSupported`.

Required package capabilities for the current Make target baseline:

- DNF-safe `compileListFilter` output for keyword search plus advanced filter; it must not emit unsupported `(A || B) && C`.
- Date/DateTime range operators such as `is_within` and `is_not_within`.
- DateRange operators such as `contains_date`, `not_contains_date`, `fully_contains`, `is_contained_by`, equality, and empty checks.
- File operators for file-name contains/not-contains and attachment-count comparisons.
- Lookup support that compiles the current entity's Lookup field key and derives operators from `targetFieldKey`.

If the installed package lacks any needed capability, stop and require a package upgrade or package capability update. Do not implement missing operators, validators, or CEL compilation in the host.

## Host provides

- normalized Make field metadata
- applied advanced-filter state
- toolbar trigger placement
- Popover, Modal, Drawer, or other mounting container
- container width, max height, and scrolling
- candidate APIs for users and departments
- Service request adapter and record reload timing
- CanvasTable header filter UI/menu and `openWithField` linkage
- optional URL/deep-link encoding and parsing policy

## Integrated Make App baseline

In Make record-list pages, any filtering request is one integrated feature:

- toolbar advanced filter uses this package
- header `按该字段筛选` UI/menu is implemented by the host through CanvasTable
- header action calls the same package controller, usually `openWithField(fieldKey)`
- both paths commit through the same advanced-filter draft and Service `filter.expression`

Do not ship only the toolbar package panel or only the table header filter menu.

## Default imports

```tsx
import { compileListFilter } from "@qfei-design/make-filter";
import {
  AdvancedFilterPanel,
  useAdvancedFilterController,
} from "@qfei-design/make-filter/react";
import { createAntdFilterComponents } from "@qfei-design/make-filter/adapters/antd";
import "@qfei-design/make-filter/styles.css";
```

Use `createAntdFilterComponents` only when the host uses Ant Design. For other component libraries, implement `AdvancedFilterComponents` with host controls instead of adding Ant Design.

## Minimal host wrapper

The package does not render the trigger or overlay:

```tsx
const components = createAntdFilterComponents();
const [open, setOpen] = useState(false);
const controller = useAdvancedFilterController({
  fields: filterableFields,
  value: appliedGroup,
  onChange: onApplyGroup,
});

function handleOpenChange(nextOpen) {
  if (nextOpen) {
    controller.beginDraft();
    setOpen(true);
    return;
  }
  controller.resetDraft();
  setOpen(false);
}

function handleConfirm() {
  const validation = controller.confirm();
  if (validation.valid) setOpen(false);
}

<Popover
  open={open}
  trigger="click"
  placement="bottomLeft"
  content={
    <div className="advanced-filter-popover">
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
    </div>
  }
  onOpenChange={handleOpenChange}
/>
```

Host CSS should size only the outer container, for example width, max-height, and overflow. Do not duplicate package panel internals in host CSS.

## Compatibility shims

When migrating an older project, a small local shim may preserve old function names while delegating to package exports. The shim must not contain copied operator, validation, compiler, parser, or panel logic. Add a test or source check that imports from `@qfei-design/make-filter`.

## Out of scope for the package

- Popover, Modal, Drawer, or scroll container rendering
- toolbar layout
- Service route implementation
- CanvasTable header filter UI or menu behavior
- CanvasTable `suffixRender` implementation
- authentication/session handling
- package-manager or deployment policy in host apps
- saved views or saved filter persistence
- local filtering of already loaded Make record rows
