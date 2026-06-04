# makeui 区域内滚动强规则

## 背景

Make App 对象列表页不应出现整个页面滚动。左侧导航内容过多时应在左侧导航区域内滚动；右侧表格数据过多时应在表格区域内滚动；Drawer 和路由页面也应由各自内容区域承载滚动。

## 调整

- `skills/makeui/SKILL.md` 新增 hard rule：生成的 App Shell 和对象列表页禁止 body 级或整页滚动。
- 明确 `body`、app root、shell、workspace、list page 都不应成为普通对象列表浏览的滚动容器。
- `skills/makeui/references/app-shell-layout.md` 强化固定高度应用壳规则，要求长导航只在 sidebar 内滚动。
- `skills/makeui/references/list-page-layout.md` 强化列表页规则，要求表格溢出只在 CanvasTable/table region 内滚动。
- `skills/makeui/references/styling-and-responsive.md` 同步收紧布局稳定性规则。
- `skills/makeui/SKILL.md` revision 更新为 `0.3.35`。

## 边界

- 本次只调整 `makeui` 的布局滚动规则。
- 不修改 `canvas-table-integration`、`make-app-auth`、`make-app-service`、`make-app-runtime`、`makecli`、`makedsl` 或 `make-integration`。
