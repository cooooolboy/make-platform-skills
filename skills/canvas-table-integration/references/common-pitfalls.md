# common pitfalls

Read this file before finalizing a canvas-table integration.

## 1. Instantiating during SSR

Symptom:

- `window` / `document` / canvas errors

Fix:

- instantiate only in a client lifecycle hook
- keep the package client-only

## 2. Container has no real size

Symptom:

- blank table
- wrong first render
- broken scroll area
- canvas stays at fallback size such as `960x480` while the host is larger

Fix:

- make sure the container has explicit width and height
- if the host layout is responsive, synchronize size after mount
- measure the host before creating `CanvasTableComponent`; do not create with fallback dimensions and rely on a later resize to repair the first render
- keep size state nullable or otherwise gate table creation until a real host size is known

## 3. Forgetting `destroy()`

Symptom:

- leaked listeners
- repeated callbacks
- stale table instances

Fix:

- always destroy on unmount / cleanup

## 4. Wrong event namespace

Symptom:

- no event callbacks
- callbacks wired to the wrong instance

Fix:

- use `globalEventBus.onWithNamespace(event, table.tableId, handler)`

## 5. Using virtual mode but forgetting the page argument

Symptom:

- paging errors
- missing data updates

Fix:

- in virtual mode, always call `setData(rows, page)`

## 6. Switching to advanced features too early

Symptom:

- integration becomes hard to maintain
- too much custom rendering for a first pass

Fix:

- start with local or virtual base path
- add only the few business interactions actually needed now

## 7. Passing raw meta into runtime props

Symptom:

- table does not understand the schema shape
- renderer/editor wiring becomes inconsistent

Fix:

- convert meta into `IColumn[]` before creating the table

## 8. Treating internal source as public API

Symptom:

- fragile downstream integration
- breakage after library changes

Fix:

- import only from the package root
- rely on `PUBLIC_API.md` and documented consumer guides

## 9. Overusing shape rendering

Symptom:

- complex code for simple cells
- difficult maintenance

Fix:

- start with plain text columns
- add `render + TextShape` only for high-value business interactions

## 10. Hiding the focusable visual canvas host

Symptom:

- browser logs `Blocked aria-hidden` or similar focus accessibility warnings
- the package-created canvas has `tabIndex=0` but an ancestor is `aria-hidden`
- table focus or keyboard interaction becomes inconsistent

Fix:

- do not put `aria-hidden` on the visual canvas-table host or a focusable canvas ancestor
- do not use `inert` on the visual host unless the table is intentionally disabled
- keep any screen-reader fallback table as a separate visually-hidden structure
- give the visual host a non-hidden accessible label, for example `role="group"` plus `aria-label`

## 11. Replacing the canvas host during loading

Symptom:

- wrapper has correct `100%` width and height, but the host contains no `<canvas>`
- the table appears after initial load, then disappears or keeps an old size after records refresh
- React StrictMode, route switches, or loading state toggles expose stale/destroyed table instances

Fix:

- keep the canvas host mounted whenever schema columns exist
- render loading as an overlay sibling above the host instead of returning a different loading node
- use one lifecycle path to create/update/destroy the table: when ready, create if missing, then call `updateProps`, `updateCanvasSize(width, height, true)`, and `setData(rows)`
- use a separate unmount cleanup to call `destroy()` once; avoid splitting create and update effects so that cleanup from one effect can remove the instance expected by another
- verify in the browser by comparing wrapper, host, and canvas rectangles; host and canvas CSS size should match, while canvas `width`/`height` attributes may be larger due to DPR scaling
