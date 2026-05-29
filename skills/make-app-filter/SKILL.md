---
name: make-app-filter
description: Use when designing, generating, refactoring, or reviewing Make App advanced filter behavior, filter builders, field-type operators, toolbar filter popovers, CanvasTable header filter linkage, Service filter contracts, and Make Data API filter expression translation. Covers filter IR, AND/OR groups, field operator matrices, ExpensePoc-style advanced filter panel defaults, header more-menu "filter by this field", CEL expression compilation, empty-filter handling, user/department candidate values, and tests. Does not cover general page layout, table rendering, auth, runtime packaging, DSL modeling, or Make CLI deployment.
metadata:
  homepage: https://github.com/qfeius/make-platform-skills/make-app-filter
---

# make-app-filter

Use this skill for Make App advanced filtering. It owns the filter model, field-type operator rules, advanced filter panel behavior, table-header-to-filter linkage, Service filter contract shape, filter expression translation, and filter tests.

It does not own general page layout (`makeui`), CanvasTable rendering internals (`canvas-table-integration`), Service route implementation (`make-app-service`), auth (`make-app-auth`), runtime packaging (`make-app-runtime`), DSL modeling (`makedsl`), or Make CLI execution (`makecli`).

## Quick start

1. Inspect host field metadata, existing search/filter state, records API contract, and the CanvasTable column/header setup.
2. Build a normalized Filter IR before rendering controls. Do not bind UI directly to raw backend filter payloads.
3. Choose operators and value editors by Make field type. Unsupported fields must be hidden or disabled.
4. Keep advanced filter edits in a draft. Only submit after `确认`; outside click or trigger re-click discards unconfirmed changes.
5. Compile applied filters to the host Service contract. New Make App code should send `filter: { expression }`; omit `filter` when no expression exists.
6. Do not filter Make record lists locally. List filtering must go through Service/backend filter APIs.
7. For CanvasTable record lists with advanced filter enabled, add the header more-menu linkage by default unless the user explicitly says header filtering is not needed.
8. Read only the needed reference files from the map below.

## Topic reference map

| Task / topic | Read |
| --- | --- |
| Filter IR, draft/confirm semantics, search merge | `references/filter-model.md` |
| Make field type to operator/value-editor matrix | `references/operator-matrix.md` |
| ExpensePoc-style panel layout, spacing, validation states | `references/ui-style.md` |
| CanvasTable header more menu and advanced filter linkage | `references/header-table-linkage.md` |
| Service filter contract and CEL expression translation | `references/service-translation.md` |
| Tests, smoke checks, common regressions | `references/testing-and-pitfalls.md` |
| Toolbar placement and surrounding page layout | Use `makeui` |
| CanvasTable suffixRender public API details | Use `canvas-table-integration` |
| Service route implementation and adapter tests | Use `make-app-service` |

## Scope boundary

- `make-app-filter` may define filter state shape, operator names, value normalization, field support, expression compilation, header filter linkage, and filter-specific tests.
- `make-app-filter` may define how advanced filter state combines with a toolbar keyword search.
- It must not decide where the filter button sits beyond the local toolbar order already agreed with `makeui`: search, filter, refresh on the left.
- It must not implement table cell rendering, table sorting, table editing, or CanvasTable internals.
- It must not design generic Service APIs outside filter params. Service route implementation and logging stay in `make-app-service`.
- It must not use local DSL/YAML as runtime field metadata. Filter fields come from normalized runtime schema/field metadata.

## Default behavior

- Advanced filter is optional product capability. Generate it only when the user asks for advanced filtering, table header filtering, condition builders, or the existing project already has it.
- Once advanced filter is in scope, use the ExpensePoc default: toolbar `筛选` button, bottom-left popover, single white panel surface, draft editing, `确认`, `清空所有`, active label `已筛选 N 个条件`, and field-type controls.
- Filter rows use one connected control line: field selector, operator selector, value editor, and delete icon. The value editor and delete icon are attached with no gap or rounded seam between them for every value editor type, including select, input, number, date, user, and department editors.
- Empty draft rows do not count as active filters and do not compile to an expression. If the user clicks `确认` while a condition row exists but is incomplete, keep the popover open and mark only the invalid controls in red.
- After the first failed `确认`, every draft change must revalidate the latest draft and clear fixed errors immediately. A value select/input/date/number/user/department editor that becomes valid must lose its red error state without waiting for another `确认`.
- Clicking outside the popover or clicking the trigger to close discards unconfirmed draft edits.
- `清空所有` empties the draft. It clears applied filters only after the user clicks `确认`.
- Search keyword and advanced filter compile separately; merge them with `AND`. Search itself is an `OR` group over searchable text-like fields.

## Hard rules

- New filter output uses `filter: { expression: string }`. Do not generate new old-style object-array filter payloads.
- If no valid expression exists, omit `filter`. Do not send `filter: []`, `filter: {}`, or `{ expression: "" }`.
- Field keys used in CEL must be valid identifiers: `/^[A-Za-z_][A-Za-z0-9_]*$/`. Skip or reject invalid field keys instead of emitting unsafe expressions.
- Do not expose unsupported fields in advanced filter or table header "按该字段筛选". ExpensePoc defaults treat `Make.Field.File`, `Make.Field.DateRange`, `Make.Field.Lookup`, and unknown types as unsupported until the host backend documents safe semantics.
- Single select, single user, and single department fields expose only equality operators by default. Multi select, multi user, and multi department fields expose collection operators and empty/not-empty.
- User and department values are identities, not display names. Advanced filter user/department value editors must use the same host candidate APIs as forms and table cell editors: `/api/users` and `/api/departments` or host equivalents. Normalize users as `userId/userName` and departments as `departmentId/departmentName`.
- Do not source advanced filter user/department options from field schema `options`, local demo arrays, current table rows, hardcoded fixtures, or display labels. Current applied values may be merged only to keep selected labels visible while the real candidate API is loading or temporarily empty.
- Header menu filtering must append a condition to the advanced filter draft and open the same popover. It must not submit immediately or trigger record reload before `确认`.
- CanvasTable record-list headers should expose a more menu with `按该字段筛选` for supported fields when advanced filter is in scope, unless explicitly disabled.
- Table scrolling, object switching, outside click, or unmount must close any header menu and restore the header suffix icon to hover-only state.
- Tests are required for operator matrix, expression compilation, empty filter omission, draft confirm/discard, value-control validation error rendering and clearing, header menu linkage, unsupported field hiding, and Service payload shape.

## Collaboration rules

- With `makeui`: use `makeui` for toolbar placement and page shell; this skill owns filter behavior inside the control.
- With `canvas-table-integration`: use the canvas skill for `suffixRender` mechanics; this skill owns the "按该字段筛选" action semantics.
- With `make-app-service`: this skill defines filter query shape; Service route validation, adapter logging, and Make request details stay in service.
- With `makedsl`: use DSL/Data API references only to confirm backend filter support. Do not make this skill generate DSL.
