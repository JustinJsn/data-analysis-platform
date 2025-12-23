# 实现计划：数据分析平台前端

**特性名称:** 数据分析平台前端实现  
**规范版本:** 1.0  
**目标发布:** v1.0.0  
**日期:** 2025-12-23

---

## 特性概述

数据分析平台是一个企业级数据管理和可视化系统的前端实现，用于展示从北森等第三方系统同步的数据，并提供监控、管理和查询功能。

**核心功能：**

1. **认证与权限管理** - JWT Token 认证，基于权限的路由和菜单控制
2. **监控模块** - 员工、组织、职务数据同步任务监控，批次列表和日志查看
3. **基础数据模块** - 员工、组织、职务信息列表查询和展示
4. **主题系统** - 支持亮色/暗色模式，主题色定制
5. **响应式布局** - 左右布局，Element Plus 菜单 + Tailwind CSS 样式

---

## 宪法合规性检查

本特性必须符合 `.specify/memory/constitution.md` 中的所有原则：

- [x] **TypeScript Strict Mode**: 所有代码使用严格类型，无隐式 any
- [x] **代码质量门禁**: 通过 oxlint、oxfmt 和 vue-tsc 检查
- [x] **状态管理**: 使用 Pinia 管理共享状态，Vue Router 管理导航
- [x] **测试纪律**: 包含单元测试（80%+ 覆盖率）和 E2E 测试
- [x] **生产可观测性**: 集成 Sentry 错误追踪

**合规性说明：**

所有技术选型和架构设计均遵循项目宪法要求，使用 Vue 3 Composition API、TypeScript Strict Mode、Pinia 状态管理、Tailwind CSS 4.x 和 Element Plus 2.x。预留 Sentry 集成接口，测试策略已规划。

---

## 范围

### 包含的功能

- ✅ **HTTP 请求封装** - Axios + 统一响应处理 + JWT Token 认证
- ✅ **路由与权限** - Vue Router + 导航守卫 + 动态路由权限
- ✅ **进度提示** - nprogress + HTTP 拦截器 + 路由守卫
- ✅ **页面布局** - Element Plus 左右布局 + 顶部导航栏
- ✅ **主题系统** - CSS 变量 + 亮色/暗色模式 + Element Plus 主题
- ✅ **样式架构** - Tailwind CSS 4.x + 自定义组件类
- ✅ **状态管理** - Pinia Store（auth, employee, organization, position, sync, app）
- ✅ **监控模块** - 同步批次列表、批次详情、日志查看、触发同步
- ✅ **基础数据模块** - 员工列表、组织树、职务列表
- ✅ **业务组件** - 数据卡片、筛选器、表格、表单

### 不包含的功能

- ❌ **后端开发** - 前端项目，不包含后端 API 实现
- ❌ **数据库设计** - 仅使用后端提供的 API 接口
- ❌ **移动端适配** - 初期仅支持桌面端浏览器
- ❌ **国际化** - 初期仅支持简体中文
- ❌ **自定义报表构建器** - 未来扩展功能

---

## 架构

### 组件结构

```
前端应用
├── 认证层
│   ├── LoginPage - 登录页面
│   └── AuthGuard - 路由守卫
│
├── 布局层
│   ├── DefaultLayout - 默认布局（左右结构）
│   ├── Sidebar - 侧边栏菜单
│   ├── Header - 顶部导航栏
│   └── Main - 主内容区域
│
├── 监控模块
│   ├── SyncMonitorPage - 同步监控页面
│   ├── SyncBatchListPage - 批次列表页
│   ├── SyncBatchDetailPage - 批次详情页
│   ├── SyncTriggerDialog - 触发同步对话框
│   └── SyncLogTable - 日志表格组件
│
├── 基础数据模块
│   ├── EmployeeListPage - 员工列表页
│   ├── EmployeeDetailPage - 员工详情页
│   ├── OrganizationTreePage - 组织树页
│   └── PositionListPage - 职务列表页
│
└── 通用组件
    ├── DataCard - 数据统计卡片
    ├── FilterPanel - 筛选面板
    ├── PageHeader - 页面头部
    └── EmptyState - 空状态占位符
```

