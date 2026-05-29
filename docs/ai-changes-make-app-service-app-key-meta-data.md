# make-app-service appKey 与 Meta/Data API 依据更新

## 背景

最新约定中，部署会通过环境变量 `MAKE_APP_KEY` 注入 App key。`apps/service` 后续调用 Make meta 或 data 服务时会使用 `appKey`，多个接口都依赖该值。

Service 与 Make 后端服务交互的接口依据为：

- `https://git.qtech.cn/make/AgenticDSL/-/blob/main/Design/MetaAPIDesign.md?ref_type=heads`
- `https://git.qtech.cn/make/AgenticDSL/-/blob/main/Design/DataAPIDesign.md?ref_type=heads`

## 调整

- 在 `make-app-service` 中明确 `MAKE_APP_KEY` 属于 Service Make adapter 运行时配置。
- 约束 Make-backed Service 缺少 `MAKE_APP_KEY` 时应启动失败，不能在生产生成代码中发明或硬编码 appKey。
- 约束 Make Meta/Data adapter 按 Meta/Data API 文档构造请求，并从标准化 config 中读取 `config.appKey`。
- 约束 route handler 不从 UI query/body/header 接收 appKey。
- 修正 `/api/config` 公共配置示例，不再默认返回 `appKey`。
- 补充测试要求：校验 `MAKE_APP_KEY` 必填、Meta/Data 请求携带配置中的 appKey、`/api/config` 不泄露 appKey。

## 边界

- 本次只修改 `make-app-service` 与总入口 README。
- 不修改 `makeui`、`make-app-auth`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
