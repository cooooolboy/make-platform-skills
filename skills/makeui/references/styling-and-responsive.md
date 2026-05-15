# Styling and responsive rules

## Styling strategy

Use this priority:

1. User-specified styling system.
2. Existing project styling system.
3. Less as a default candidate when no styling system exists.

Do not force Less if the project already uses CSS Modules, Tailwind, styled-components, or another convention.

## Layout stability

For app shells and list pages:

- avoid body-level scrolling
- keep the global shell fixed to viewport height
- preserve `flex: 1`
- use `min-height: 0` and `min-width: 0`
- put scrolling in the intended region only

For list pages, the table region scrolls. For drawers, the Drawer body scrolls. For route pages, the content region may scroll.

## Density and spacing

Make App pages are operational tools, not landing pages.

Prefer:

- compact toolbar controls
- stable grid/flex layouts
- clear alignment
- restrained spacing
- section titles for structure

Avoid:

- oversized hero sections
- decorative cards around every group
- nested cards inside cards
- one-off gradients or ornaments
- page sections that cause unnecessary vertical scrolling

## Form Drawer polish

- keep create/edit form Drawer styling scoped away from list and detail views
- use a subtle neutral Drawer body with lightweight white form panels when grouping helps readability
- keep panel styling restrained: thin neutral border, 6-8px radius, moderate padding, low shadow at most
- in percentage-based Drawers, prefer stable grids such as `minmax(0, 1fr)` columns with `min-width: 0` children
- treat fixed minimum column widths as an overflow risk; use them only after checking the target Drawer width and breakpoint behavior
- align label typography, control height, border radius, and focus ring with existing project tokens or Ant Design defaults before adding custom values
- let long text, URL, description, and rich controls span full width when it improves readability
- omit file upload fields in create mode when upload needs a saved `recordID`; show attachment controls only after a persisted record exists
- header button density can be slightly more relaxed when a form needs it, but changes should stay scoped away from list and detail action styling

## Detail Drawer polish

- use compact horizontal label/value rows on desktop
- use a two-column detail grid for common fields
- make long text, file, lookup, URL-rich, and attachment-heavy values span full width
- prefer subtle row dividers over card-per-field layouts
- keep labels subdued and values readable with safe wrapping
- do not render detail content as an unstyled list or a form-like editable layout

## Responsive defaults

- sidebar may collapse or become an overlay on small screens
- Drawer width may become `100%` on small screens
- form grids collapse from two columns to one column
- toolbar actions may wrap, but create/new should remain easy to find
- table horizontal overflow belongs inside the table container

## States

Provide UI states without defining business logic:

- loading
- empty
- error
- saving
- disabled

State copy should be generic unless the user provides domain-specific wording.
