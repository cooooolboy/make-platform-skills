# attachment editor patterns

Use this file when attachment/file fields are part of the editable canvas-table workflow.

Attachment fields belong in the second-version editing scope, but they should be designed as host-driven editors, not as canvas-table-native uploaders.

## 1. Two-layer model

Treat attachment fields as two cooperating layers.

### Table-render layer

Canvas-table can support:

- image thumbnails
- file icons
- preview/open click interactions
- multi-item visual layout

### Host-editor layer

The host project must provide:

- upload or file selection UI
- replacement / removal logic
- ordering logic if needed
- submit payload construction
- render payload construction

## 2. In-table rendering

A common pattern is:

- parse the attachment value structure
- detect image vs non-image files
- render image thumbnails or file icons through `ImgShape`
- attach click behavior to preview/open the file

Do not confuse this with the editing workflow itself.

## 3. Why `ImgShape` matters

`ImgShape` gives the table-render layer a good foundation for:

- image display
- icon display
- click interaction
- loading/error fallback behavior

But `ImgShape` is not an uploader and not a file manager.

## 4. Attachment editor responsibilities

The host editor should be responsible for:

- selecting files
- uploading files
- replacing files
- removing files
- reordering files when the business requires it
- returning the correct submit payload

## 5. Value structure guidance

Keep these concepts distinct:

- `newVal`: render-friendly or editor-friendly attachment data
- `fieldValue`: API submission data
- optional extra mapping data if the host render layer needs it

A host project may need both:

- a lightweight submit payload (ids, keys, tokens, urls)
- a richer render payload (name, url, type, thumbnail, icon hints)

## 6. Interaction model

Attachment editing is usually a submit-style editor.

Common behavior:

- open attachment picker/uploader
- modify attachment list
- commit on explicit save/close or on a controlled outside-click flow

Do not default to instant commit unless the host project already uses that model.

## 7. Component-library rule

For attachment editors, strongly prefer the current project's existing upload/file component system.

Do not force the skill to require a specific upload library.

## 8. Scope discipline

This skill should document how to integrate attachment editors into canvas-table.

It should not attempt to define the full server-side upload protocol unless the host project already exposes that pattern and the user explicitly asks for it.
