# 快速入门指南：数据分析平台前端开发

**版本:** 1.0  
**日期:** 2025-12-23  
**目标受众:** 前端开发人员

---

## 概述

本指南帮助开发人员快速上手数据分析平台前端开发，涵盖环境搭建、项目结构、核心概念和常见开发任务。

---

## 1. 环境准备

### 1.1 系统要求

- **Node.js**: 18.0+ 或 20.0+
- **pnpm**: 10.x（包管理器）
- **操作系统**: Windows 10+, macOS 10.15+, Linux
- **IDE**: VSCode（推荐）+ Volar 插件

### 1.2 安装依赖

```bash
# 克隆项目（如果需要）
git clone <repository-url>
cd data-analysis-platform

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 1.3 VSCode 插件推荐

- **Volar** - Vue 3 语言支持
- **Tailwind CSS IntelliSense** - Tailwind 自动完成
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化

---

## 2. 项目结构

```
data-analysis-platform/
├── src/
│   ├── api/                 # API 接口定义
│   │   └── index.ts         # API 服务实现
│   ├── assets/              # 静态资源
│   │   └── styles/          # 全局样式
│   │       ├── theme.css    # 主题变量
│   │       └── components.css # 自定义组件类
│   ├── components/          # 可复用组件
│   │   ├── common/          # 通用组件（按钮、卡片等）
│   │   └── business/        # 业务组件（数据卡片、筛选器等）
│   ├── composables/         # 组合式函数
│   │   ├── useTheme.ts      # 主题切换
│   │   └── usePermission.ts # 权限检查
│   ├── layouts/             # 布局组件
│   │   ├── DefaultLayout.vue # 默认布局（左右结构）
│   │   └── BlankLayout.vue   # 空白布局（登录页等）
│   ├── router/              # 路由配置
│   │   ├── index.ts         # 路由实例
│   │   ├── routes.ts        # 路由定义
│   │   └── guards.ts        # 导航守卫
│   ├── stores/              # Pinia 状态管理
│   │   ├── auth.ts          # 认证状态
│   │   ├── employee.ts      # 员工数据
│   │   ├── organization.ts  # 组织架构
│   │   ├── position.ts      # 职务数据
│   │   ├── sync.ts          # 同步任务
│   │   └── app.ts           # 全局应用状态
│   ├── types/               # TypeScript 类型定义
│   │   ├── index.ts         # 类型导出
│   │   ├── auth.ts          # 认证相关类型
│   │   ├── employee.ts      # 员工相关类型
│   │   └── ...              # 其他类型
│   ├── utils/               # 工具函数
│   │   ├── request.ts       # Axios 封装
│   │   ├── validation.ts    # 表单验证
│   │   ├── transform.ts     # 数据转换
│   │   └── sentry.ts        # Sentry 初始化
│   ├── views/               # 页面组件
│   │   ├── login/           # 登录页
│   │   ├── dashboard/       # 监控中心
│   │   ├── employee/        # 员工管理
│   │   ├── organization/    # 组织管理
│   │   ├── position/        # 职务管理
│   │   └── sync/            # 同步任务管理
│   ├── App.vue              # 根组件
│   └── main.ts              # 应用入口
├── specs/                   # 规范文档
│   └── 001-data-analysis-platform/
│       ├── spec.md          # 功能规范
│       ├── plan.md          # 实现计划
│       ├── research.md      # 技术研究
│       ├── data-model.md    # 数据模型
│       ├── contracts/       # API 契约
│       └── quickstart.md    # 快速入门（本文档）
├── tests/                   # 测试文件
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.ts       # Tailwind CSS 配置
└── .env.development         # 开发环境变量
```

---

## 3. 核心概念

### 3.1 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript 5.9+ (Strict Mode)
- **样式**: Tailwind CSS 4.x
- **UI 组件**: Element Plus 2.x
- **状态管理**: Pinia 3.x
- **路由**: Vue Router 4.x
- **HTTP 客户端**: Axios
- **构建工具**: Vite (Rolldown 变种)
- **包管理器**: pnpm 10.x

### 3.2 架构模式

#### 3.2.1 状态管理（Pinia）

```typescript
// src/stores/employee.ts
import { defineStore } from 'pinia'

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    list: [],
    total: 0,
    loading: false,
  }),

  getters: {
    hasData: (state) => state.list.length > 0,
  },

  actions: {
    async fetchList() {
      this.loading = true
      try {
        const response = await api.getEmployees(...)
        this.list = response.list
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
  },
})
```

#### 3.2.2 组件组合式 API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useEmployeeStore } from '@/stores/employee'

const employeeStore = useEmployeeStore()

const keyword = ref('')

const filteredEmployees = computed(() => {
  return employeeStore.list.filter(emp =>
    emp.name.includes(keyword.value)
  )
})

onMounted(() => {
  employeeStore.fetchList()
})
</script>

<template>
  <div class="p-6">
    <el-input v-model="keyword" placeholder="搜索员工" />
    <el-table :data="filteredEmployees" :loading="employeeStore.loading">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>
```

