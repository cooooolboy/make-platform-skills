# 默认统一登录规则

## 2026-05-26

- 变更摘要：将 Make App 生成规则的默认认证模式调整为统一登录。
- 涉及文件：`skills/make-app-auth/*`、`skills/makeui/SKILL.md`、`skills/makeui/references/principles.md`。
- 关键决策：新生成/发布的 App 默认使用 `unifiedLogin: true`、`apiAuthRedirect: true` 和 `auth.init({ redirect: true })`；token 模式仅作为显式本地调试例外。
- 验证结果：文本扫描确认旧的 token 默认口径已移除；`git diff --check` 通过。
