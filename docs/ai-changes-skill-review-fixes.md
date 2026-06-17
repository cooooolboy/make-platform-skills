# skill review 问题修复

## 背景

根据本次 `$review-skills` 复查结果，当前 skill 集合还存在三类问题：`make-app-runtime` frontmatter 含非标准字段、部分共享 skill 缺少 `agents/openai.yaml`、CanvasTable 单元格编辑规范未明确拦截可见 helper/hint 文案和固定窄宽编辑器。

## 修改内容

- 删除 `skills/make-app-runtime/SKILL.md` frontmatter 中的 `metadata.homepage`，保持 frontmatter 只包含 `name` 和 `description`。
- 新增 `skills/make-app-runtime/agents/openai.yaml` 和 `skills/make-app-service/agents/openai.yaml`，补齐共享 skill 的 UI 元数据。
- 更新 `skills/canvas-table-integration/references/make-cell-edit-defaults.md`，明确禁止在单元格编辑器内显示 `0-5` 等 helper/hint/校验说明文案，并禁止将编辑器 clamp 成固定窄宽。
- 更新 `skills/canvas-table-integration/references/edit-common-pitfalls.md`，把可见提示文案和非全宽编辑器列为常见错误。
- 更新 `scripts/test-cell-edit-standards-contract.mjs`，用静态合同测试覆盖 helper/hint 禁令和 full-cell 尺寸禁令。
- 删除 `makecli`、`makedsl`、`make-integration` frontmatter 中的 `version` 和 `metadata` 非标准字段，并补充 description 职责边界，降低跨 skill 误触发风险。
- 新增 `makecli`、`makedsl`、`make-integration`、`make-app-auth` 的 `agents/openai.yaml`，补齐共享 skill 的 UI 元数据。
- 在 `makedsl` 中新增 reference map，直接链接 `DepartmentFieldDesign.md`、`EntityDataFilterUsage.md`、`FileFieldDesign.md`、`UserFieldDesign.md` 等引用文件，满足渐进披露可发现性要求。
- 保留 `make-app-auth/examples/service-fronted-node` 作为 Service-fronted 样例项目，并在 `SKILL.md` 中标明用途；该目录对应 review 的非阻断 Minor，不再为了消除 Minor 迁移样例路径。
- 为 `make-app-auth/scripts/test-audit-auth-contract.mjs` 补充执行权限，满足脚本可执行性建议。

## 验证

- 先更新合同测试并确认其在文档修复前失败。
- 待文档和元数据修复后，重新运行 review 和合同测试。
