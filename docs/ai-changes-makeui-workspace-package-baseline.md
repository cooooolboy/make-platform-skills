# makeui workspace package 基线修复

## 背景

- 旧项目重构到 `apps/` 结构时，存在只移动 `apps/ui`、`apps/service` 目录，但没有补齐各自 `package.json` 的风险。
- `apps/package.json` 中的 `pnpm --filter service`、`pnpm --filter ui` 依赖 `apps/service` 和 `apps/ui` 是独立 workspace package；缺少子包 `package.json` 时 filter 没有目标。
- K8s 独立发布 UI 和 Service 时，`apps/ui/package.json` 与 `apps/service/package.json` 是各自构建入口，不能只依赖 `apps/package.json`。

## 变更

- 将 `skills/makeui/SKILL.md` 版本更新到 `0.3.15`。
- 新增 `Workspace package baseline`，要求重构或生成 `apps/` 项目时补齐：
  - `apps/package.json`
  - `apps/pnpm-workspace.yaml`
  - `apps/ui/package.json`
  - `apps/service/package.json`
- 明确 `apps/pnpm-workspace.yaml` 必须包含 `ui`、`service`、`packages/*`，`apps/service` 是目标结构的必需 workspace package。
- 明确 `apps/package.json` 的 `app:ui`、`app:service`、`dev` 脚本要使用能命中真实 package name 的 `pnpm --filter`，包括 scoped package name。
- 增加旧项目重构完成条件：不能只移动源码目录，必须补齐 package manifest、workspace 配置、脚本和 Node engine。
- 统一数据流选择规则：保留宿主项目声明的 UI -> Service -> Make API；auth-SDK gateway 规则只用于无 UI -> Service 运行态数据编排要求的统一登录 Make App，不能静默互相替换；`apps/service` 仍是必需项目结构。

## 验证

- 使用 `rg` 检查 `makeui` 中 `apps/service`、`VITE_SERVICE_BASE_URL`、`workspace package baseline`、`package.json` 等关键规则。
- 使用 `git diff --check` 检查补丁格式。