### Pinia Store 状态

```typescript
// 认证状态 (auth)
interface AuthState {
  token: string | null
  refreshToken: string | null
  userInfo: User | null
  permissions: string[]
}

// 员工状态 (employee)
interface EmployeeState {
  list: Employee[]
  total: number
  loading: boolean
  filters: EmployeeFilters
  currentEmployee: Employee | null
}

// 组织状态 (organization)
interface OrganizationState {
  tree: Organization[]
  loading: boolean
  organizationMap: Map<string, Organization>
}

// 职务状态 (position)
interface PositionState {
  list: Position[]
  total: number
  loading: boolean
  filters: PositionFilters
}

// 同步任务状态 (sync)
interface SyncState {
  batches: SyncBatch[]
  pagination: PaginationInfo
  filters: SyncBatchFilters
  currentBatch: SyncBatch | null
  currentLogs: SyncLog[]
  loading: boolean
}

// 应用状态 (app)
interface AppState {
  theme: 'light' | 'dark'
  sidebarCollapsed: boolean
  menuList: MenuItem[]
  breadcrumbs: Breadcrumb[]
}
```

### 路由结构

```typescript
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: { title: '监控中心', permission: 'dashboard:view' }
      },
      {
        path: 'employees',
        name: 'EmployeeList',
        component: EmployeeListPage,
        meta: { title: '员工列表', permission: 'employee:view' }
      },
      {
        path: 'organizations',
        name: 'OrganizationTree',
        component: OrganizationTreePage,
        meta: { title: '组织架构', permission: 'organization:view' }
      },
      {
        path: 'positions',
        name: 'PositionList',
        component: PositionListPage,
        meta: { title: '职务列表', permission: 'position:view' }
      },
      {
        path: 'sync/batches',
        name: 'SyncBatchList',
        component: SyncBatchListPage,
        meta: { title: '同步批次', permission: 'sync:view' }
      },
      {
        path: 'sync/batches/:id',
        name: 'SyncBatchDetail',
        component: SyncBatchDetailPage,
        meta: { title: '批次详情', permission: 'sync:view' }
      }
    ]
  }
]
```

---

## 测试策略

### 单元测试（Vitest）

**测试目标：**

- Store Actions 和 Getters（80%+ 覆盖率）
- 工具函数（100% 覆盖率）
- 组件逻辑（关键组件 80%+ 覆盖率）

**测试套件：**

```typescript
// tests/stores/auth.test.ts - 认证 Store 测试
describe('Auth Store', () => {
  it('should login successfully', async () => {
    const authStore = useAuthStore()
    await authStore.login({ username: 'test', password: 'test123' })
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.token).toBeTruthy()
  })

  it('should check permission correctly', () => {
    const authStore = useAuthStore()
    authStore.permissions = ['employee:view', 'organization:view']
    expect(authStore.hasPermission('employee:view')).toBe(true)
    expect(authStore.hasPermission('admin:manage')).toBe(false)
  })
})

// tests/utils/validation.test.ts - 验证工具测试
describe('Validation Utils', () => {
  it('should validate page number', () => {
    expect(validatePageNum(1)).toBe(true)
    expect(validatePageNum(0)).toBe(false)
    expect(validatePageNum(-1)).toBe(false)
  })

  it('should validate page size', () => {
    expect(validatePageSize(20)).toBe(true)
    expect(validatePageSize(0)).toBe(false)
    expect(validatePageSize(101)).toBe(false)
  })
})

// tests/components/DataCard.test.ts - 组件测试
describe('DataCard Component', () => {
  it('should render title and value', () => {
    const wrapper = mount(DataCard, {
      props: {
        title: '员工总数',
        value: 1654
      }
    })
    expect(wrapper.text()).toContain('员工总数')
    expect(wrapper.text()).toContain('1654')
  })
})
```

