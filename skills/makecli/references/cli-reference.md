# makecli CLI Reference

## Global Flags

| Flag | Description | Default |
|------|-------------|---------|
| `--env` | Backend environment preset: `dev`, `test`, or `production` | `[settings] environment` or `dev` |
| `--meta-server-url` | Meta/Data gateway host origin. CLI appends `/api/make` automatically | profile config or env preset |
| `--repo-server-url` | Code repository service host origin. CLI appends `/api/make` automatically | profile config or env preset |
| `--profile` | Credentials/config profile | `default` |

URL values are host origins such as `https://dev-make.qtech.cn`. If a user already configured a full URL ending in `/api/make`, the CLI keeps it idempotent and does not append the prefix twice.

---

## login

```
makecli login [--timeout <duration>] [--no-open-browser] [--profile <name>] [--env dev|test|production]
```

Browser OAuth login. The command discovers the active environment's auth server, registers a temporary public client, opens the browser, receives the loopback callback, exchanges the code, and saves the access token to `~/.make/credentials`.

Use this as the default authentication path. Do not ask users to copy web tokens into generated App code.

## configure

Manages credentials (`~/.make/credentials`) and config (`~/.make/config`). Prefer `makecli login` for credentials. Use `configure` for environment, host overrides, tenant/operator headers, or emergency/manual token setup.

### configure token

```
makecli configure token [--profile <name>]
```

Legacy/manual token prompt. Masked input. Empty input preserves current value.

Do not use this as the normal Vibe App path; prefer `makecli login`.

### configure config

```
makecli configure config [--profile <name>]
```

Interactive prompts for profile config values: `meta-server-url`, `repo-server-url`, `auth-server-url`, `X-Tenant-ID`, and `X-Operator-ID`.

**INTERACTIVE** — cannot be run by agent. User must run via `!`.

### configure set

```
makecli configure set <key> <value> [--profile <name>]
```

Non-interactive. Valid profile keys: `meta-server-url`, `repo-server-url`, `auth-server-url`, `X-Tenant-ID`, `X-Operator-ID`.

Special global key:

```
makecli configure set environment dev|test|production
```

### configure get

```
makecli configure get <key> [--profile <name>]
```

Reads a single config value. Supports the profile keys above and global `environment`.

### configure verify

```
makecli configure verify [--output table|json] [--profile <name>]
```

Verify that the current profile has a valid token for the selected environment. If it fails, run `makecli login` for that profile/env.

---

## app

### app create

```
makecli app create [name] [--description <value>] [--render-name <value>] [-f <path>] [--profile <name>]
```

- `name`: positional (optional if using `-f`)
- `--description`: app description
- `--render-name`: app display name (defaults to name)
- `-f, --file`: path to YAML file containing Make.App resource

### app list

```
makecli app list [--page <n>] [--size <n>] [--output table|json] [--profile <name>]
```

- Table columns: NAME, CODE, VERSION
- Footer: `Showing X of Y apps`

### app init

```
makecli app init [appKey]
```

- Optional `appKey` also acts as the target directory. Without it, the current directory name is used.
- Writes local scaffold files such as `CLAUDE.md`, `AGENTS.md`, `apps/dsl/app.yaml`, and `.gitignore`.
- Idempotent for existing files and initializes git when needed. It does not create remote resources or commit.

### app delete

```
makecli app delete <name> [--profile <name>]
```

### app deploy

```
makecli app deploy [--env preview|production] [--yes] [--force] [--profile <name>]
```

- Default target is `preview`.
- `production` requires explicit confirmation unless `--yes` is supplied in a non-interactive flow.
- Must run from the App project root with `apps/dsl/app.yaml`.
- Requires a clean git worktree and at least one commit.
- Verifies the App exists in Meta before preparing repositories and pushing code.

---

## entity

All subcommands require `--app <app-name>`.

### entity create

```
makecli entity create <name> --app <app> [--json <path>] [--profile <name>]
```

- `--json`: path to JSON file with fields array (optional)
- JSON format:
  ```json
  [
    {
      "name": "fieldName",
      "type": "string",
      "meta": {},
      "properties": {},
      "validations": {}
    }
  ]
  ```
- Field names cannot start with `_`

### entity list

```
makecli entity list [<entity-name>] --app <app> [--page <n>] [--size <n>] [--output table|json] [--profile <name>]
```

- Without entity-name: list view (NAME, VERSION columns)
- With entity-name: detail view (Name, App, Version + Fields table: NAME, TYPE)

### entity delete

```
makecli entity delete <name> --app <app> [--profile <name>]
```

---

## relation

All subcommands require `--app <app-name>`.

### relation create

```
makecli relation create <name> --app <app> --json <path> [--profile <name>]
```

- `--json`: required, JSON file with relation definition
- JSON format:
  ```json
  {
    "from": { "entity": "EntityA", "cardinality": "one" },
    "to": { "entity": "EntityB", "cardinality": "many" }
  }
  ```
- Cardinality values: `"one"` or `"many"`

### relation update

```
makecli relation update <name> --app <app> --json <path> [--profile <name>]
```

Same JSON format as create.

### relation list

```
makecli relation list [<relation-name>] --app <app> [--page <n>] [--size <n>] [--output table|json] [--profile <name>]
```

- Without name: list view (NAME, FROM, TO, VERSION). From/To format: `Entity(cardinality)`
- With name: detail view (Name, App, Version, From details, To details)

### relation delete

```
makecli relation delete <name> --app <app> [--profile <name>]
```

---

## schema

```
makecli schema --app <app> [--profile <name>]
```

Get aggregated schema for an app (app + entities + relations in one view).

- `--app`: required, app name
- Output: complete schema definition including all entities and relations

---

## apply

```
makecli apply -f <path> [--profile <name>]
```

Batch apply resources from YAML files (create-or-update semantics).

- `-f, --file`: required, path to YAML file or directory
- **File input:** reads all YAML documents (separated by `---`)
- **Directory input:** scans one level for `.yaml`/`.yml` files, skips dotfiles
- **Processing order:** App -> Entity -> Relation (auto-sorted regardless of file order)
- **Semantics:**
  - App: create if not exists, skip if exists (no update)
  - Entity: create if not exists, update if exists
  - Relation: create if not exists, update if exists
- **Output:** per resource `<Type> '<name>' <action>`, summary `Applied <count> resources successfully`
- **Error:** stops on first error with context

---

## diff

```
makecli diff -f <path> [--output table|json] [--profile <name>]
```

Compare local DSL YAML with remote Meta Server definitions.

- `-f, --file`: required, path to YAML file or directory
- **App inference:** Make.App name > first entity's app > first relation's app
- **Diff statuses:** `added` (local only), `removed` (remote only), `changed` (both, differ), `unchanged`
- **Table output:**
  ```
  App: AppName

  Entities:
    ~ EntityName
      + fieldName: type (only in local)
      - fieldName: type (only on server)
    + NewEntity (only in local)
    - OldEntity (only on server)

  Relations:
    ~ RelationName
      from: Entity(card) -> Entity(card)

  Summary: X changed, Y added, Z removed, W unchanged
  ```
- **Exit codes:** 0 = no differences, 1 = differences found

---

## update

```
makecli update
```

Self-update to latest version from GitHub Releases. No flags.

---

## version

```
makecli version
```

Display version: `makecli version X.Y.Z (build-date)`.
