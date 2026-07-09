# MakeUI 自定义表单字段受控契约补充

## 背景

在 POC 项目中出现人员字段视觉上已经选中人员，但保存时表单校验仍提示必填缺失的问题。原因不是 Make 后端或保存接口，也不是必须使用 Ant Design，而是自定义字段组件没有把宿主表单注入的受控属性继续传给内部交互控件，导致显示状态和表单状态不一致。

## 修改内容

- 在 `skills/makeui/SKILL.md` 中新增硬性规则：自定义表单字段控件必须作为宿主表单的受控适配器，透传 `value/onChange/onBlur/id/disabled`，并保证提交和校验读取到的表单值与视觉展示一致。
- 在 `skills/makeui/references/component-usage.md` 中新增 `Host form controlled field contract`，明确人员、部门、Lookup、选择、日期、文件和自定义关系控件都必须遵守受控契约。
- 在 Drawer 表单和路由表单文档中补充引用，避免只按布局文档生成表单时漏掉该规则。
- 新增 `scripts/test-makeui-controlled-field-contract.mjs`，用静态契约测试防止后续文档回退为只展示本地状态或误绑定到 Ant Design。

## 约束说明

- 该规则不要求使用 Ant Design、Arco、shadcn 或任何特定组件库。
- 组件可以维护搜索词、候选项缓存、弹层开关、加载状态等临时状态。
- 选中值不能只保存在组件内部状态中，必须由宿主表单的 `value` 驱动，并在用户选择或清空时通过 `onChange` 写回宿主表单。
