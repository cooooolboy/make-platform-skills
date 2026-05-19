# makeui 接入 make-app-auth-sdk 规则更新

## 2026-05-19

- 将 `skills/makeui/SKILL.md` 增加 Make App 认证基线。
- 后续生成 Vibe App 默认依赖 `@qfei/make-app-auth`，并参考 `make-app-auth-sdk/templates/vibe-app`。
- 本地未部署、没有 ngrok 时默认走 `token` 模式，使用 SDK `unifiedLogin:false` 和宿主注入 token。
- 只有显式选择 `unified` 时才启用 Org 统一登录。
- 后端请求统一走 `auth.api` 和 `/api/make/**`，禁止裸 `window.fetch('/api/make/...')` 和手写 `Authorization`。
- 列表无过滤条件时不发送 `filter`，避免生成 `filter: []`。
- 新增 `skills/makeui/references/auth-sdk-integration.md`，沉淀 401、403、退出、token 模式等边界。
