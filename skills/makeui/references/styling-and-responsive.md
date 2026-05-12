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
