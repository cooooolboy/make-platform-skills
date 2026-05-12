# Drawer layout

## Default mode

Create, edit, and detail UIs default to a right-side Drawer.

- placement: right
- default width: `75%`
- small screens: may use `100%`
- close control in the Drawer header

Use route pages only when the user explicitly asks for an independent page, route, navigation, page jump, or standalone screen.

Drawer presentation can still be driven by dynamic child routes when URL-addressable create/edit/detail state is required. In that case, keep the Drawer UI and use route params for object and record identity.

## Create / edit Drawer

Recommended structure:

1. Drawer header: title and close action
2. Drawer body: form content
3. fixed Drawer footer: cancel and primary action

Form layout:

- group fields into sections
- common fields use a two-column grid on desktop
- long text, attachments, descriptions, and rich content span full width
- collapse to one column on small screens

Footer actions:

- cancel on the left side of the action group
- save / submit as the primary action
- destructive actions should not be primary

Do not define business validation rules here. Only provide visual error, loading, and saving states.

## Detail Drawer

Recommended structure:

1. Drawer header: record title or generic detail title
2. summary area: title, status, key metadata, and main actions
3. detail sections: read-only information, related data, attachments
4. optional fixed footer only when the detail flow has persistent actions

Read-only information can use:

- description list
- information grid
- sectioned cards or panels

If a related-data section is tabular, route the table implementation to `@qfei-design/canvas-table` through `canvas-table-integration`.

Do not add activity, dynamic records, timeline, comments, or operation logs by default. Add them only when the user explicitly asks.

## Drawer scrolling

The Drawer shell remains fixed. The body scrolls.

Do not let the underlying page scroll when the Drawer is open. Avoid layouts where the footer disappears below the viewport.
