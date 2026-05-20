# makeui 接入 make-app-auth-sdk 规则更新

## 2026-05-20 18:05

- 修正统一登录分支生成规则：authenticated App shell 必须在 header 露出 `退出账号` 操作，避免测试人员无法重新进入验证码登录流程。
- 收口 logout 职责：`makeui` 只渲染退出入口并调用 `auth.logout()`，不得在 UI 里拼接或重写 Org/account-center logout URL。
- 更新 `make-app-auth` 指南：SDK 负责处理旧 dev gateway 返回 `dev-make-console/api/org/public/sso/logout` 导致 `token不能为空` 的兼容跳转。
- 排障标准新增：若退出后停在 `token不能为空`，优先判断 App 绕过 SDK 或 SDK 版本过旧。

## 2026-05-20

- 规范化 `skills/make-app-auth` 为独立 skill 入口：补齐 Scope、Default Behavior、Hard Rules、Pre-flight Workflow、Reference Selection 和与 `makeui` 的协作边界。
- 收敛 references 为可执行手册：本地 token、统一登录、SDK 集成、401/logout、troubleshooting 分别负责不同场景，避免 `makeui` 重复沉淀认证细节。
- 更新 `README.md` 的可用 Skill 列表，补齐此前遗漏的 `skills/makeui` 和 `make-app-auth` 说明、升级命令与使用场景。
- 新增独立 `skills/make-app-auth` skill，负责 `@qfei/make-app-auth` SDK、token 模式、统一登录模式、401/403、logout 和排障。
- `makeui` 不再内置大段认证细节，改为强依赖 `make-app-auth`；生成 Make App UI 时仍禁止手写 OAuth、Cookie、Authorization、logout 和裸 `/api/make` 请求。
- 普通本地开发默认 `token/no-unified-login` 模式，不要求 ngrok、Org 回调白名单或浏览器 OAuth。
- 统一登录仅作为专项测试模式，适用于 OAuth、SSO、Cookie、logout、redirect callback 等链路验证。
- 新增 `local-token-mode.md`、`unified-login-mode.md`、`logout-and-401.md`、`troubleshooting.md`，分别沉淀本地调试、统一登录测试、401/logout 处理和排障流程。

## 2026-05-19

- 将 `skills/makeui/SKILL.md` 增加 Make App 认证基线。
- 后续生成 Vibe App 默认依赖 `@qfei/make-app-auth`，并参考 `make-app-auth-sdk/templates/vibe-app`。
- 本地未部署、没有 ngrok 时默认走 `token` 模式，使用 SDK `unifiedLogin:false` 和宿主注入 token。
- 只有显式选择 `unified` 时才启用 Org 统一登录。
- 后端请求统一走 `auth.api` 和 `/api/make/**`，禁止裸 `window.fetch('/api/make/...')` 和手写 `Authorization`。
- 列表无过滤条件时不发送 `filter`，避免生成 `filter: []`。
- 新增 `skills/makeui/references/auth-sdk-integration.md`，沉淀 401、403、退出、token 模式等边界。
