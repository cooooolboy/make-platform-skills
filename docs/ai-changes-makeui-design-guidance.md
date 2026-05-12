# makeui 公用 UI Skill 设计更新

## 背景

本次更新面向 Make 使用 AI 通过自然语言生成 App 前端的场景，明确 `makeui` 只负责通用 UI 设计能力：排版布局、视觉样式、按钮摆放、轻量页面交互和响应式规则。

## 主要变更

- 将 `skills/makeui/SKILL.md` 从模板空壳改为可执行的总入口说明。
- 默认前端技术栈调整为 `React + Vite + React Router`，移除旧的错误技术栈描述。
- 新增 Node 运行时要求：最低 `>=22.12.0`，新项目推荐当前活跃 LTS；本次更新时默认推荐 Node.js 24 LTS，并要求新项目写入 `package.json` 的 `engines.node`。
- 明确组件库和样式方案不强制；新项目可让用户选择组件库，默认推荐 Ant Design，可选 Arco Design、TDesign；样式无指定时可默认 Less。
- 明确列表页默认没有视图概念，不生成视图 Tab、视图下拉、看板或分屏入口。
- 明确列表页默认只包含搜索、刷新、新建；筛选、分组、排序、列设置、导入、导出仅在用户明确要求时添加。
- 明确新建、编辑、详情默认使用右侧 Drawer，默认宽度 `75%`；只有用户要求独立页面或路由时才使用页面路由。
- 新增 references，分别沉淀原则、应用外壳、列表页、Drawer、路由页、组件使用、样式与响应式规则。
- 明确对象导航使用 React Router 动态路由参数，避免为每个对象生成一套硬编码路由。

## 边界

- 不设计业务字段含义。
- 不设计查询、保存或导入导出接口。
- 不处理权限、审批流、数据建模。
- Make 记录列表和关联表格必须使用 `@qfei-design/canvas-table`，并通过 `canvas-table-integration` 做表格展示；如果需要单元格编辑，也通过 `canvas-table-integration` 处理。

## 验证方式

- 静态检查不再出现旧技术栈描述和模板残留。
- 静态检查 Ant Design 是推荐默认组件库，但不是唯一选择；Arco Design、TDesign 可作为 React 组件库备选。

## 追加调整

- 详情页不默认生成动态记录、时间线、评论或操作日志区块；只有用户明确要求时才添加。
- 组件库 Table 不用于 Make 记录列表，避免 AI 误用 Ant Design Table、Arco Table 或 TDesign Table 替代 canvas-table。
- 对象列表推荐使用 `/objects/:objectKey` 这类动态路由；新建、编辑、详情如需 URL 承载，也使用对象和记录 ID 动态子路由，但默认仍渲染 Drawer。
- 静态检查不默认生成视图、筛选、分组、排序、列设置、导入、导出。
- 走读默认列表、新建 Drawer、编辑 Drawer、详情 Drawer、独立路由详情等场景，确认规则完整。
