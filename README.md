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

### skills/makeui
指导生成或修改 Make App 前端 UI，覆盖 React + Vite + React Router 页面布局、App Shell、列表页、抽屉表单、详情页和响应式样式。

#### 升级 skill
```bash
npx skills update skills/makeui
```

**使用场景**
- 生成或调整 Make App 前端页面
- 设计 App Shell、侧边栏、顶部栏、列表页、创建/编辑/详情抽屉
- 基于 Make DSL/schema 生成表单和字段展示
- 需要在 UI 中接入 Make 记录表格时，配合 `canvas-table-integration`
- 不负责认证细节；认证、Token、统一登录、logout 和 `/api/make/**` 请求规则交给 `make-app-auth`

### make-app-auth
指导 Make App 前端接入 `@qfei/make-app-auth`，覆盖本地 token 模式、统一登录模式、`/api/make/**` 鉴权请求、401/403、logout、Cookie/Session/redirect 排障。

#### 升级 skill
```bash
npx skills update make-app-auth
```

**使用场景**
- 生成或审查 Make App 认证启动逻辑
- 本地开发默认使用 token/no-unified-login 模式，不要求 ngrok 或 Org 回调白名单
- 专项测试统一登录、OAuth、SSO、Cookie、logout、redirect callback
- 处理 Token 失效、权限不足、登录态过期和退出链路
- 约束前端不要手写 `Authorization`、不要操作 `zs_session`、不要自行拼 Org OAuth/logout URL

### make-integration
Make 集成服务, 扩展 make 平台的能力, 目前集成能力有
- 发票 OCR

#### 升级 skill
```bash
npx skills update make-integration
```

**使用场景**
- 识别发票(打车, 火车票, 宾馆, 餐饮等)的内容(金额等相关信息)
