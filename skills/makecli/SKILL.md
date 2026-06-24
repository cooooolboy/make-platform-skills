---
name: makecli
description: "Use when the user asks to manage Make platform resources with makecli — create/deploy apps, entities, relations, records, inspect resources, or run makecli CLI commands. Also triggered by requests like \"部署\", \"apply\", \"查看应用\", \"创建记录\", or \"/makecli\". Does not own DSL schema design (use makedsl), frontend UI (makeui), auth (make-app-auth), Service/API code (make-app-service), runtime packaging (make-app-runtime), OCR integration (make-integration), or canvas-table behavior."
metadata:
  version: 0.2.3
  homepage: https://github.com/qfeius/make-platform-skills
---

# makecli — Make Platform CLI

makecli is the CLI for the Make agentic development platform.
It manages Apps, Entities, Relations, and Records via Meta/Data Services.

## Vibe App Bootstrap

For a new vibe App workspace, start with `makecli app init [appKey]`. The generated `AGENTS.md` is the project navigation file and should drive App Contract collection, skill routing, directory layout, and verification.

Do not create remote resources or run `makecli apply` until the generated App Contract is confirmed. After confirmation, use `makedsl` to write DSL under `apps/dsl/`, then run `makecli diff -f apps/dsl` before any apply.

## Installation

```bash
brew tap qfeius/makecli
brew install makecli
```

## Pre-flight Check

Before executing ANY makecli command, verify the environment:

0. Check `makecli` is installed
   - Missing: run the installation commands above

1. Run `makecli configure verify --output=json` to check token status
   - Not configured or expired: prefer browser OAuth with `makecli login`
   - Do not ask the user to copy a web token into Make App code or skill output

## Decision Tree

```
User request arrives
    |
    +- makecli not installed? --> Installation above
    |
    +- Environment not configured or token expired? --> makecli login / configure env
    |
    +- Create/update schema (app, entity, relation)?
    |   --> Declarative Workflow (preferred)
    |
    +- Delete resource / one-off operation?
    |   --> Imperative Workflow
    |
    +- Query / inspect?
        --> Direct list/get commands
```

## Workflow: Declarative Deployment (Primary)

**When:** Creating or updating schema resources (App, Entity, Relation).
**Why preferred:** Reproducible, diffable, safe (preview before apply).

1. **Write** DSL YAML — invoke the `makedsl` skill for schema reference
2. **Diff:** `makecli diff -f <path>` — preview changes against remote
3. **Confirm** diff output with user
4. **Apply:** `makecli apply -f <path>` — deploy changes
5. **Verify:** `makecli entity list --app <name>` or `makecli relation list --app <name>`

Key rules:
- Semantics: create if new, update if exists
- diff exit code: 0 = no differences, 1 = differences found

## Workflow: Imperative Operations

**When:** Single deletions, operations not supported by apply, or user preference.

Read `@references/cli-reference.md` for exact flag syntax.

Common imperative operations:
```bash
# App
makecli app create [name] [--description <desc>] [--render-name <display>] [-f app.yaml]
makecli app delete <name>
makecli app list [--output json]

# Entity (requires --app)
makecli entity create <name> --app <app> [--json fields.json]
makecli entity delete <name> --app <app>
makecli entity list [<name>] --app <app>

# Relation (requires --app)
makecli relation create <name> --app <app> --json relation.json
makecli relation update <name> --app <app> --json relation.json
makecli relation delete <name> --app <app>
makecli relation list [<name>] --app <app>
```

## Workflow: Environment Configuration

```bash
# Step 1: Login through the browser OAuth flow
makecli login

# Step 2: Select a built-in backend environment when needed
makecli configure set environment dev       # dev | test | production

# Step 3: Override host URLs only for non-preset environments
makecli configure set meta-server-url https://your-make-host.example.com
makecli configure set repo-server-url https://your-repo-host.example.com
makecli configure set auth-server-url https://your-myaccount-host.example.com

# Step 4: Set tenant/operator headers only when the target environment requires them
makecli configure set X-Tenant-ID <tenant>
makecli configure set X-Operator-ID <operator>

# Verify
makecli configure get environment
makecli configure verify
```

**Profiles:** All commands accept `--profile <name>` (default: "default").
**Config files:** `~/.make/credentials` and `~/.make/config` (INI format).
**URL contract:** `meta-server-url` and `repo-server-url` are host origins. The CLI appends `/api/make` automatically and keeps this idempotent if a full URL was already configured.

## Common Patterns

**From zero to deployed app:**
```bash
# 1. Initialize the local App workspace and follow the generated AGENTS.md
makecli app init my-app

# 2. Login if remote diff/apply/deploy is needed
makecli login

# 3. Write DSL under apps/dsl (use makedsl skill)
# 4. Preview schema changes -> apply after user confirms the diff
makecli diff -f apps/dsl
makecli apply -f apps/dsl
makecli entity list --app MyApp

# 5. After code is generated, committed, and build checks pass, deploy code
makecli app deploy                    # default: preview
makecli app deploy --env production   # requires explicit confirmation
```

**Inspect remote state:**
```bash
makecli app list
makecli entity list --app <app>
makecli entity list <entity-name> --app <app>    # detail view with fields
makecli relation list --app <app>
```

**Initialize local App workspace in a project directory:**
```bash
makecli app init [appKey]    # creates CLAUDE.md, AGENTS.md, apps/dsl/app.yaml, .gitignore
```

**Self-update:**
```bash
makecli update
makecli version
```

## Anti-Patterns

- **Don't skip diff before apply.** Always preview changes first.
- **Don't use imperative commands for bulk schema setup.** Use YAML + apply instead.
- **Don't guess CLI flags.** Read `@references/cli-reference.md` if unsure.
- **Don't make manual token copy the default path.** Use `makecli login`; `configure token` is a legacy/manual fallback only.
- **Don't put `/api/make` into generated App code because makecli config has it.** CLI config owns host origins; App browser requests still follow the app auth/service contract.
- **Don't write DSL YAML from memory.** Invoke the `makedsl` skill for schema reference.
