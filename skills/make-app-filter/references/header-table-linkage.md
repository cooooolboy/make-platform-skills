# Header Table Linkage

Use this reference when connecting CanvasTable header menus to advanced filter.

## Default behavior

When a CanvasTable record list has advanced filter enabled, add a header more menu by default unless the user explicitly says header filtering is not needed. The menu should include `按该字段筛选` for supported fields.

Clicking `按该字段筛选` must:

1. close the header menu
2. call the advanced filter imperative API, for example `advancedFilterRef.current?.openWithField(fieldKey)`
3. append one draft condition using the clicked field
4. open the same toolbar advanced filter popover
5. wait for the user to fill a value and click `确认`

It must not submit immediately, reload records, or create a separate header-only filter state.

## CanvasTable suffix menu

Use `canvas-table-integration` for exact `suffixRender` API details. The consumer-side pattern is:

- add a header suffix more icon through column `suffixRender`
- default `displayMode` is `hover`
- when this column's menu is open, keep that column suffix icon `always`
- other columns remain `hover`
- after menu closes, restore the icon to `hover`
- refresh header cells after the active menu column changes

The more icon should be a lightweight 14px SVG-style button in the table header suffix slot. ExpensePoc uses a rounded rectangle with three dots.

## Menu placement and style

Default header menu dimensions and style:

- width: `236px`
- viewport padding: `8px`
- gap below header cell: `2px`
- position: fixed
- padding: `12px`
- border: `1px solid #e5e7eb`
- radius: `6px`
- background: `#fff`
- shadow: `0 8px 24px rgb(15 23 42 / 14%)`

Default content:

```text
field title
按该字段筛选     only when supported
排序
升序  降序       placeholders or real sort if sort is in scope
```

The filter action uses a full-width 30px row with hover background `#f4f7ff` and text `#1677ff`.

## Closing rules

Close the header menu when:

- clicking outside the menu
- selecting `按该字段筛选`
- table scroll changes
- current entity/object changes
- component unmounts

Do not call table-wide refresh or scroll reset just to open the menu. Refresh only header cells if needed to update suffix icon display.

## Field support

The header menu must ask the advanced filter field-support predicate before showing `按该字段筛选`.

Default:

- supported fields show the filter action
- unsupported fields still may show sort UI if sorting is in scope
- unsupported fields must not call `openWithField`

Default unsupported cases:

- unknown field types
- `Make.Field.Lookup` without complete `relationKey`, `targetFieldKey`, target entity metadata, or target field metadata
- `Make.Field.Lookup` whose target field is another Lookup
- calculated or presentation-only field types that the backend does not expose for `filter.expression`

File and DateRange fields are supported by the current backend filter expression subset when the host provides the value editor and operator mapping from `operator-matrix.md`. Lookup fields are supported when the target field type can be resolved; the action still opens the current entity's Lookup field key, not a target-field path.

## Tests

Header linkage tests should cover:

- supported field opens menu and shows `按该字段筛选`
- clicking the action calls `onFilterByField(fieldKey)` and closes the menu
- unsupported field hides `按该字段筛选`
- open menu keeps active column suffix icon `always`
- outside click closes menu and restores `hover`
- table scroll closes menu and restores `hover`
- non-target tables do not get header menu triggers when the host only wants this on specific objects
