# 高级筛选 npm 包规范

## 背景

高级筛选已封装为 npm 包 `@qfei-design/make-filter`，skill 需要从“指导宿主实现高级筛选逻辑”调整为“指导宿主消费高级筛选 npm 包”。否则新 Make 项目仍可能复制旧的 IR、操作符矩阵、校验器、CEL 编译器或面板实现。

## 本次调整

- 更新 `skills/make-app-filter/SKILL.md`，明确 Make 项目只要使用高级筛选、条件构造器或 CanvasTable 表头“按该字段筛选”，必须使用 `@qfei-design/make-filter`。
- 新增 `references/package-integration.md`，沉淀包入口、安装版本、默认 imports、包职责、宿主职责和迁移 shim 边界。
- 调整 `filter-model`、`operator-matrix`、`ui-style`、`header-table-linkage`、`service-translation`、`testing-and-pitfalls` 参考文档，将旧的本地实现规则改为调用包能力和宿主适配规则。
- 更新 `skills/makeui/SKILL.md`，要求高级筛选必须通过 `make-app-filter` 接入 `@qfei-design/make-filter`，`makeui` 只负责 toolbar 位置和页面布局。
- 更新根 `README.md`，在 skill 路由中把高级筛选明确指向 `make-app-filter` 和 `@qfei-design/make-filter` 消费侧接入。

## 边界

- `make-app-filter` 负责高级筛选包接入、筛选行为、表头联动、`filter.expression` 合同、URL 回显和测试要求。
- `makeui` 只负责页面 Shell、列表 toolbar 位置和视觉布局，不允许生成本地高级筛选模型、操作符矩阵、校验器、CEL compiler/parser 或自定义高级筛选面板。
- CanvasTable `suffixRender` 细节仍由 `canvas-table-integration` 负责。
- Service route、日志、adapter 和 Make Data API 调用细节仍由 `make-app-service` 负责。

## 追加：筛选一体化交付规则

- 用户只要在 Make 记录列表需求里提出“筛选 / 高级筛选 / 表格筛选 / 表头筛选 / 按字段筛选”，都视为同一个完整筛选能力，必须同时交付 package 高级筛选和 CanvasTable 表头筛选联动。
- 高级筛选部分必须使用 `@qfei-design/make-filter` 的 core、React panel、controller、候选源、AntD adapter 和 `styles.css`；不得手写本地 IR、操作符矩阵、校验器、CEL compiler/parser 或高级筛选面板。
- 表头筛选不是 npm 包能力，必须由宿主通过 CanvasTable 表头菜单/`suffixRender` 实现，并调用同一个 package controller 的 `openWithField(fieldKey)` 打开 toolbar 高级筛选草稿。
- 不允许只做高级筛选或只做表头筛选；筛选能力要么完整接入，要么不接入。
- `makeui` 只负责 toolbar 位置和页面布局，但遇到筛选词必须引导到 `make-app-filter`，并配合 `canvas-table-integration` 完成宿主表头入口。

## 追加：review-skills 修复

- 删除 `skills/make-app-filter/SKILL.md` frontmatter 中的非标准 `metadata.homepage` 字段，保持 frontmatter 只包含 `name` 和 `description`。
- 修复 `package-integration.md` 和 `ui-style.md` 中直接传 `onConfirm={controller.confirm}` 的示例，改为宿主 `handleConfirm` 调用 `controller.confirm()`，并只在 `validation.valid` 时关闭 Popover。
- 为 `make-app-filter` 和 `makeui` 补充 `agents/openai.yaml`，用于共享 skill 的 UI 展示与默认提示。

## 2026-06-16 11:22 CST

- 变更摘要：同步 Make Record 列表筛选文档与 `EntityDataHandler.list` / `FilterResolver` 真实逻辑。
- 涉及文件：`skills/make-app-filter/**`、`skills/make-app-service/SKILL.md`、`skills/make-app-service/references/**`、`README.md`。
- 关键逻辑：明确新请求使用 `filter: { expression }`，空表达式省略；补充 CEL/DNF、系统变量、DateRange/File/Lookup 后端支持。
- 关键决策：UI 是否展示高级类型仍以 `@qfei-design/make-filter` 公开能力为准，能力不一致时升级/修复包，不在宿主手写 CEL。

## 2026-06-16 11:36 CST

- 变更摘要：同步 `makedsl` 数据 API filter 文档与后端 CEL 解析和系统变量能力。
- 涉及文件：`skills/makedsl/references/EntityDataFilterUsage.md`、`skills/makedsl/references/DataAPIDesign.md`。
- 关键逻辑：补齐 `_currentOrg`、`_today`、`_now`，增加 `_today +/- duration("Nd")` 天级偏移说明，并修正多部门字段 `exists` 示例。
- 关键决策：继续要求生成 `filter: { expression }`；裸字符串仅视为迁移兼容，不作为 AI 生成格式。
