# 表格默认不分页规范

## 背景

用户指出使用表格的 skill 不应默认添加分页逻辑。除非用户明确要求，否则列表页和 canvas-table 接入都不应该生成分页控件、分页状态或分页数据请求逻辑。

## 变更内容

- 更新 `skills/makeui/SKILL.md`，明确 Make 记录表和列表表格默认不添加分页。
- 更新 `skills/makeui/references/list-page-layout.md`，移除默认列表骨架中的分页项，规定分页是显式需求。
- 更新 `skills/makeui/references/principles.md` 与 `component-usage.md`，把分页纳入“未要求不得添加”的默认边界。
- 更新 `skills/canvas-table-integration/SKILL.md`，规定普通表格默认使用 `setData(rows)`，不默认生成分页、`virtualOptions` 或 `data:load`。
- 更新 `README.md` 中 `canvas-table-integration` 的使用场景描述，避免把分页表格表达成默认能力。

## 影响范围

- 新生成的 Make App 列表页默认只有搜索、刷新、新建和表格区域。
- 新接入 `@qfei-design/canvas-table` 时，默认不生成分页控件、分页状态、pageSize、total、URL page 参数或分页请求逻辑。
- 用户明确要求分页、虚拟加载或分页后端接入时，仍可使用对应规则生成分页实现。
