# make-platform-skills
make 平台的 skill

# 安装
```
  npx skills add qfeius/make-platform-skills
```
# 升级
```
  npx skills update  qfeius/make-platform-skills
```

## Skill 路由总览

用户问题先按下面的关键词选择 skill。一个任务可以组合多个 skill，但每个 skill 只负责自己的边界。

Codex 判断优先级：

1. 用户明确点名某个 skill 时，优先使用该 skill。
2. 用户没有点名时，按问题关键词从下表选择最匹配的 skill。
3. 一个需求跨多个领域时，可以组合多个 skill，但只在主责 skill 中写具体规则，其他 skill 只写“转交/配合”提示。
4. 不要把登录、打包发布、DSL 建模、Make CLI 操作、CanvasTable 内部规则写进 `makeui`；`makeui` 只负责页面布局、样式和 UI 组件组织。

| 用户问题 / 关键词 | 使用 skill | 边界 |
| --- | --- | --- |
| 页面、布局、App Shell、侧边栏、顶部栏、列表页、新建/编辑/详情、Drawer、表单布局、响应式、UI 状态 | `makeui` | 只负责 UI 怎么展示，不负责认证、打包、Service、业务 API 设计和发布 |
| CanvasTable、表格渲染、字段类型展示、表格编辑、序号列、行头详情图标、`showSN`、`bodyRowHeadSuffixOptions` | `canvas-table-integration` | 只负责 `@qfei-design/canvas-table` 消费侧接入，不负责页面 Shell 和业务 API |
| 高级筛选、筛选条件组、AND/OR、字段类型操作符、filter expression、筛选值归一化、表头按字段筛选联动 | `make-app-filter` | 只负责筛选模型、筛选控件行为、表头筛选联动和筛选合同，不负责页面 Shell、表格渲染、Service 实现、认证或发布 |
| Service 接口、`apps/service` API、UI-Service 合同、`apps/docs/api.md`、schema/records/users/departments/lookup/file 代理接口、Make Data API adapter、Service Make adapter 环境变量和配置语义 | `make-app-service` | 只负责 Service API、薄编排和 Make adapter 配置语义，不负责 UI、认证、打包发布、端口/构建产物、DSL 建模、Make CLI、CanvasTable |
| 登录、认证、Token、统一登录、OAuth、Cookie、Session、logout、401/403、`/api/make/**` 鉴权请求 | `make-app-auth` | 只负责认证和鉴权请求，不负责 UI 布局和打包发布 |
| 打包、发布、镜像入口、K8s、Service 启动失败、`apps/ui/dist`、`apps/service/dist/server.js`、Service 端口 `3000`、workspace/package.json、`X-Forwarded-Host` | `make-app-runtime` | 只负责运行态和打包发布契约，不负责 Service API、认证实现或 Make adapter 配置语义 |
| App/Entity/Relation/Field 建模、DSL YAML、对象、字段、关系、选项 | `makedsl` | 只负责 DSL 设计和生成，不负责远端 apply |
| `makecli` 命令、diff、apply、部署、查看应用/实体/关系/记录、配置 token/server-url | `makecli` | 只负责 Make CLI 操作，不负责 UI/认证实现 |
| 发票、票据、OCR、验真、识别金额/税号/票据内容 | `make-integration` | 只负责 Make 集成服务能力 |

常见组合：

- 做一个对象列表页：`makeui` + `canvas-table-integration`
- 做高级筛选或表头按字段筛选：`make-app-filter` + `makeui` + `canvas-table-integration`
- 做筛选 Service 合同或 filter.expression 透传：`make-app-filter` + `make-app-service`
- 做 UI 需要的 Service 接口：`make-app-service` + `makeui`
- 做一个登录后的页面：`makeui` + `make-app-auth`
- 做 Service-fronted 登录后接口：`make-app-service` + `make-app-auth`
- 打包发布失败或 Service 启动失败：`make-app-runtime`
- 新增对象字段并部署：`makedsl` + `makecli`

## 可用 Skill 列表

### makecli
指导如何使用 `makecli` 命令行

#### 升级 skill
```bash
npx skills update makecli
```

**使用场景**
- 你需要指导使用 `makecli` 命令

### makedsl
指导如何生成 dsl 文件

#### 升级 skill
```bash
npx skills update makedsl
```

**使用场景**
- 根据业务的需求生成服务要求的 dsl 文件

### canvas-table-integration
指导如何在消费侧项目中接入 `@qfei-design/canvas-table`

#### 升级 skill
```bash
npx skills update canvas-table-integration
```

**使用场景**
- 在页面里接入 `@qfei-design/canvas-table`
- 接普通表格；分页表格、虚拟加载、分组表格仅在用户明确要求时添加
- 把 JSON meta 转成 `IColumn[]`
- Make schema 表格默认按字段类型使用 ExpensePoc 风格渲染，包含附件、lookup、下拉标签、人员、部门，以及内容溢出时显示省略号并展示 tooltip
- 切换左侧对象或动态路由时，canvas-table 默认重置滚动位置和对象级临时状态

### makeui
指导生成或修改 Make App 前端 UI，覆盖页面布局、App Shell、列表页、抽屉表单、详情页和响应式样式。

#### 升级 skill
```bash
npx skills update makeui
```

