---
name: makecli
description: "Use when the user asks to manage Make platform resources — create/deploy apps, entities, relations, records, log in to Make, or use makecli CLI commands. Also triggered by requests like \"部署\", \"apply\", \"查看应用\", \"创建记录\", \"登录 Make\", or \"/makecli\"."
version: 0.3.0
metadata:
  homepage: https://github.com/qfeius/make-platform-skills
---

# makecli — Make Platform CLI

makecli is the CLI for the Make agentic development platform.
It manages Apps, Entities, Relations, Records, and code deployment. Documents makecli **v0.5.3+**.

## Installation

```bash
brew tap qfeius/makecli
brew install makecli
makecli update          # self-update + sync Make platform skills
```

## Pre-flight Check

Before executing ANY makecli command, verify the environment:

0. Check `makecli` is installed — missing: run the installation above
1. Run `makecli configure verify --output=json` to check token status
   - Not configured / expired: user must run `makecli login` (browser OAuth)
   - **INTERACTIVE** (opens browser, blocks) — instruct user to run it themselves via the `!` shell prefix (supported by Claude Code and Codex)
   - Fallback for manual tokens: `makecli configure token` (also interactive, via `!`)

Environment defaults to `production`. Switch with `makecli configure set environment dev|test` or per-call `--env`.

## Decision Tree

```
User request arrives
    |
    +- makecli not installed / not logged in? --> Pre-flight Check above
    |
    +- New app project? --> app init (local scaffold) / app create (scaffold + register)
    |
    +- Create/update schema (entity, relation)?
    |   --> Declarative Workflow (preferred)
    |
    +- Publish code? --> Deploy Workflow
    |
    +- Data CRUD? --> record commands
    |
    +- Delete resource / one-off operation? --> Imperative Workflow
    |
    +- Query / inspect? --> list/get/schema commands
```

## Workflow: Declarative Schema (Primary)

**When:** Creating or updating schema resources (App, Entity, Relation).
**Why preferred:** Reproducible, diffable, safe (preview before apply).

1. **Write** DSL YAML under `apps/dsl/` — invoke the `makedsl` skill for schema reference
2. **Diff:** `makecli diff -f apps/dsl` — preview changes against remote
3. **Confirm** diff output with user
4. **Apply:** `makecli apply -f apps/dsl`
5. **Verify:** `makecli diff -f apps/dsl` (exit 0) or `makecli schema --app <appKey>`

Key rules:
- Entity/Relation: create if new, update if exists. **App is create-only — apply never updates an existing App**
- diff exit code: 0 = no differences, 1 = differences found
- Directory scan recurses into immediate subdirs by default (`--max-depth 2`, shared by diff/apply)

## Workflow: Deploy Code

```bash
makecli preflight                      # validate layout (--app-type fullstack|service|ui)
git add -A && git commit -m "..."      # deploy pushes committed HEAD; dirty worktree is refused
makecli app deploy                     # --env defaults to preview
makecli app deploy --env production    # prompts confirmation — needs user consent (--yes to skip)
```

Deploy reads the app key from `apps/dsl/app.yaml` and refuses apps never registered via `app create`.

## Workflow: Imperative Operations

**When:** Single deletions, data CRUD, or operations not covered by apply.

Read `@references/cli-reference.md` for exact flag syntax and JSON file formats.

```bash
# App
makecli app create <appKey> [--name <display>] [--description <desc>] [--dry-run]
makecli app delete <key> --yes            # confirmation prompt without --yes
makecli app list [--filter "name=待办,key=todo"] [--output json]

# Entity / Relation (require --app)
makecli entity create <key> --app <app> [--name <display>] [--json props.json] [--dry-run]
makecli entity list [<key>] --app <app>
makecli relation create <key> --app <app> --json rel.json [--dry-run]

# Record (require --app + --entity; JSON = flat field map)
makecli record create --app <app> --entity <entity> --json data.json [--dry-run]
makecli record list --app <app> --entity <entity> --filter "status in ['todo'] && owner == _currentUser"
makecli record update <id> [id...] --app <app> --entity <entity> --json data.json
makecli record delete <id> [id...] --app <app> --entity <entity>
```

All create commands accept `--dry-run` — server validates without persisting.

## Environment Configuration

```bash
! makecli login                                  # browser OAuth (INTERACTIVE)
makecli configure set environment test           # dev|test|production (global)
makecli configure set meta-server-url <host>     # host only, /api/make auto-added
makecli configure --sample                       # print full config reference
makecli configure resolve --target local-preview # offline JSON for local-preview tooling
```

**Profiles:** All commands accept `--profile <name>` (default: "default").
**Config files:** `~/.make/credentials` and `~/.make/config` (INI format).

## Common Patterns

**From zero to deployed app:**
```bash
! makecli login                                   # 1. Authenticate (user runs via !)
makecli app create shop --name "我的商城"          # 2. Scaffold + register + initial commit
cd shop                                           # 3. Write DSL (makedsl skill) under apps/dsl/
makecli diff -f apps/dsl && makecli apply -f apps/dsl
git add -A && git commit -m "feat: initial app"   # 4. Develop, then commit
makecli app deploy                                # 5. Deploy to preview
```

**Inspect remote state:**
```bash
makecli app list --filter "key=shop"
makecli entity list --app <app>
makecli entity list <key> --app <app>     # detail view: fields + unique constraints
makecli schema --app <app>                # aggregated app + entities + relations
```

## Anti-Patterns

- **Don't skip diff before apply.** Always preview changes first.
- **Don't use imperative commands for bulk schema setup.** Use YAML + apply instead.
- **Don't guess CLI flags.** Read `@references/cli-reference.md` if unsure.
- **Don't run interactive commands via Bash tool.** `login`, `configure token`, `configure config` block on user input — tell user to run via `!`.
- **Don't pass `--yes` to `app delete` or `app deploy --env production` without explicit user consent.** These flags skip safety confirmations.
- **Don't deploy with a dirty worktree.** `app deploy` pushes committed HEAD only — commit first, it never auto-commits.
- **Don't write DSL YAML from memory.** Invoke the `makedsl` skill for schema reference.
