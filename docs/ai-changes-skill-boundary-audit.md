# Skill 边界一致性复查

## 2026-06-24 makecli 登录与发布引导同步

- 变更摘要：按本地 makecli 代码同步 Vibe App 生成链路中的 CLI 认证、环境配置和代码发布口径。
- 涉及文件/模块：`README.md`、`skills/makecli`、`skills/make-integration`、`skills/make-app-auth`。
- 关键逻辑/决策：默认认证改为 `makecli login` 浏览器 OAuth；`meta-server-url`/`repo-server-url` 只写 host，CLI 自动补 `/api/make`；代码发布使用 `makecli app deploy`，默认 preview，production 显式确认。
- 验证：auth contract 测试、service-fronted 示例审计、示例 `tsc --noEmit` 通过；`makecli`/`make-integration` 因保留项目 `version` 字段不通过官方 quick_validate。

## 2026-06-24 make-app-auth 示例 TypeScript 配置

- 变更摘要：为 `make-app-auth` 的 `service-fronted-node` 示例补充 TypeScript 工程配置和本地声明。
- 涉及文件/模块：`skills/make-app-auth/examples/service-fronted-node/tsconfig.json`、`types/*.d.ts`、`apps/ui/src/auth.ts`。
- 关键逻辑/决策：示例启用 `ES2020` 与 `DOM` lib，补齐 `@qfeius/make-app-auth` 示例声明和 `process.env` 声明，避免 IDEA 将散落 `.ts` 按缺省上下文误报。
- 验证：service-fronted 示例 `tsc --noEmit` 和 auth audit 通过，`git diff --check` 通过。

## 2026-06-24 makecli / makedsl skill 版本字段恢复

- 变更摘要：恢复 `makecli`、`makedsl` 顶层 `version` 字段，并按原 `0.2.0` 升级为 `0.2.1`。
- 涉及文件/模块：`skills/makecli/SKILL.md`、`skills/makedsl/SKILL.md`。
- 关键逻辑/决策：项目 skill 仍保留顶层版本管理；本次只恢复前序误删字段，不调整 description、metadata 或正文。
- 验证：确认两个 skill frontmatter 已包含 `version: 0.2.1`。

## 2026-06-24 Make App 统一登录与发布路径复核

- 变更摘要：收口 Make App 生成类 skill 的统一登录、Service-fronted 路由和候选接口契约。
- 涉及文件/模块：`skills/make-app-auth`、`skills/make-app-service`、`skills/makeui`、`skills/make-app-filter`、`skills/canvas-table-integration`。
- 关键逻辑/决策：生成 App 只走统一登录；Service-fronted 发布路径固定为 `/api/make/auth|oauth|app/**`；人员/部门候选接口固定为 `/api/make/app/users`、`/api/make/app/departments`。
- 验证：`node skills/make-app-auth/scripts/test-audit-auth-contract.mjs` 和 service-fronted 示例 audit 均通过。

## 背景

本次复查只覆盖 `makeui`、`canvas-table-integration`、`make-app-filter`、`make-app-service`、`make-app-runtime`。`make-app-auth`、`makecli`、`makedsl`、`make-integration` 按要求暂不处理。

## 调整

- 收窄 `make-app-runtime` 的 `config.ts` 描述：runtime 只负责配置入口位置、端口、构建和发布契约；Make adapter 环境变量语义归 `make-app-service`。
- 统一 `makeui`、`canvas-table-integration`、`make-app-filter` 中人员/部门候选接口描述：默认是 UI-Service 合同，遇到宿主已有等价路由时遵循宿主合同。

## 边界

- 未修改 `make-app-auth`、`makecli`、`makedsl`、`make-integration`。
- 未改变 UI 布局、CanvasTable 字段渲染、高级筛选交互、Service API 默认合同或 runtime 构建产物规则。
