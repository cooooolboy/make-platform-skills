# Skill 边界一致性复查

## 背景

本次复查只覆盖 `makeui`、`canvas-table-integration`、`make-app-filter`、`make-app-service`、`make-app-runtime`。`make-app-auth`、`makecli`、`makedsl`、`make-integration` 按要求暂不处理。

## 调整

- 收窄 `make-app-runtime` 的 `config.ts` 描述：runtime 只负责配置入口位置、端口、构建和发布契约；Make adapter 环境变量语义归 `make-app-service`。
- 统一 `makeui`、`canvas-table-integration`、`make-app-filter` 中人员/部门候选接口描述：默认是 UI-Service 合同，遇到宿主已有等价路由时遵循宿主合同。

## 边界

- 未修改 `make-app-auth`、`makecli`、`makedsl`、`make-integration`。
- 未改变 UI 布局、CanvasTable 字段渲染、高级筛选交互、Service API 默认合同或 runtime 构建产物规则。
