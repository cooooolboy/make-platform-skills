# makeui 当前用户菜单与退出规范

## 背景

Make App 首页和对象列表页的头部右侧需要固定展示当前登录人。默认形态应为 32px 圆形头像加姓名组合；有真实头像时使用真实头像，没有头像时从一组可读颜色中按用户 id 或姓名稳定随机选择背景色，并展示姓名后两个字。未点击时只展示头像和姓名，不展示标签、胶囊背景、下拉箭头或菜单；点击头像或姓名后才在下方打开账号菜单，菜单中必须包含退出入口。

## 调整

- `skills/makeui/SKILL.md` 增加当前用户头部菜单强样式规则；本地最终状态的 MakeUI revision 为 `0.3.40`。
- `skills/makeui/references/app-shell-layout.md` 新增 `Current user menu` 小节，明确头部右侧展示 32px 圆形头像加姓名、真实头像优先、无头像时使用稳定随机背景色和姓名后两个字、点击后才打开下拉菜单、菜单包含 `退出`。
- `skills/makeui/references/principles.md` 和 `list-page-layout.md` 同步更新默认 shell / list page 结构，要求头部右侧使用当前登录人头像和姓名组合。
- `skills/make-app-auth/SKILL.md` 强化退出行为归属，要求当前用户菜单中的退出动作调用 `auth.logout()`，并移除非标准 frontmatter version 字段。
- `skills/make-app-auth/references/logout-and-401.md` 和 `sdk-integration.md` 补充账号菜单退出入口要求。

## 边界

- `makeui` 只负责头部右侧账号入口、下拉弹窗、菜单项和视觉交互位置。
- `make-app-auth` 负责退出行为，禁止在 UI 中手写退出 URL、清理 cookie 或绕过 SDK。
- 本次只修改 skill 规范和变更记录，不修改 `expensePoc` 或其他业务项目代码。
