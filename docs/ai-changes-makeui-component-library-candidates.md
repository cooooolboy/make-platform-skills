# makeui 组件库候选调整

## 背景

新 Make UI 项目的组件库选择需要去除 TDesign，保留 Ant Design、Arco Design 和 shadcn/ui。

## 调整

- `skills/makeui/references/component-usage.md` 的新项目组件库候选调整为三项：
  1. Ant Design，推荐/default 选项
  2. Arco Design
  3. shadcn/ui
- 移除 TDesign 作为新项目组件库候选。
- 强化组件库选择边界：新项目无既有组件库时必须先让用户在 Ant Design、Arco Design、shadcn/ui 三项中选择，未表态前不能生成组件库相关代码、依赖、导入、主题或图标配置。
- 用户明确点名三项之一时按用户选择执行；用户回答“默认”“推荐”“你决定”“随便”等泛化委托时，视为接受推荐/default，按 Ant Design 继续。
- `skills/makeui/references/principles.md` 同步更新组件库选择规则。
- `skills/makeui/SKILL.md` revision 更新为 `0.3.34`。

## 边界

- 本次只调整 `makeui` 的组件库候选和选择顺序。
- 不修改 `canvas-table-integration`、`make-app-auth`、`make-app-service`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
