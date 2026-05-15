# Route-based form and detail pages

## When to use

Use route-based pages only when the user explicitly asks for:

- independent page
- route page
- page navigation
- page jump
- standalone create/edit/detail screen
- full-page form/detail

Otherwise use the default Drawer mode.

## Object route model

Object navigation should use React Router dynamic params.

Preferred default pattern:

```text
/objects/:objectKey
```

When create/edit/detail must be URL-addressable, use dynamic child routes:

```text
/objects/:objectKey/new
/objects/:objectKey/:recordId
/objects/:objectKey/:recordId/edit
```

Presentation is still Drawer by default for create/edit/detail. Only render these child routes as full pages when the user explicitly asks for page-route mode.

Do not generate a separate hard-coded route per object such as `/customers`, `/orders`, and `/opportunities` unless the host project already uses that convention or the user explicitly requests it.

## Create / edit page

Recommended structure:

1. page header: back action, title, secondary metadata if needed
2. action area: cancel, save, submit, or other requested actions
3. form body: sectioned form content

The content area may scroll inside the app content region. Global header and sidebar remain fixed.

Form layout:

- two-column desktop grid for common fields
- full-width rows for long text and descriptions
- create pages must omit attachment upload fields when upload requires a saved `recordID`; edit pages may show attachments only when the persisted record id exists
- one-column layout on small screens
- section headings rather than deeply nested cards

## Detail page

Recommended structure:

1. summary header: record title, status, key metadata, and main actions
2. detail body: sectioned read-only information
3. related sections: related records and attachments when requested

Do not add activity, dynamic records, timeline, comments, or operation logs by default. Add them only when the user explicitly asks.

The detail content can scroll inside the content region. Do not introduce a second global shell.

## Navigation

Use React Router for route-based create/edit/detail pages and dynamic object navigation.

Keep routes predictable and shallow. Do not invent route semantics beyond what the user requested or what the host project already uses.
