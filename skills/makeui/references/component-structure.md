# Component structure

## Contents

- [ExpensePoc default UI tree](#expensepoc-default-ui-tree)
- [Default module boundaries](#default-module-boundaries)
- [Route and page files](#route-and-page-files)
- [Feature modules](#feature-modules)
- [Object list and table pages](#object-list-and-table-pages)
- [Small-change exception](#small-change-exception)

## ExpensePoc default UI tree

For new Make POC projects, use the ExpensePoc-style `apps/ui/src` layout as the default unless the host project already has an equivalent componentized tree:

```text
apps/ui/src/
  App.tsx
  main.tsx
  components/
    page-shell/
    <feature>/
    <table-feature>/
      config/
      editing/
      editors/
      hooks/
      renderers/
      types/
  hooks/
  lib/
    service-api/
    make-gateway-api/  # only when the host explicitly allows direct gateway UI mode
  pages/
    <route-name>/
  router/
  types/
```

The directory names may follow a host project's established equivalents, but the responsibility split is mandatory. A generated POC UI must not be delivered as a flat `src` folder with most logic beside `App.tsx`, or as one large route component that owns shell, data loading, table configuration, form/detail drawers, row actions, and value display.

When refactoring a flat project, move toward this baseline before reporting the task ready. Preserve existing behavior, but make the source tree communicate page entrypoints, feature UI, shared hooks, Service adapters, pure adapters/config builders, routing, and shared types.

## Default module boundaries

New generated Make POC UI and non-trivial generated/refactored `apps/ui` code must be componentized by responsibility. Prefer the host project's existing directory style first when it already separates concerns. If the project has no clear convention, use the ExpensePoc default tree and these boundaries:

- `pages` or `routes`: route-level page entrypoints
- `features/<domain>`: object or workflow-specific UI modules
- `components`: reusable presentational components
- `hooks`: reusable UI state and data-loading hooks
- `services`, `api`, or `clients`: host Service API calls
- `utils` or `adapters`: value normalization, field display adaptation, and configuration builders

Do not introduce a new folder taxonomy when the project already has a stable equivalent. Keep naming aligned with the existing codebase, but do not use naming consistency as a reason to keep unrelated logic flat.

## Route and page files

Route/page files are orchestration modules. They may:

- read route params and query params
- choose the current object/module
- compose shell, toolbar, table, Drawer, and state surfaces
- connect feature hooks to feature components
- provide shallow page-level state that cannot be owned by a child module

Route/page files must not become the owner of every detail. Do not keep data fetching, metadata normalization, CanvasTable column construction, form schema mapping, create/edit/detail Drawer implementation, row action rendering, and field display formatting in the same route/page component.

## Feature modules

Use feature modules for non-trivial object-management UI. A feature module may contain:

- container component for the object list or workflow surface
- toolbar/search/filter controls
- table region component
- row action and detail-entry components
- create/edit/detail Drawer or route-page components
- hooks for loading metadata, records, selected record, and UI state
- adapters for Make field display, form values, and table column configuration

Keep pure adapters separate from React rendering when practical. Keep host Service calls behind the existing API/client layer instead of calling them from deeply nested render components.

## Object list and table pages

For Make record list pages, split the page before it becomes a large all-in-one component:

- page shell and route binding
- list toolbar
- CanvasTable host and sizing wrapper
- table column/config builder
- row actions and detail entry
- create/edit/detail Drawer surfaces
- state surfaces for loading, empty, error, forbidden, expired session, not found, and render error
- hooks for object metadata and record loading

`makeui` only defines UI placement and component boundaries. It must not invent business API contracts, auth/session behavior, Service orchestration, persistence, or CanvasTable internals while doing this split.

## Small-change exception

Tiny local edits may stay in the touched component when extracting a module would add more complexity than it removes.

This exception does not apply when the requested change is a new generated POC scaffold, an explicit modularization/refactor, or a change that adds table configuration, form/detail workflows, reusable logic, multiple UI regions, Make field adaptation, or create/edit/detail state. If a small unrelated edit touches a pre-existing file that already mixes responsibilities, do not force a broad split unless the edit worsens that mix; note the follow-up refactor instead.
