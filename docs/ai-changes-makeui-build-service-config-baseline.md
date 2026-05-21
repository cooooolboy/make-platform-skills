# makeui 构建产物与 Service 配置基线

## 2026-05-21

- 将 `skills/makeui` 版本更新为 `0.3.17`。
- 补充前端构建产物规则：Make App 前端打包产物固定为 `apps/ui/dist`，生成或调整 `apps/ui/vite.config.ts` 时应显式配置 `build.outDir: "dist"` 和 `build.emptyOutDir: true`。
- 补充 Service 配置入口规则：新项目默认使用 `apps/service/src/config.ts` 作为集中运行时配置入口；旧项目已有等价配置入口时优先沿用，否则补齐该文件。
- 明确 `makeui` 不负责判断开发、测试、预发、生产环境连接哪个 Make 域名或网关；域名映射、网关路由和密钥注入由后端、运维、Make 工具链或部署态 Service runtime 控制。
- 明确 `apps/service/.env.example` 可暴露空配置项名，但不得写入真实 token，也不得在 `makeui` 中硬编码生产、预发或测试 Make API 域名。

## 2026-05-21 规则保留确认

- 按反馈暂不收窄 gateway/auth-SDK、`/api/make`、token 模式、Make API host、具体 Make 环境变量名和 `make-app-auth` 登录相关规则。
- 继续保留 `makeui` 中已有的认证协作边界，后续如需拆分或迁移到独立 skill 再单独调整。
