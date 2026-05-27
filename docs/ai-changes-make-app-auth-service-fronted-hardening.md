# Make App Auth Service-Fronted Hardening

## 2026-05-27

- 变更摘要：清理 public skill 文档中的内部 Git 依赖示例，并修复 troubleshooting 中 Service 内部 auth 代理路径。
- 涉及文件/模块：`skills/make-app-auth/references/sdk-integration.md`、`skills/make-app-auth/references/troubleshooting.md`。
- 关键逻辑/决策：公开文档只保留 npm 安装方式；Service 内部访问 make-gateway 统一使用不带 `/api` 前缀的 `/make/auth/**`。
- 验证结果：`test-audit-auth-contract`、service-fronted 示例审计、关键字回归检索与 `git diff --check` 通过。

- 变更摘要：收敛 Make App service-fronted 示例与审计规则，修复内部访问 make-gateway 误带 `/api` 前缀和 `X-Forwarded-Host` 可被客户端透传的问题。
- 涉及文件/模块：`skills/make-app-auth/SKILL.md`、`references/service-fronted-mode.md`、`references/request-adapter.md`、`examples/service-fronted-node`、`scripts/audit-auth-contract.mjs`。
- 关键逻辑/决策：浏览器外部访问仍走 `/api/make/**`，Service 在 k8s 内部访问 make-gateway 改为 `http://make-gateway/make/auth|meta|data/**`。
- 关键逻辑/决策：Service 统一从入站 `Host` 派生 `X-Forwarded-Host`，不再复制客户端传入的 `X-Forwarded-Host`；本地 `localhost:port` 会按 http 处理。
- 验证结果：`node skills/make-app-auth/scripts/test-audit-auth-contract.mjs`、`node skills/make-app-auth/scripts/audit-auth-contract.mjs skills/make-app-auth/examples/service-fronted-node --mode service-fronted --published` 与 `git diff --check` 通过。
