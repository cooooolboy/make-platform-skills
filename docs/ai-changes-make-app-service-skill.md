# make-app-service skill 新增

## 背景

当前项目结构主要分为 `apps/ui` 和 `apps/service`。已有 `makeui` 约束 UI 展示，`make-app-runtime` 约束打包发布和 Service 运行态，但缺少专门约束 `apps/service` API、UI-Service 合同和 Make Data API adapter 的 skill。

## 本次调整

- 新增 `skills/make-app-service/SKILL.md`，定义 Service API、薄编排、错误处理、日志、测试和边界职责。
- 新增 `references/service-api-contracts.md`，沉淀 schema、records、candidate、lookup、file 等默认接口合同。
- 新增 `references/service-layering.md`，约束 `apps/service/src` 分层、route handler、error mapping、日志和安全边界。
- 新增 `references/make-data-adapter.md`，约束 Make Data API adapter、schema、record、user/department、lookup、file 等适配规则。
- 新增 `references/testing-and-safety.md`，补充 Service 接口测试和提交前安全检查。
- 更新根 `README.md` 的 Skill 路由总览和可用 Skill 列表，让 Service 接口相关问题进入 `make-app-service`。
- 补充 Service Make adapter 运行时配置规范：`apps/service/src/config.ts` 优先读取 `MAKE_API_BASE_URL`，`MAKE_SERVER_URL` 仅作兼容别名；缺少 Make base URL 时配置加载失败；`MAKE_AUTH_BASE_URL`、`MAKE_BUSINESS_BASE_URL` 和 `MAKE_SCHEMA_PATH` 用于覆盖对应 adapter 路径，不在 skill 中写死具体环境域名。
- 明确 `config.ts` 中端口/构建/发布契约仍由 `make-app-runtime` 负责，`make-app-service` 只约束 Make adapter 配置语义。

## 边界

- `make-app-service` 不负责 UI 布局，UI 仍交给 `makeui`。
- `make-app-service` 不负责认证实现，统一登录、cookie、session、401/403 仍交给 `make-app-auth`。
- `make-app-service` 不负责端口、`dist/server.js`、package scripts、镜像入口和发布检查，这些仍交给 `make-app-runtime`。
- `make-app-service` 不负责 DSL 建模、Make CLI 部署或 CanvasTable 渲染。
- Service adapter 只消费已有认证或运行态上下文，不在本 skill 中定义 auth/session 转发或发布代理契约。
