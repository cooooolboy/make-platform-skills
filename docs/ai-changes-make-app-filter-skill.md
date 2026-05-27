# make-app-filter skill 新增

## 背景

高级筛选同时涉及 UI 控件、字段类型、筛选条件模型、Service filter 合同、Make Data API 表达式和 CanvasTable 表头菜单联动，不能继续分散写在 `makeui`、`make-app-service` 或 `canvas-table-integration` 中。

## 本次调整

- 新增 `skills/make-app-filter/SKILL.md`，定义高级筛选职责、边界、默认行为和协作方式。
- 新增 `references/filter-model.md`，沉淀 Filter IR、草稿确认、搜索合并和对象切换重置规则。
- 新增 `references/operator-matrix.md`，按 Make 字段类型定义默认操作符、值编辑器、候选接口和不支持字段。
- 新增 `references/ui-style.md`，按 ExpensePoc 当前高级筛选样式沉淀默认面板布局、尺寸、颜色和校验反馈。
- 新增 `references/header-table-linkage.md`，沉淀 CanvasTable 表头更多菜单与高级筛选 `openWithField(fieldKey)` 的联动规则。
- 新增 `references/service-translation.md`，约束 `{ expression }` filter 合同、CEL 子集和空筛选处理。
- 新增 `references/testing-and-pitfalls.md`，补充高级筛选、表头联动、Service payload 的测试要求和常见回归。
- 更新根 `README.md`，让高级筛选相关问题路由到 `make-app-filter`。

## 边界

- `make-app-filter` 不负责页面 Shell 和列表工具栏整体布局，布局仍交给 `makeui`。
- `make-app-filter` 不负责 CanvasTable 渲染和 suffixRender API 细节，表格接入仍交给 `canvas-table-integration`。
- `make-app-filter` 不负责 Service 路由实现、日志和 adapter，具体代码仍交给 `make-app-service`。
- `make-app-filter` 不负责认证、打包发布、DSL 建模或 Make CLI 操作。