**使用场景**
- 生成或调整 Make App 前端页面
- 设计 App Shell、侧边栏、顶部栏、列表页、创建/编辑/详情抽屉
- 基于宿主项目提供的字段元数据生成表单和字段展示
- 详情页/详情抽屉按字段类型和返回结构展示值，日期范围、下拉、人员、部门、附件、lookup 等不能直接展示原始 JSON
- 表单/详情中的人员、部门字段默认使用候选接口源；Make App 默认 UI-Service 候选接口为 `/api/users` 和 `/api/departments`，如宿主已有等价路由则遵循宿主合同
- 需要在 UI 中接入 Make 记录表格时，配合 `canvas-table-integration`
- 不负责认证细节；认证、统一登录、logout 和 `/api/make/**` 请求规则交给 `make-app-auth`
- 不负责打包发布、Service runtime、镜像入口和构建产物；这些交给 `make-app-runtime`

### make-app-filter
指导生成、重构或审查 Make App 高级筛选能力，覆盖筛选条件模型、字段类型操作符、筛选值归一化、ExpensePoc 风格高级筛选面板、CanvasTable 表头“按该字段筛选”联动和 `filter.expression` 合同。

#### 升级 skill
```bash
npx skills update make-app-filter
```

**使用场景**
- 设计或修改高级筛选弹窗、筛选条件组、`且 / 或` 关系和确认提交交互
- 根据 Make 字段类型生成筛选操作符和值编辑器
- 把搜索和高级筛选合并为 Service 可消费的 `filter.expression`
- 做 CanvasTable 表头更多菜单与高级筛选的联动：点击“按该字段筛选”追加草稿条件并打开高级筛选
- 约束空筛选、未完成条件、unsupported 字段、人员/部门筛选值和测试
- 不负责页面 Shell 和工具栏整体布局；这些交给 `makeui`
- 不负责 CanvasTable 渲染和 suffixRender API 细节；这些交给 `canvas-table-integration`
- 不负责 Service route 实现；这些交给 `make-app-service`

### make-app-service
指导生成、重构或审查 Make App 的 `apps/service` API，覆盖 UI-Service 合同、Service 路由、Make Meta/Data API adapter、`MAKE_APP_KEY` / Make adapter 环境变量/config 语义、schema/records/users/departments/lookup/file 代理接口和 Service API 测试。

#### 升级 skill
```bash
npx skills update make-app-service
```

**使用场景**
- 设计或修改 `apps/service` 接口
- 更新 `apps/docs/api.md` 中的 UI-Service 合同
- 生成 schema、fields、records、record detail、create、update、delete、cell update 等通用对象接口
- 生成人员、部门、lookup options、文件上传/删除/下载代理接口
- 设计 Make Meta/Data API adapter、错误返回、请求参数校验、日志脱敏和接口测试
- 约束 `apps/service/src/config.ts` 中 Make adapter 配置语义：`MAKE_APP_KEY` 由部署注入且 Service 调 Make Meta/Data 时使用，`MAKE_API_BASE_URL` 优先、`MAKE_SERVER_URL` 兼容，缺少必需配置时启动失败
- 不负责页面布局；页面和组件展示交给 `makeui`
- 不负责认证实现；统一登录、cookie、session、401/403 交给 `make-app-auth`
- 不负责打包发布；端口、`dist/server.js`、package scripts 和镜像入口交给 `make-app-runtime`
- 不负责 DSL 建模、Make CLI 操作或 CanvasTable 渲染；这些分别交给 `makedsl`、`makecli` 和 `canvas-table-integration`

### make-app-runtime
指导 Make App 运行态和打包发布契约，覆盖 `apps/` workspace、`apps/ui/dist`、`apps/service` 构建产物、Service 端口、镜像启动入口和发布前契约检查。

#### 升级 skill
```bash
npx skills update make-app-runtime
```

**使用场景**
- 生成、重构或审查 Make App 的 `apps/` workspace 结构
- 处理打包、发布、镜像启动、K8s 启动入口相关问题
- 排查 `Cannot find module '/app/apps/service/dist/server.js'`
- 约束 `apps/service/src/server.ts` 必须构建出 `apps/service/dist/server.js`
- 约束 `apps/service/package.json` 的 `build/start` 和 `apps/service/tsconfig.json`
- 约束 Service 固定端口 `3000` 在启动配置中的落实，以及发布前构建契约测试；Make adapter 环境变量/config 语义交给 `make-app-service`

### make-app-auth
指导 Make App 前端接入 `@qfeius/make-app-auth`，只保留统一登录模式，覆盖 `/api/make/**` 鉴权请求、401/403、logout、Cookie/Session/redirect 排障。

#### 升级 skill
```bash
npx skills update make-app-auth
```

**使用场景**
- 生成或审查 Make App 统一登录启动逻辑
- 发布态、vibe App 和本地联调都只走统一登录；缺少域名、`/api/make/**` 路由或 Org callback 白名单时标记 blocker，不降级为 token/no-login
- 验证 OAuth、SSO、Cookie、logout、redirect callback
- 处理权限不足、登录态过期和退出链路
- 约束所有 Make 后端请求通过共享 API adapter 包装 `auth.api`，统一处理 401/403
- 使用 `scripts/audit-auth-contract.mjs` 做发布前认证合同检查，拦截 token 模式、裸 `/api/make` fetch 和 Service auth proxy 缺失
- 约束前端不要手写 `Authorization`、不要传 `accessToken`/`tokenProvider`/`unifiedLogin:false`、不要操作 `zs_session`、不要自行拼 Org OAuth/logout URL

### make-integration
Make 集成服务, 扩展 make 平台的能力, 目前集成能力有
- 发票 OCR

#### 升级 skill
```bash
npx skills update make-integration
```

**使用场景**
- 识别发票(打车, 火车票, 宾馆, 餐饮等)的内容(金额等相关信息)
