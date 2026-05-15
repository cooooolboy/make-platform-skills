# Drawer layout

## Default mode

Create, edit, and detail UIs default to a right-side Drawer.

- placement: right
- default width: `60%`
- small screens: may use `100%`
- mask closable: enabled by default; clicking the mask or blank area closes the current Drawer
- header action area contains close and primary/secondary actions
- no fixed footer by default
- body scrolls inside the Drawer shell

Mask click uses the same close path as the header close control. If a form has an explicit unsaved-change guard, apply that same guard to mask close instead of silently ignoring the mask click.

Treat these as Make UI defaults. User requirements and established project patterns may override them.

Use route pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.

Drawer presentation can still be driven by dynamic child routes when URL-addressable create/edit/detail state is required. In that case, keep the Drawer UI and use route params for object and record identity.

## Header actions

Use a compact header layout:

- left title area: fullscreen toggle when supported, then mode tag or record status, then title
- right action area: contextual actions first, then one close control as the final far-right item
- detail actions usually include edit/delete or other requested record actions before the close control
- create/edit actions usually include save and cancel before the close control
- keep button spacing compact
- avoid decorative icons on text actions; reserve icons for compact controls such as fullscreen, exit fullscreen, and close
- do not place a close icon/button in the left title area
- do not render duplicate close controls, such as a left `X` plus a right `关闭` button
- close should be icon-only by default, with accessible name/title `关闭`; avoid visible `关闭` text unless an existing project pattern explicitly requires text buttons

When Ant Design is used, prefer `FullscreenOutlined` and `FullscreenExitOutlined` for fullscreen controls, and the project-standard close control for closing.

If fullscreen is not implemented or not useful for a simple Drawer, keep a normal close control in the header.

## Create / edit Drawer

Recommended structure:

1. Drawer header: left fullscreen toggle plus mode/title; right save, cancel, and final icon-only close
2. Drawer body: form content

Form layout:

- group fields into sections
- create/edit forms can use a dedicated modifier class or style scope when their visual treatment differs from detail Drawers
- for schema-driven forms where backend field names may be long or unpredictable, consider vertical labels in a two-column grid before choosing horizontal labels
- horizontal label/value alignment remains acceptable when labels are short, stable, or already established by the project
- use a subtle neutral Drawer body with one lightweight white form panel or section panels; avoid visually heavy cards and nested cards
- keep form panels compact: moderate padding, 6-8px radius, thin neutral border, and low shadow at most
- common fields use a two-column grid on desktop
- long text, descriptions, and rich content span full width
- collapse to one column on small screens

Schema-driven Make forms:

- read the DSL/schema before generating create/edit Drawer fields
- derive field labels, editability, and control choice from schema metadata when available
- use the field component mapping in `component-usage.md`
- use date pickers for date fields, searchable selectors for user/department fields, select controls for select fields, mode-safe attachment controls for file fields, and read-only/association displays for lookup fields
- do not silently fall back to a bare text `Input` for `Date`, `User`, `Department`, `Select`, `File`, or `Lookup` fields
- create mode must omit `Make.Field.File` upload fields when the upload API requires a saved `recordID`; the new record has no `recordID` yet, so do not render fake upload controls, local-only attachment fields, or include file values in the create payload
- edit mode may render `Make.Field.File` controls only when a stable persisted record id exists; upload/delete calls stay in the host data-source or Service API adapter
- detail mode may display file fields as attachments, thumbnails, or file links and may offer explicit follow-up actions when supported
- if schema or candidate APIs are missing, state the reason and generate an explicit fallback with a later API integration point

Action placement:

- save / submit as the primary action
- cancel as a secondary action near save
- destructive actions should not be primary
- fixed footer is optional and should be added only when the user or existing project pattern requires persistent bottom actions

Do not define business validation rules here. Only provide visual error, loading, and saving states.

## Detail Drawer

Recommended structure:

1. Drawer header: left fullscreen toggle plus record title or generic detail title; right contextual actions and final icon-only close
2. detail body: compact read-only information grid
3. related sections: related data and attachments when supported

Read-only information can use:

- description list
- information grid
- sectioned cards or panels

Use horizontal label/value alignment by default on desktop:

- two-column grid for common fields
- each item has a stable label column and a flexible value column
- subtle bottom borders are preferred over boxed cards for dense record detail
- long text, file, lookup, URL-rich, or attachment-heavy values span the full width
- labels use subdued color and consistent width; values use stronger text color and wrap safely

Detail Drawers should not have a footer unless the user explicitly asks for persistent bottom actions.

Edit and detail Drawers should look related but not identical: edit uses vertical form labels in panel sections, while detail uses compact label/value rows. Do not render detail fields as a loose unstyled list.

If a related-data section is tabular, route the table implementation to `@qfei-design/canvas-table` through `canvas-table-integration`.

Do not add activity, dynamic records, timeline, comments, or operation logs by default. Add them only when the user explicitly asks.

## Stacked Drawers

When a user opens edit from detail, keep the detail Drawer mounted underneath and open the edit Drawer above it.

- closing the edit Drawer returns to the detail Drawer
- closing the detail Drawer returns to the list page
- clicking the mask or blank area must close only the topmost Drawer
- if the implementation cannot guarantee topmost-only mask close, fix the Drawer stack close handler; do not change the default behavior to mask-close disabled
- use increasing z-index values or a Drawer stack manager so layers do not collapse together
- avoid shared state handlers that close all active Drawers at once

## Drawer scrolling

The Drawer shell remains fixed. The body scrolls.

Do not let the underlying page scroll when the Drawer is open.
