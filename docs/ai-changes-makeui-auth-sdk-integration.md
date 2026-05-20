# makeui 接入 make-app-auth-sdk 规则更新

## 2026-05-19

- 将 `skills/makeui/SKILL.md` 增加 Make App 认证基线。
- 后续生成 Vibe App 默认依赖 `@qfei/make-app-auth`，并参考 `make-app-auth-sdk/templates/vibe-app`。
- 本地未部署、没有 ngrok 时默认走 `token` 模式，使用 SDK `unifiedLogin:false` 和宿主注入 token。
- 只有显式选择 `unified` 时才启用 Org 统一登录。
- 后端请求统一走 `auth.api` 和 `/api/make/**`，禁止裸 `window.fetch('/api/make/...')` 和手写 `Authorization`。
- 列表无过滤条件时不发送 `filter`，避免生成 `filter: []`。
- 新增 `skills/makeui/references/auth-sdk-integration.md`，沉淀 401、403、退出、token 模式等边界。

## 2026-05-20

- 将 makeui 登录生成规则调整为飞书文档的全量网关方案：`apps/ui -> @qfei/make-app-auth -> /api/make -> make-gateway -> Make Platform`。
- 将 `auth-sdk-integration.md` 明确为登录模块和 Make App 前端运行态数据访问的必读参考。
- 补充本地统一登录调试规则：Vite 固定 `0.0.0.0:5174`，ngrok 只暴露 `5174`，`/api/make` 代理到 `MAKE_GATEWAY_PROXY_TARGET`，默认 `https://dev-make.qtech.cn`。
- 修正 Git 依赖地址为 `git+ssh://git@git.qtech.cn/make/make-app-auth-sdk.git#main`，避免缺少 SSH 用户名导致安装失败。
- 明确浏览器公开配置只允许非密钥值，禁止生成 `VITE_SERVICE_BASE_URL`、Make token、Org token、Cookie 或 `make_app_session` 配置。
- 补充禁止规则：不得裸 `fetch('/api/make/...')`，不得手写 OAuth/token/cookie，不得把 Make 运行态数据默认绕回 `apps/service`。
