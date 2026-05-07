# field editor patterns

Use this file to map business field types to host editor patterns.

This file is about host-side editor integration, not about forcing one UI library.

## 1. Common editor interface

Prefer a shared editor interface such as:

- `focus()`
- `updateVal()`

The field editor should return enough information for the host save layer to distinguish:

- display value
- submit value
- optional extra render mapping data

## 2. Text fields

Examples:

- single-line text
- multi-line text

Recommended pattern:

- simple text editor
- submit-style editing
- `updateVal()` returns the edited string for both display and submit in simple cases

Good fit for:

- `contenteditable`
- host input component
- textarea-like component when needed

## 3. Number-like fields

Examples:

- number
- amount
- percentage

Recommended pattern:

- numeric input editor
- submit-style editing
- keep precision and unit behavior in field metadata or field config
- keep the row value and submit value as a number when the backend expects a number
- put currency, percent, thousands separators, and unit display in the editor formatter or table render layer
- parse formatted input back to a number before commit

Typical concerns:

- empty string vs null
- precision
- suffix/unit display
- display string vs submit payload
- invalid input fallback and validation policy

Good defaults:

- `Enter` may commit for simple number editors, similar to text fields.
- `Escape` should cancel without writing the candidate value.
- Do not pre-format the row data into a display string before it reaches the editor; that often makes initial values and submit payloads brittle.

## 4. Date fields

Recommended pattern:

- date picker editor
- often realtime-style editing
- keep date format driven by field metadata

Typical concerns:

- display format vs submit format
- whether selecting a value should close immediately or not
- whether direct typed input has been parsed before OK / commit

For date-time editors with an explicit OK button, resolve the current input text into the selected value before calling the table commit path. Some UI libraries do not emit `onChange` just because the user typed a complete date-time string.

## 5. Select fields

Examples:

- single-select
- multi-select

Recommended pattern:

### Single-select

- often realtime-style
- selecting a new value may commit immediately

### Multi-select

- often submit-style
- editing may remain open while the user manages multiple selections

Typical concerns:

- label/value separation
- search support
- selected item display
- whether display value is a tag list while submit value is ids/values

## 6. Person fields

Recommended pattern:

- reuse the host project's existing people selector
- treat `focus()` as "open the selector" rather than only text focus
- usually submit-style editing

Typical concerns:

- display list vs submit ids
- auxiliary render mapping data for avatars/names

## 7. Department fields

Recommended pattern:

- reuse the host project's department selector
- treat `focus()` as opening the selector
- usually submit-style editing

Typical concerns:

- display list vs submit ids
- extra mapped render data for downstream cell rendering

## 8. Attachment fields

Attachment fields are special and should usually be treated as their own category.

Recommended pattern:

- render in-table previews/icons through canvas-table rendering
- reuse the host project's upload/file components for editing when available
- otherwise provide a host DOM editor with drag/drop and click-to-upload file selection
- usually submit-style editing
- require a saved backend record identity when the backend upload API needs one

Typical concerns:

- image vs non-image file display
- preview/open behavior
- submit payload vs render payload
- replacement/removal/reordering
- max file count
- mock local data URL behavior vs real upload adapter behavior

For details, read `attachment-editor-patterns.md`.

## 9. Distinguish display value and submit value

This distinction matters most for:

- number-like fields with formatted display
- select fields
- person fields
- department fields
- attachment fields
- date fields with formatted display

Do not assume one field value can always serve both rendering and API submission directly.
