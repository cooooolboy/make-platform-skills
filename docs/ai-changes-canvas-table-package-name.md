# canvas-table 包名统一变更记录

## 2026-05-06

- 将 `canvas-table-integration` skill 的包名说明统一为 `@qfei-design/canvas-table`。
- 移除预检和安装命令中对其他包名的可选分支。
- 调整包名选择策略，要求 skill 内部始终使用 `@qfei-design/canvas-table`，遇到消费项目已有不同包名时先停止并询问。
