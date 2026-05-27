# makeui 详情字段展示规范补充

## 背景

新生成的 Make POC 详情抽屉中出现字段展示降级问题：日期范围字段被展示为原始 JSON，详情标题在很短空间内被截断为 `合...`。这类问题说明生成代码没有按 Make 字段类型和稳定返回结构做详情展示适配。

## 本次调整

- 在 `skills/makeui/SKILL.md` 中明确：详情值必须通过字段类型展示适配器渲染，不能直接展示对象、数组或 JSON wrapper。
- 在 `skills/makeui/references/component-usage.md` 中补充详情展示基线，覆盖 18 类 Make 字段的默认展示方式和取值优先级。
- 在 `skills/makeui/references/drawer-layout.md` 和 `skills/makeui/references/page-route-layout.md` 中补充详情抽屉、路由详情页的字段展示和标题溢出规则。
- 在 `README.md` 的 makeui 使用场景中补充：详情页/详情抽屉按字段类型和返回结构展示，日期范围、下拉、人员、部门、附件、lookup 不能直接展示原始 JSON。
- 复查时收紧措辞：`makeui` 不设计业务 API 路由；人员/部门候选源只是 UI 选择器的窄例外；详情字段展示不实现 CanvasTable 渲染器。`canvas-table-integration` 中 `DateRange` 表格展示明确为日期范围文本，只有列宽裁剪时才出现省略号。

## 影响范围

- 仅调整 skill 文档和总入口说明。
- 不修改业务项目代码。
- 不新增接口设计、认证、打包发布或 Service runtime 规则。
