# Make 数字类字段展示契约调整

## 背景

后端已调整金额和百分比字段返回格式，不再返回带货币符号、百分号或千分位的展示字符串。前后端交互值应保持数字或纯数字字符串，例如金额 `"1999.00"`、百分比 `"85.00"`。展示层需要根据字段类型添加 `￥`、`%` 等 UI 文案。

## 修改内容

- 调整 `skills/canvas-table-integration/SKILL.md`：明确 `Number`、`Currency`、`Percent` 后端值只能是有限数字或纯数字字符串，金额符号和百分号由前端字段类型渲染器添加。
- 调整 `skills/canvas-table-integration/references/make-field-display-patterns.md` 和 `column-patterns.md`：移除旧的“清洗带符号金额字符串”兼容路径，新增纯数字输入、前端格式化展示、禁止提交展示字符串的规则。
- 调整 `skills/canvas-table-integration/references/field-editor-patterns.md`：金额和百分比编辑提交值保持有限数字或纯数字字符串，不提交 `￥`、`¥`、`%` 等格式化内容。
- 调整 `skills/makeui/references/component-usage.md`：表单和详情展示同样采用纯数字交互值，展示符号只在前端字段类型适配器中添加。
- 调整 `skills/makedsl/references/DataAPIDesign.md`：Data API 示例中的金额和百分比改为纯数字字符串。
- 新增 `scripts/test-make-numeric-field-display-contract.mjs`，替换旧的金额格式兼容测试。

## 规范结论

- 后端/API 不再返回带货币符号、百分号或千分位的展示字符串。
- `Make.Field.Currency` 展示时由前端按字段类型添加货币符号，默认使用 `￥`。
- `Make.Field.Percent` 展示时由前端按字段类型添加 `%`。
- 表单 store、CanvasTable row data、编辑提交值和 API payload 都保持数字或纯数字字符串。
