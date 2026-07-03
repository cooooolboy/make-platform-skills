# makedsl filter reference 同步

## 2026-06-10 15:15 CST

- 变更摘要：将 makedsl reference 中的 Record/User/Department 列表筛选统一改为 `filter.expression` 表达式模型。
- 涉及文件：`skills/makedsl/references/DataAPIDesign.md`、`skills/makedsl/references/EntityDataFilterUsage.md`、`skills/makedsl/SKILL.md`。
- 关键逻辑：补充 DNF、空筛选、字段类型操作符、DateRange/File/Lookup、系统变量和错误示例；Lookup 按 `targetFieldKey` 目标字段类型选择操作符。
