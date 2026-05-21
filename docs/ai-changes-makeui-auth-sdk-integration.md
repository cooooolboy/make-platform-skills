# makeui 接入 make-app-auth-sdk 规则更新

## 2026-05-21

- 将生成规则的 SDK 依赖最低版本提升到 `@qfeius/make-app-auth@^0.1.1`，避免新 App 拉取仍带旧退出语义的版本。
- 收口 browser-first Vibe App 数据流：`apps/ui` 通过 `auth.api('/api/make/**')` 访问 make-gateway；如未来生成 `apps/service` 后端，需要单独设计服务端委托鉴权，不混用浏览器 SDK 规则。
- 退出链路最终口径：SDK 只跟随网关返回的 App `redirectUri`，退出后由下一次 `auth.init({ redirect: true })` 判断是否进入 Org 登录页。
- SDK 依赖名从 `@qfei/make-app-auth` 调整为公共 npm 包 `@qfeius/make-app-auth`，生成 App 默认使用 npm 版本依赖。
- 修正认证配置边界：`gatewayBaseUrl` 只是 Make API 网关入口，不是统一登录地址；已发布 App 默认使用 SDK 的同源 `/api/make`。
- 统一登录正式模式明确不传 `accessToken`、`token` 或 `tokenProvider`，登录成功后依赖 make-gateway 写入的 App session Cookie。
- 本地 token 模式仍可使用 SDK 自动补 `Authorization`，但业务代码必须走 `auth.api` 相对路径，SDK 只会向配置的 Make 网关地址发送 token。
- 统一登录 challenge 地址由 make-gateway 返回；退出只使用网关返回的 App `redirectUri`，makeui / App UI 不配置、不拼接、不改写账号中心或 Org logout 地址。

## 2026-05-20 19:43

- 解决 `skills/makeui/SKILL.md` 合并冲突：保留 `apps/service` 必须存在、workspace package 基线，以及宿主数据流不可静默切换的规则。
- 将认证实现细节统一收口到独立 `make-app-auth` skill，`makeui` 仅保留认证协作边界，不再引用已删除的 `references/auth-sdk-integration.md`。
- 同步修正 `skills/makeui/references/principles.md` 中的旧引用，避免提交后出现断链。
- 修复 `skills/make-app-auth/references/sdk-integration.md` 中缺少 SSH 用户名的 Git 依赖示例。

## 2026-05-20 18:05

- 修正统一登录分支生成规则：authenticated App shell 必须在 header 露出 `退出账号` 操作，避免测试人员无法重新进入验证码登录流程。
- 收口 logout 职责：`makeui` 只渲染退出入口并调用 `auth.logout()`，不得在 UI 里拼接或重写 Org/account-center logout URL。
- 更新 `make-app-auth` 指南：SDK 不再兼容旧 `orgSsoLogoutUrl`，退出后只跟随网关返回的 App `redirectUri`，再由 `auth.init({ redirect: true })` 复用正常登录判断。
- 排障标准新增：若退出后停在 `token不能为空`，优先判断 App 绕过 SDK 或 SDK 版本过旧。

## 2026-05-20

- 规范化 `skills/make-app-auth` 为独立 skill 入口：补齐 Scope、Default Behavior、Hard Rules、Pre-flight Workflow、Reference Selection 和与 `makeui` 的协作边界。
- 收敛 references 为可执行手册：本地 token、统一登录、SDK 集成、401/logout、troubleshooting 分别负责不同场景，避免 `makeui` 重复沉淀认证细节。
- 更新 `README.md` 的可用 Skill 列表，补齐此前遗漏的 `skills/makeui` 和 `make-app-auth` 说明、升级命令与使用场景。
- 新增独立 `skills/make-app-auth` skill，负责 `@qfeius/make-app-auth` SDK、token 模式、统一登录模式、401/403、logout 和排障。
- `makeui` 不再内置大段认证细节，改为强依赖 `make-app-auth`；生成 Make App UI 时仍禁止手写 OAuth、Cookie、Authorization、logout 和裸 `/api/make` 请求。
- 普通本地开发默认 `token/no-unified-login` 模式，不要求 ngrok、Org 回调白名单或浏览器 OAuth。
- 统一登录仅作为专项测试模式，适用于 OAuth、SSO、Cookie、logout、redirect callback 等链路验证。
- 新增 `local-token-mode.md`、`unified-login-mode.md`、`logout-and-401.md`、`troubleshooting.md`，分别沉淀本地调试、统一登录测试、401/logout 处理和排障流程。

## 2026-05-19

- 将 `skills/makeui/SKILL.md` 增加 Make App 认证基线。
- 后续生成 Vibe App 默认依赖 `@qfeius/make-app-auth`，并参考 `make-app-auth-sdk/templates/vibe-app`。
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
