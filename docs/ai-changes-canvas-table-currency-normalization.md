# CanvasTable 金额字段预格式化字符串归一化

## 背景

POC 项目中后端可能返回 `¥1,000.00`、`￥1,000.00`、`$1,000.00` 或 `1,000.00` 这类已经带币种符号和千分位的金额字符串。直接执行 `Number('¥1,000.00')` 会得到 `NaN`，导致 CanvasTable 金额列显示为空或异常。

## 修改内容

- 在 `skills/canvas-table-integration/SKILL.md` 中补充金额字段安全规则：预格式化金额必须在边界适配层清洗后再做有限数字解析，不能在渲染器中直接解析。
- 在 `skills/canvas-table-integration/references/make-field-display-patterns.md` 中补充 `¥1,000.00`、`￥1,000.00`、`$1,000.00`、`1,000.00` 等示例，要求去掉币种符号、千分位分隔符和空白后再解析。
- 在 `skills/canvas-table-integration/references/column-patterns.md` 中补充 display-only 金额列同样需要边界归一化。
- 新增 `scripts/test-canvas-table-currency-normalization-contract.mjs`，防止后续文档回退到直接 `Number(rawCurrencyText)`。

## 规范结论

- 金额渲染器只消费有限数字或空值。
- 带币种符号、千分位或空白的金额字符串必须先在 boundary adapter / 边界适配层清洗。
- `Number('¥1,000.00')` 是禁止模式，解析失败时显示 `-`，不能显示 `NaN`。