**覆盖率目标：**

- `src/stores/`: 80%+
- `src/utils/`: 100%
- `src/components/`: 80%+（业务组件）

### E2E 测试

**测试场景：**

1. **用户登录流程**
   - 访问登录页
   - 输入用户名密码
   - 登录成功跳转首页
   - 验证用户信息显示

2. **员工列表查询**
   - 访问员工列表页
   - 加载员工数据
   - 使用关键词搜索
   - 翻页操作
   - 查看员工详情

3. **同步任务触发**
   - 访问同步监控页
   - 点击触发同步按钮
   - 确认触发对话框
   - 触发成功提示
   - 批次列表刷新

4. **主题切换**
   - 点击主题切换按钮
   - 验证 dark 类应用到 HTML
   - 验证主题色变化

5. **权限控制**
   - 无权限用户访问受限页面
   - 跳转到 403 页面

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from 'vitest'

test('user can login successfully', async ({ page }) => {
  await page.goto('/login')

  // 输入用户名密码
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'admin123')

  // 点击登录
  await page.click('button[type="submit"]')

  // 验证跳转到首页
  await expect(page).toHaveURL('/dashboard')

  // 验证用户信息显示
  await expect(page.locator('.user-info')).toContainText('admin')
})
```

---

## 可观测性

### Sentry 集成

**错误追踪点：**

1. **全局错误处理器** - 捕获未处理异常
2. **Axios 拦截器** - 捕获 API 错误
3. **路由守卫** - 捕获路由错误
4. **组件错误边界** - 捕获组件渲染错误

**上下文元数据：**

```typescript
Sentry.captureException(error, {
  tags: {
    type: 'api-error',
    status: response?.status,
  },
  extra: {
    url: error.config?.url,
    method: error.config?.method,
    requestId: response?.headers['x-request-id'],
    userId: authStore.userInfo?.id,
  },
  user: {
    id: authStore.userInfo?.id,
    username: authStore.userInfo?.username,
    email: authStore.userInfo?.email,
  },
})
```

**初始化配置：**

```typescript
// src/utils/sentry.ts
import * as Sentry from '@sentry/vue'

export const initSentry = (app: App) => {
  if (import.meta.env.PROD) {
    Sentry.init({
      app,
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.BrowserTracing({
          routingInstrumentation: Sentry.vueRouterInstrumentation(router),
        }),
      ],
      beforeSend(event) {
        // 过滤敏感信息
        if (event.request?.headers?.Authorization) {
          delete event.request.headers.Authorization
        }
        return event
      },
    })
  }
}
```

---

## 依赖

### 核心依赖

| 依赖         | 版本     | 用途        |
| ------------ | -------- | ----------- |
| vue          | ^3.5.24  | 前端框架    |
| typescript   | ~5.9.3   | 类型系统    |
| pinia        | ^3.0.4   | 状态管理    |
| vue-router   | ^4.6.4   | 路由管理    |
| axios        | ^1.13.2  | HTTP 客户端 |
| element-plus | ^2.13.0  | UI 组件库   |
| tailwindcss  | ^4.1.18  | CSS 框架    |
| nprogress    | (需安装) | 进度条      |

### 开发依赖

| 依赖        | 版本                    | 用途                |
| ----------- | ----------------------- | ------------------- |
| vite        | npm:rolldown-vite@7.2.5 | 构建工具            |
| vitest      | ^4.0.16                 | 测试框架            |
| oxlint      | ^1.34.0                 | 代码检查            |
| oxfmt       | ^0.19.0                 | 代码格式化          |
| vue-tsc     | ^3.1.4                  | TypeScript 类型检查 |
| husky       | ^9.1.7                  | Git 钩子            |
| lint-staged | ^16.2.7                 | 暂存区检查          |

### 待安装依赖

```bash
# 安装 nprogress
pnpm add nprogress
pnpm add -D @types/nprogress

