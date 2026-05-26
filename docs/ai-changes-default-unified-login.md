# 默认统一登录规则

## 2026-05-26

- 变更摘要：按 skill 渐进披露最佳实践重组 `make-app-auth` 与 `makeui` 引用方式。
- 涉及文件：`skills/make-app-auth/SKILL.md`、`skills/make-app-auth/references/*`、`skills/makeui/SKILL.md`。
- 关键决策：新增 `request-adapter.md` 与 `service-fronted-mode.md`；`make-app-auth/SKILL.md` 只保留导航、模式选择和硬边界；`makeui` 只引用 `make-app-auth`，不承载认证实现细节。
- 验证结果：文本扫描确认 `makeui` 无 SDK 实现细节、默认 token 口径无冲突；`git diff --check` 通过。

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
