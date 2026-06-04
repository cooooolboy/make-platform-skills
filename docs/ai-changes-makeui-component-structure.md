# makeui 组件化拆分规范

## 背景

Make App 前端页面如果把路由、数据加载、字段适配、表格配置、表单映射、抽屉状态和渲染细节都写在一个文件里，后续维护和复用成本会快速上升。`makeui` 需要把组件化拆分和模块化边界作为明确规范。

## 调整

- `skills/makeui/SKILL.md` 新增 hard rule：生成或修改 `apps/ui` 时必须按职责进行组件化拆分和模块化组织。
- `skills/makeui/SKILL.md` frontmatter description 补充“组件化拆分”“模块化拆分”触发词，便于中文请求命中 `makeui`。
- 明确页面级文件只负责路由级编排、路由参数读取、模块组合和少量页面状态衔接。
- 明确禁止单文件堆逻辑：不能把数据请求、字段归一化、表格列配置、表单映射、抽屉状态、行操作和渲染细节全部写在一个页面组件里。
- 新增 `skills/makeui/references/component-structure.md`，补充推荐目录分层、路由页职责、feature 模块职责、表格页拆分要求和极小改动例外。
- `skills/makeui/SKILL.md` 的 topic reference map 新增组件结构 reference 入口。
- `skills/makeui/SKILL.md` revision 更新为 `0.3.36`。

## 边界

- 本次只调整 `makeui` 的前端组件化和模块化规范。
- 不修改 `expensePoc` 或其他 Make App 业务代码。
- 不修改 `canvas-table-integration`、`make-app-auth`、`make-app-service`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
