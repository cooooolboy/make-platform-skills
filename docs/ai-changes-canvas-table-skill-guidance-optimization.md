# canvas-table skill 指导口径优化记录

## 2026-05-21

- 参考 1771 Technologies AI Skills 文档的结构方式，将 `canvas-table-integration/SKILL.md` 调整为更偏导航层：新增 Quick start 和 Topic reference map。
- 将 Track A/B/C 的长工作流、能力清单、常见错误、延期主题和输出模板迁入 `references/track-workflows.md`，避免根 `SKILL.md` 过长。
- 为新增的长 reference 文件补充 Contents，保持按需读取时的可导航性。
- 压缩 `SKILL.md` frontmatter description，使其符合 skill 校验的 1024 字符限制，同时保留 Track A/B/C 的触发语义。
- 将 `references/validated-usage-notes.md` 纳入根 `SKILL.md` 的 reference map，作为区分已验证下游模式和未充分验证能力的维护入口。

## 2026-05-07

- 将 Track B 的“验证默认架构”调整为“可迁移的宿主编辑默认建议”，减少过硬规定对使用者的约束。
- 移除本地项目绝对路径和过具体业务字段名，改用稳定后端身份、业务展示字段等通用表述。
- 补充数字类编辑的通用原则：行数据和提交值保持数字类型，展示格式化放在编辑器 formatter 或表格 render 层。
- 补充数字展示安全规则：`Number`、`Currency`、`Percent` 只有有限数字才允许格式化；空值、非法值、`NaN`、`Infinity` 统一展示为 `-`，不得在表格中显示 `NaN`。
- 收敛附件编辑说明，强调本地预览、真实上传、提交值和宿主组件能力之间的边界，避免把示例项目细节固化成通用要求。
