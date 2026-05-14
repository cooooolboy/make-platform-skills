# Drawer layout

## Default mode

Create, edit, and detail UIs default to a right-side Drawer.

- placement: right
- default width: `60%`
- small screens: may use `100%`
- header action area contains close and primary/secondary actions
- no fixed footer by default
- body scrolls inside the Drawer shell

Treat these as Make UI defaults. User requirements and established project patterns may override them.

Use route pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.

Drawer presentation can still be driven by dynamic child routes when URL-addressable create/edit/detail state is required. In that case, keep the Drawer UI and use route params for object and record identity.

## Header actions

Use a compact header layout:

- left side: fullscreen toggle when supported, then mode tag or record status, then title
- right side: contextual actions, then close
- detail actions usually include edit, delete, and close when those actions exist
- create/edit actions usually include save, cancel, and close
- keep button spacing compact
- avoid decorative icons on text actions; reserve icons for compact controls such as fullscreen, exit fullscreen, and close

When Ant Design is used, prefer `FullscreenOutlined` and `FullscreenExitOutlined` for fullscreen controls, and the project-standard close control for closing.

If fullscreen is not implemented or not useful for a simple Drawer, keep a normal close control in the header.

## Create / edit Drawer

Recommended structure:

1. Drawer header: title plus save, cancel, close, and optional fullscreen action
2. Drawer body: form content

Form layout:

- group fields into sections
- create/edit forms can use a dedicated modifier class or style scope when their visual treatment differs from detail Drawers
- for schema-driven forms where backend field names may be long or unpredictable, consider vertical labels in a two-column grid before choosing horizontal labels
- horizontal label/value alignment remains acceptable when labels are short, stable, or already established by the project
- when extra separation helps readability, prefer one lightweight form surface on a subtle neutral Drawer body; avoid nested cards unless the existing design system uses them
- common fields use a two-column grid on desktop
- long text, attachments, descriptions, and rich content span full width
- collapse to one column on small screens

Schema-driven Make forms:

- read the DSL/schema before generating create/edit Drawer fields
- derive field labels, editability, and control choice from schema metadata when available
- use the field component mapping in `component-usage.md`
- use date pickers for date fields, searchable selectors for user/department fields, select controls for select fields, attachment controls for file fields, and read-only/association displays for lookup fields
- do not silently fall back to a bare text `Input` for `Date`, `User`, `Department`, `Select`, `File`, or `Lookup` fields
- if schema or candidate APIs are missing, state the reason and generate an explicit fallback with a later API integration point

Action placement:

- save / submit as the primary action
- cancel as a secondary action near save
- destructive actions should not be primary
- fixed footer is optional and should be added only when the user or existing project pattern requires persistent bottom actions

Do not define business validation rules here. Only provide visual error, loading, and saving states.

## Detail Drawer

Recommended structure:

1. Drawer header: fullscreen toggle when supported, record title or generic detail title, and contextual actions
2. summary area: title, status, key metadata, and main actions
3. detail sections: read-only information, related data, attachments

Read-only information can use:

- description list
- information grid
- sectioned cards or panels

Use horizontal label/value alignment by default on desktop. Detail Drawers should not have a footer unless the user explicitly asks for persistent bottom actions.

If a related-data section is tabular, route the table implementation to `@qfei-design/canvas-table` through `canvas-table-integration`.

Do not add activity, dynamic records, timeline, comments, or operation logs by default. Add them only when the user explicitly asks.

## Stacked Drawers

When a user opens edit from detail, keep the detail Drawer mounted underneath and open the edit Drawer above it.

- closing the edit Drawer returns to the detail Drawer
- closing the detail Drawer returns to the list page
- clicking the mask or blank area must close only the topmost Drawer
- if the implementation cannot guarantee topmost-only mask close, disable mask close and rely on the header close action
- use increasing z-index values or a Drawer stack manager so layers do not collapse together
- avoid shared state handlers that close all active Drawers at once

## Drawer scrolling

The Drawer shell remains fixed. The body scrolls.

Do not let the underlying page scroll when the Drawer is open.
