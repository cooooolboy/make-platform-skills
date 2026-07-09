# CanvasTable skill 元数据兼容性修复

## 背景

`skills/canvas-table-integration/SKILL.md` 的 `description` 曾改为 YAML block scalar。该写法可以通过 `quick_validate.py` 的 YAML 校验，但当前公司 `review_skill.mjs` 机械检查会把该字段误识别为过短内容，从而报出 description 缺少触发场景和职责边界。

## 修改内容

- 将 `canvas-table-integration` 的 frontmatter `description` 改回单行带引号字符串。
- 保留完整触发场景、能力范围和边界说明。
- 保留 `editApplyMode: controlled` 这类带冒号文本，但通过引号避免 YAML 解析错误。

## 结果

`quick_validate.py` 和 `review_skill.mjs` 都可以正确读取该 description。
