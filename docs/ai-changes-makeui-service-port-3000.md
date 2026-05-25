# makeui Service 端口 3000 规则

## 2026-05-25

- 变更摘要：将 `makeui` Service 型 Make App 的 `apps/service` 本地服务端口规则强制收敛到 `3000`。
- 涉及文件：`skills/makeui/SKILL.md`、`skills/makeui/references/principles.md`。
- 关键决策：生成或调整 Service 型 Make App 前端时，App Service 进程默认监听 `0.0.0.0:3000` 或 `localhost:3000`，非 3000 端口必须由用户显式覆盖。
- 验证结果：文本断言、运行时 skill 同步 diff、`npx skills list -g --json` 和 `git diff --check` 已通过。