---

## 4. 常见开发任务

### 4.1 创建新页面

**步骤 1：创建页面组件**

```vue
<!-- src/views/example/ExamplePage.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const title = ref('示例页面')
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">{{ title }}</h1>
    <div class="card">
      <!-- 页面内容 -->
    </div>
  </div>
</template>
```

**步骤 2：添加路由**

```typescript
// src/router/routes.ts
export const routes = [
  // ... 其他路由
  {
    path: '/example',
    name: 'Example',
    component: () => import('@/views/example/ExamplePage.vue'),
    meta: {
      title: '示例页面',
      requiresAuth: true,
      permission: 'example:view',
    },
  },
]
```

**步骤 3：添加菜单项**

```typescript
// src/layouts/DefaultLayout.vue 或单独的菜单配置
const menuItems = [
  // ... 其他菜单
  {
    id: 'example',
    name: '示例',
    path: '/example',
    icon: 'Document',
    permission: 'example:view',
  },
]
```

---

### 4.2 创建 Pinia Store

```typescript
// src/stores/example.ts
import { defineStore } from 'pinia'
import api from '@/api'
import type { ExampleData, ExampleFilters } from '@/types'

interface ExampleState {
  data: ExampleData[]
  loading: boolean
  filters: ExampleFilters
}

export const useExampleStore = defineStore('example', {
  state: (): ExampleState => ({
    data: [],
    loading: false,
    filters: {
      pageNum: 1,
      pageSize: 20,
    },
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.data.length / state.filters.pageSize),
  },

  actions: {
    async fetchData() {
      this.loading = true
      try {
        this.data = await api.getExampleData(this.filters)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        this.loading = false
      }
    },

    setFilters(filters: Partial<ExampleFilters>) {
      this.filters = { ...this.filters, ...filters }
    },
  },
})
```

**使用 Store：**

```vue
<script setup lang="ts">
import { useExampleStore } from '@/stores/example'

const exampleStore = useExampleStore()

// 加载数据
exampleStore.fetchData()

// 更新筛选条件
const handleFilterChange = () => {
  exampleStore.setFilters({ pageNum: 1 })
  exampleStore.fetchData()
}
</script>
```

---

### 4.3 调用 API

**方式 1：在 Store 中调用（推荐）**

```typescript
// src/stores/employee.ts
export const useEmployeeStore = defineStore('employee', {
  actions: {
    async fetchList() {
      this.loading = true
      try {
        const response = await api.getEmployees(this.filters)
        this.list = response.list
        this.total = response.total
      } finally {
        this.loading = false
      }
    },
  },
})
```

**方式 2：在组件中直接调用**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const data = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    data.value = await api.getEmployees({ pageNum: 1, pageSize: 20 })
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}
</script>
```

---

### 4.4 权限控制

**路由权限：**

```typescript
// src/router/guards.ts
import { useAuthStore } from '@/stores/auth'

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // 需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  // 需要权限
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    next('/403')
    return
  }

  next()
})
```

**组件内权限：**

```vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <el-button
    v-if="authStore.hasPermission('employee:create')"
    type="primary"
    @click="handleCreate"
  >
    新增员工
  </el-button>