# 安装 Sentry（可选）
pnpm add @sentry/vue
```

---

## 成功标准

### 功能完整性

- [x] 所有宪法检查通过
- [ ] 所有核心页面实现（登录、监控、员工、组织、职务）
- [ ] 所有 API 接口集成完成
- [ ] 路由权限控制正常工作
- [ ] 主题切换功能正常

### 代码质量

- [ ] 所有测试通过，覆盖率达标
- [ ] 无 linter 错误
- [ ] 无 TypeScript 类型错误
- [ ] 代码通过 Code Review

### 性能指标

- [ ] 首屏加载时间 < 3s（开发环境）
- [ ] 页面切换响应时间 < 500ms
- [ ] 列表数据加载时间 < 2s（1000 条数据）
- [ ] 构建产物大小 < 1MB (gzipped)

### 用户体验

- [ ] 所有操作有加载提示（nprogress）
- [ ] 所有错误有友好提示（ElMessage）
- [ ] 页面布局响应式适配
- [ ] 主题色一致性（Element Plus + Tailwind CSS）

---

## 实施计划

### Phase 1: 基础架构（1-2 天）

**任务：**

1. 安装依赖（nprogress, @sentry/vue）
2. 配置 Tailwind CSS 主题（颜色、间距等）
3. 实现 Axios 请求封装（拦截器、错误处理）
4. 实现 nprogress 集成（HTTP + 路由）
5. 创建基础布局组件（DefaultLayout, Sidebar, Header）
6. 配置路由和导航守卫
7. 实现主题切换功能

**验收标准：**

- ✅ Axios 拦截器正常工作，统一处理响应
- ✅ nprogress 在请求和路由切换时显示
- ✅ 布局组件渲染正常，侧边栏可折叠
- ✅ 路由守卫拦截未认证访问
- ✅ 主题切换正常，CSS 变量生效

### Phase 2: 认证模块（1 天）

**任务：**

1. 创建 Auth Store（login, logout, refreshToken）
2. 实现登录页面（表单验证、错误提示）
3. 实现权限检查逻辑（hasPermission）
4. 集成 API 接口（/api/auth/login）
5. 实现 Token 刷新机制

**验收标准：**

- ✅ 用户可以登录和登出
- ✅ Token 存储到 localStorage
- ✅ 401 自动跳转登录页
- ✅ 权限检查函数正常工作

### Phase 3: 基础数据模块（2-3 天）

**任务：**

1. 创建 Employee Store 和 API 接口
2. 实现员工列表页（分页、搜索、表格）
3. 实现员工详情页
4. 创建 Organization Store 和 API 接口
5. 实现组织树页面（Tree 组件、搜索）
6. 创建 Position Store 和 API 接口
7. 实现职务列表页（分页、搜索）

**验收标准：**

- ✅ 员工列表正常加载和展示
- ✅ 搜索和分页功能正常
- ✅ 组织树正常展示，支持展开/收起
- ✅ 职务列表正常加载

### Phase 4: 监控模块（2-3 天）

**任务：**

1. 创建 Sync Store 和 API 接口
2. 实现监控中心页（数据卡片、批次列表）
3. 实现触发同步对话框
4. 实现批次详情页
5. 实现批次日志查看
6. 实现完整同步流程状态展示

**验收标准：**

- ✅ 监控中心展示同步统计数据
- ✅ 批次列表正常加载，支持筛选
- ✅ 可以触发同步任务
- ✅ 批次详情和日志正常展示

### Phase 5: 业务组件（1-2 天）

**任务：**

1. 实现 DataCard 组件（统计卡片）
2. 实现 FilterPanel 组件（筛选面板）
3. 实现 PageHeader 组件（页面头部）
4. 实现 EmptyState 组件（空状态）
5. 优化表格样式（Tailwind CSS）

**验收标准：**

- ✅ 所有业务组件可复用
- ✅ 组件 Props 和 Emits 类型完整
- ✅ 组件样式符合设计规范

### Phase 6: 测试与优化（1-2 天）

**任务：**

1. 编写 Store 单元测试
2. 编写工具函数测试
3. 编写关键组件测试
4. 编写 E2E 测试（登录、查询、同步）
5. 性能优化（代码分割、懒加载）
6. 集成 Sentry（可选）

**验收标准：**

- ✅ 测试覆盖率达标
- ✅ 所有测试通过
- ✅ 性能指标达标
- ✅ Sentry 正常上报错误（如启用）

---

## 风险与缓解

### 风险 1: Element Plus 与 Tailwind CSS 样式冲突

**影响：** 组件样式可能不符合预期

**缓解措施：**

- 使用 Tailwind 的 `important` 策略提高优先级
- Element Plus 使用默认样式，Tailwind 只用于布局和间距
- 建立样式优先级规范

### 风险 2: TypeScript 类型错误

**影响：** 编译失败，开发阻塞

**缓解措施：**

- 使用 `vue-tsc` 持续检查类型
- 为所有 API 响应定义完整类型
- 避免使用 `any`，使用 `unknown` 替代

### 风险 3: 权限控制复杂度

**影响：** 权限逻辑难以维护

**缓解措施：**

- 使用路由 meta 统一管理权限标识
- 封装 `usePermission` 组合式函数
- 后端返回权限列表，前端只做匹配

### 风险 4: 后端 API 未就绪

**影响：** 前端开发阻塞

**缓解措施：**

- 使用 Mock Service Worker (MSW) 模拟 API
- 基于 API 契约文档先行开发
- 定义清晰的接口边界

---

## 文档产物

### 已生成文档

1. ✅ **research.md** - 技术研究文档（认证、路由、主题等）
2. ✅ **data-model.md** - 数据模型文档（类型定义、Store 设计）
3. ✅ **contracts/api-client.ts** - API 接口定义
4. ✅ **contracts/README.md** - API 契约说明
5. ✅ **quickstart.md** - 快速入门指南
6. ✅ **plan.md** - 实现计划（本文档）

### 参考文档

- **功能规范**: `specs/001-data-analysis-platform/spec.md`
- **API 参考**: `docs/api-reference.md`
- **项目宪法**: `.specify/memory/constitution.md`

---

## 下一步行动

### 立即行动

1. **安装缺失依赖**

   ```bash
   pnpm add nprogress
   pnpm add -D @types/nprogress
   ```

2. **创建目录结构**

   ```bash
   mkdir -p src/{api,composables,layouts,stores,utils,views/{login,dashboard,employee,organization,position,sync}}
   ```

3. **开始 Phase 1 实施**
   - 配置 Tailwind CSS 主题
   - 实现 Axios 封装
   - 创建布局组件

### 持续行动

- 每日 standup 同步进度
- 完成一个 Phase 后进行 Code Review
- 持续更新本文档

---

## 总结

本实现计划涵盖了数据分析平台前端的完整设计和实施路径：

1. ✅ **架构设计** - 组件结构、状态管理、路由设计
2. ✅ **测试策略** - 单元测试 + E2E 测试，覆盖率目标明确
3. ✅ **可观测性** - Sentry 集成方案
4. ✅ **实施计划** - 6 个阶段，共 8-12 天
5. ✅ **风险管理** - 4 个主要风险和缓解措施
6. ✅ **文档产物** - 完整的设计文档集

**关键里程碑：**

- **Day 1-2**: 基础架构完成
- **Day 3**: 认证模块完成
- **Day 4-6**: 基础数据模块完成
- **Day 7-9**: 监控模块完成
- **Day 10-11**: 业务组件完成
- **Day 12**: 测试与优化完成

**准备开始编码！** 🚀
