# make-app-service 网关记录读取规范

## 背景

线上 App Service 运行时没有 `makecli`，因此任何线上接口都不能通过 `makecli` 获取记录、候选、lookup 或其他业务数据。Service 读取 Make 记录时必须通过 Make gateway 的 Data API，并把请求中的登录态传给 gateway。

## 调整

- `skills/make-app-service/SKILL.md` 新增 hard rules：
  - Make-backed record read APIs 必须通过 Make gateway `/data/v1/record`。
  - Service Make adapter 调 gateway 时必须转发请求登录态，例如 unified-login/cookie 模式下的 `Cookie`，以及宿主合同已有的授权头。
  - 线上 Service runtime 禁止使用 `makecli`、`npx makecli`、本地 makecli 配置或 makecli 输出作为数据源。
- `references/make-data-adapter.md` 明确 record adapter、lookup target record read 和 request wrapper 的 gateway 路径、登录态转发和 makecli 禁用规则。
- `references/service-api-contracts.md` 明确 records 与 lookup option 相关接口的运行时数据来源。
- `references/service-layering.md` 明确 route handler 不得 shell out 到 makecli，runtime adapter 必须使用 gateway/API。
- `references/testing-and-safety.md` 增加测试和安全检查项，覆盖 `/data/v1/record`、登录态转发和禁止 makecli runtime 取数。
- `README.md` 同步更新 `make-app-service` 使用场景说明。

## 边界

- 本次只调整 `make-app-service` 的 Service 数据访问规范。
- 不修改 `makeui`、`canvas-table-integration`、`make-app-auth`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