</template>
```

**使用组合式函数：**

```typescript
// src/composables/usePermission.ts
import { useAuthStore } from '@/stores/auth'

export const usePermission = () => {
  const authStore = useAuthStore()

  const hasPermission = (permission: string) => {
    return authStore.hasPermission(permission)
  }

  const hasAnyPermission = (permissions: string[]) => {
    return authStore.hasAnyPermission(permissions)
  }

  return {
    hasPermission,
    hasAnyPermission,
  }
}
```

---

### 4.5 主题切换

```vue
<script setup lang="ts">
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()

const toggleTheme = () => {
  appStore.toggleTheme()
}
</script>

<template>
  <el-button @click="toggleTheme">
    <el-icon v-if="appStore.theme === 'light'"><Sunny /></el-icon>
    <el-icon v-else><Moon /></el-icon>
  </el-button>
</template>
```

---

### 4.6 表单验证

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

const formRef = ref<FormInstance>()

const formData = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate((valid) => {
    if (valid) {
      // 提交表单
      console.log('Form valid:', formData)
    } else {
      console.log('Form invalid')
    }
  })
}
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" />
    </el-form-item>
    <el-form-item label="密码" prop="password">
      <el-input v-model="formData.password" type="password" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
    </el-form-item>
  </el-form>
</template>
```

---

## 5. 样式开发

### 5.1 使用 Tailwind CSS

```vue
<template>
  <!-- 布局类 -->
  <div class="flex items-center justify-between p-6">
    <!-- 文本类 -->
    <h1 class="text-2xl font-semibold text-gray-900">标题</h1>

    <!-- 间距类 -->
    <div class="space-x-4">
      <el-button>按钮1</el-button>
      <el-button>按钮2</el-button>
    </div>
  </div>

  <!-- 响应式 -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 卡片 -->
  </div>
</template>
```

### 5.2 自定义组件类

```css
/* src/assets/styles/components.css */
@layer components {
  .card {
    @apply bg-white rounded-lg shadow-sm p-6;
  }

  .page-title {
    @apply text-2xl font-semibold text-gray-900 mb-6;
  }
}
```

使用：

```vue
<template>
  <div class="p-6">
    <h1 class="page-title">页面标题</h1>
    <div class="card">
      <!-- 卡片内容 -->
    </div>
  </div>
</template>
```

### 5.3 主题变量

```vue
<template>
  <!-- 使用主题色 -->
  <div class="bg-primary text-white p-4">
    主题色背景
  </div>

  <!-- 使用 CSS 变量 -->
  <div :style="{ color: 'var(--color-primary)' }">
    自定义颜色
  </div>
</template>
```

---

## 6. 调试与测试

### 6.1 开发服务器

```bash
# 启动开发服务器
pnpm dev

# 启动并打开浏览器
pnpm dev --open

# 指定端口
pnpm dev --port 3000
```

### 6.2 类型检查

```bash
# 检查类型错误
pnpm run type-check

# 或使用 vue-tsc
vue-tsc --noEmit
```

### 6.3 代码质量检查

```bash
# 运行 oxlint
pnpm run lint

# 自动修复
pnpm run lint:fix

# 格式化代码
pnpm run format
```

### 6.4 单元测试

```bash
# 运行测试
pnpm test

# 监听模式
pnpm test -- --watch

# 生成覆盖率报告
pnpm test -- --coverage
```

---

## 7. 构建与部署

### 7.1 构建生产版本

```bash
# 构建
pnpm build

# 预览构建结果
pnpm preview
```

### 7.2 环境变量

```env
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=数据分析平台（开发）

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=数据分析平台
VITE_SENTRY_DSN=https://your-sentry-dsn
```

访问环境变量：

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const appTitle = import.meta.env.VITE_APP_TITLE
```

---

## 8. 常见问题

### 8.1 TypeScript 错误

**问题：** 提示 `Property 'xxx' does not exist on type 'ComponentPublicInstance'`

**解决：** 确保类型定义正确，使用 `ref<Type>()` 显式指定类型

```typescript
// ❌ 错误
const formRef = ref()

