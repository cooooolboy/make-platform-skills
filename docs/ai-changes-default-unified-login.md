# 默认统一登录规则

## 2026-05-26

- 变更摘要：按职责边界收敛 `makeui` 认证规则，避免把 SDK 版本、401/403、logout 等实现细节写入 UI skill 根文件。
- 涉及文件：`skills/makeui/SKILL.md`、`skills/makeui/references/principles.md`。
- 关键决策：`makeui` 只保留数据流和 Service-fronted unified-login 边界；具体统一登录、token 模式、请求适配器和退出行为继续由 `make-app-auth` 负责。
- 验证结果：文本扫描确认 `makeui` 未保留 SDK 版本、`apiAuthRedirect`、401/403、logout 细节；`git diff --check` 通过。

## 2026-05-26

- 变更摘要：将 Make App 生成规则的默认认证模式调整为统一登录。
- 涉及文件：`skills/make-app-auth/*`、`skills/makeui/SKILL.md`、`skills/makeui/references/principles.md`。
- 关键决策：新生成/发布的 App 默认使用 `unifiedLogin: true`、`apiAuthRedirect: true` 和 `auth.init({ redirect: true })`；token 模式仅作为显式本地调试例外。
- 验证结果：文本扫描确认旧的 token 默认口径已移除；`git diff --check` 通过。