// ✅ 正确
import type { FormInstance } from 'element-plus'
const formRef = ref<FormInstance>()
```

### 8.2 Pinia Store 未响应

**问题：** 修改 Store 中的数据，组件未更新

**解决：** 确保使用 Pinia 的 actions 修改状态，不要直接修改

```typescript
// ❌ 错误
employeeStore.list.push(newEmployee)

// ✅ 正确
employeeStore.addEmployee(newEmployee)
```

### 8.3 路由跳转失败

**问题：** 使用 `router.push()` 无效

**解决：** 检查路由是否正确注册，权限是否满足

```typescript
// 检查路由定义
console.log(router.getRoutes())

// 检查权限
const authStore = useAuthStore()
console.log(authStore.permissions)
```

---

## 9. 最佳实践

### 9.1 组件命名

- **页面组件**: `XxxPage.vue` (如 `EmployeeListPage.vue`)
- **布局组件**: `XxxLayout.vue` (如 `DefaultLayout.vue`)
- **业务组件**: `XxxCard.vue`, `XxxTable.vue` (如 `EmployeeCard.vue`)
- **通用组件**: `BaseButton.vue`, `BaseDialog.vue`

### 9.2 文件组织

```
views/employee/
├── EmployeeListPage.vue        # 列表页
├── EmployeeDetailPage.vue      # 详情页
├── components/                 # 页面专用组件
│   ├── EmployeeFilter.vue      # 筛选器
│   └── EmployeeTable.vue       # 表格
└── index.ts                    # 导出
```

### 9.3 类型定义

```typescript
// ✅ 推荐：使用 interface
interface Employee {
  id: string
  name: string
}

// ✅ 推荐：使用 type 定义联合类型
type SyncStatus = 'running' | 'success' | 'failed'

// ❌ 避免：使用 any
const data: any = ...

// ✅ 推荐：使用具体类型
const data: Employee[] = ...
```

### 9.4 错误处理

```typescript
// ✅ 推荐：在 Store 中捕获错误
actions: {
  async fetchData() {
    this.loading = true
    try {
      this.data = await api.getData()
    } catch (error) {
      console.error('Failed to fetch data:', error)
      ElMessage.error('获取数据失败')
    } finally {
      this.loading = false
    }
  },
}
```

---

## 10. 资源链接

### 官方文档

- **Vue 3**: https://cn.vuejs.org/
- **TypeScript**: https://www.typescriptlang.org/
- **Pinia**: https://pinia.vuejs.org/zh/
- **Vue Router**: https://router.vuejs.org/zh/
- **Element Plus**: https://element-plus.org/zh-CN/
- **Tailwind CSS**: https://tailwindcss.com/
- **Vite**: https://vitejs.dev/

### 内部文档

- **功能规范**: `specs/001-data-analysis-platform/spec.md`
- **技术研究**: `specs/001-data-analysis-platform/research.md`
- **数据模型**: `specs/001-data-analysis-platform/data-model.md`
- **API 契约**: `specs/001-data-analysis-platform/contracts/`

---

## 11. 获取帮助

### 团队沟通

- **代码审查**: 提交 Pull Request 时详细描述改动
- **技术讨论**: 在团队会议或聊天群中讨论
- **问题反馈**: 创建 Issue 描述问题和复现步骤

### 学习资源

- **Vue 3 官方教程**: https://cn.vuejs.org/guide/introduction.html
- **TypeScript 入门**: https://www.typescriptlang.org/docs/handbook/intro.html
- **Tailwind CSS 实践**: https://tailwindcss.com/docs

---

## 总结

本快速入门指南涵盖了：

1. ✅ 环境搭建和项目结构
2. ✅ 核心概念和架构模式
3. ✅ 常见开发任务示例
4. ✅ 样式开发和主题定制
5. ✅ 调试、测试和部署
6. ✅ 常见问题和最佳实践

建议新开发人员按照本指南顺序学习，并通过实际开发任务加深理解。

**Happy Coding! 🚀**
