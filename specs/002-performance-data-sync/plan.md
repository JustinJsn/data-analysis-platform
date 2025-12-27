# 实现计划：绩效数据同步功能

**特性名称:** 绩效数据同步功能前端实现  
**规范版本:** 1.0  
**目标发布:** v1.0.0  
**日期:** 2025-12-27

---

## 特性概述

绩效数据同步功能是数据分析平台的重要组成部分，用于从多个第三方绩效管理系统同步员工绩效数据，为绩效分析和报表展示提供数据基础。

**核心功能：**

1. **绩效数据同步** - 支持手动触发和定时自动同步绩效数据
2. **绩效数据源列表** - 展示所有绩效数据源的配置和状态信息
3. **同步日志管理** - 记录和查询绩效数据同步的详细日志
4. **定时同步配置** - 为绩效数据源配置定时自动同步计划

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

- ✅ **绩效数据同步** - POST /api/v1/sync/performance-reports 接口调用
- ✅ **绩效数据列表** - GET /api/v1/performance-reports 接口调用，支持分页和筛选
- ✅ **绩效数据源列表展示** - 展示数据源配置和状态（后续扩展）
- ✅ **同步日志查看** - 查看绩效数据同步的详细日志（复用现有同步日志功能）
- ✅ **手动同步触发** - 支持增量同步和全量同步
- ✅ **状态管理** - Pinia Store（performance）管理绩效数据状态
- ✅ **业务组件** - 绩效数据列表组件、同步触发组件

### 不包含的功能

- ❌ **定时同步配置界面** - 初期仅支持手动同步，定时同步由后端管理
- ❌ **数据源管理界面** - 数据源配置由后端管理，前端仅展示状态
- ❌ **绩效数据可视化** - 由其他功能模块提供
- ❌ **绩效数据编辑** - 数据以源系统为准，不支持前端编辑

---

## 架构

### 组件结构

```
绩效数据同步模块
├── 绩效数据列表页
│   ├── PerformanceReportListPage - 绩效数据列表页面
│   ├── PerformanceReportTable - 绩效数据表格组件
│   └── PerformanceReportFilters - 绩效数据筛选组件
│
├── 同步触发功能
│   ├── PerformanceSyncTrigger - 同步触发组件（复用现有同步组件）
│   └── SyncStatusIndicator - 同步状态指示器
│
└── 通用组件
    ├── DataCard - 数据统计卡片（复用）
    ├── FilterPanel - 筛选面板（复用）
    └── PageHeader - 页面头部（复用）
```

### Pinia Store 状态

```typescript
// 绩效数据状态 (performance)
interface PerformanceState {
  // 绩效数据列表
  reports: PerformanceReport[]
  total: number
  loading: boolean
  filters: PerformanceReportFilters

  // 同步状态
  syncing: boolean
  syncProgress: number | null
  lastSyncTime: string | null
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed'
  syncError: string | null
}
```

### Vue Router 路由

```typescript
{
  path: '/performance',
  name: 'performance',
  component: DefaultLayout,
  meta: { title: '绩效数据', requiresAuth: true },
  children: [
    {
      path: 'reports',
      name: 'performance-reports',
      component: () => import('@/views/performance/PerformanceReportListPage.vue'),
      meta: { title: '绩效数据列表', requiresAuth: true }
    }
  ]
}
```

---

## API 接口

### 1. 绩效数据同步接口

**接口:** `POST /api/v1/sync/performance-reports`

**请求参数:**

```typescript
interface PerformanceSyncRequest {
  /** 同步类型：incremental（增量）或 full（全量） */
  sync_type?: 'incremental' | 'full'
  /** 外部系统ID（可选，不传则同步所有数据源） */
  external_system_id?: string
  /** 时间范围开始（可选，ISO 8601格式） */
  time_range_start?: string
  /** 时间范围结束（可选，ISO 8601格式） */
  time_range_end?: string
}
```

**响应:**

```typescript
interface PerformanceSyncResponse {
  message: string
  batch_id?: string
  status?: string
}
```

### 2. 绩效数据列表接口

**接口:** `GET /api/v1/performance-reports`

**查询参数:**

```typescript
interface PerformanceReportQueryParams {
  /** 页码 */
  page?: number
  /** 每页条数 */
  pageSize?: number
  /** 年份筛选 */
  year?: number
  /** 季度筛选 */
  quarter?: string
  /** 员工姓名搜索 */
  employee_name?: string
  /** 员工用户ID搜索 */
  employee_user_id?: string
  /** 组织路径ID筛选 */
  organization_path_ids?: string
  /** 绩效评级筛选 */
  performance_rating?: string
}
```

**响应:**

```typescript
interface PerformanceReportListResponse {
  list: PerformanceReport[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface PerformanceReport {
  id: string
  batch_id: string
  external_system_id: string
  year: number
  quarter: string
  employee_name: string
  employee_user_id: string
  organization_full_name: string
  organization_path_ids: string
  performance_rating: string
  last_synced_at: string
  created_at: string
  updated_at: string
}
```

---

## 数据模型

### PerformanceReport（绩效数据）

```typescript
/**
 * 绩效数据
 */
interface PerformanceReport {
  /** 绩效记录ID */
  id: string
  /** 同步批次ID */
  batch_id: string
  /** 外部系统ID */
  external_system_id: string
  /** 年份 */
  year: number
  /** 季度（Q1/Q2/Q3/Q4） */
  quarter: string
  /** 员工姓名 */
  employee_name: string
  /** 员工用户ID */
  employee_user_id: string
  /** 组织全名 */
  organization_full_name: string
  /** 组织路径ID（用/分隔） */
  organization_path_ids: string
  /** 绩效评级 */
  performance_rating: string
  /** 最后同步时间 */
  last_synced_at: string
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}
```

### PerformanceReportFilters（筛选条件）

```typescript
/**
 * 绩效数据筛选条件
 */
interface PerformanceReportFilters {
  /** 年份 */
  year?: number
  /** 季度 */
  quarter?: string
  /** 员工姓名 */
  employee_name?: string
  /** 员工用户ID */
  employee_user_id?: string
  /** 组织路径ID */
  organization_path_ids?: string
  /** 绩效评级 */
  performance_rating?: string
}
```

---

## 技术实现

### 1. API 客户端扩展

在 `src/api/index.ts` 中添加绩效数据相关接口：

```typescript
// 绩效数据同步
triggerPerformanceSync(data?: PerformanceSyncRequest): Promise<PerformanceSyncResponse>

// 获取绩效数据列表
getPerformanceReports(params?: PerformanceReportQueryParams): Promise<PaginatedResponse<PerformanceReport>>
```

### 2. Pinia Store 实现

创建 `src/stores/performance.ts`：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PerformanceReport, PerformanceReportFilters } from '@/types/performance'

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const reports = ref<PerformanceReport[]>([])
  const total = ref(0)
  const loading = ref(false)
  const filters = ref<PerformanceReportFilters>({})

  const syncing = ref(false)
  const syncProgress = ref<number | null>(null)
  const lastSyncTime = ref<string | null>(null)
  const syncStatus = ref<'idle' | 'syncing' | 'success' | 'failed'>('idle')
  const syncError = ref<string | null>(null)

  // Getters
  const totalPages = computed(() => Math.ceil(total.value / 10))

  // Actions
  async function fetchReports(params?: PerformanceReportQueryParams) {
    // 实现获取绩效数据列表
  }

  async function triggerSync(data?: PerformanceSyncRequest) {
    // 实现触发同步
  }

  return {
    reports,
    total,
    loading,
    filters,
    syncing,
    syncProgress,
    lastSyncTime,
    syncStatus,
    syncError,
    totalPages,
    fetchReports,
    triggerSync
  }
})
```

### 3. 类型定义

创建 `src/types/performance.ts`：

```typescript
// 包含所有绩效数据相关的类型定义
```

---

## 测试策略

### 单元测试

- **文件:** `tests/stores/performance.test.ts`
- **覆盖率目标:** 80%+
- **测试用例:**
  1. fetchReports - 获取绩效数据列表
  2. triggerSync - 触发同步
  3. 筛选条件更新
  4. 分页功能
  5. 错误处理

### E2E 测试

- **文件:** `tests/e2e/performance-sync.spec.ts`
- **场景:**
  1. 查看绩效数据列表
  2. 筛选绩效数据
  3. 触发绩效数据同步
  4. 查看同步状态

---

## 可观测性

### Sentry 集成

- **错误边界:** 绩效数据列表加载失败、同步失败
- **上下文元数据:**
  - 用户ID
  - 同步类型（增量/全量）
  - 数据源ID
  - 筛选条件
  - 错误详情

---

## 依赖

- **后端API:** `/api/v1/sync/performance-reports`, `/api/v1/performance-reports`
- **现有组件:** DataCard, FilterPanel, PageHeader（复用）
- **现有Store:** sync store（复用同步日志功能）

---

## 成功标准

- [ ] 所有宪法检查通过
- [ ] 所有测试通过，覆盖率目标达成
- [ ] 无 linter/type 错误
- [ ] Sentry 配置并测试
- [ ] 绩效数据列表正常加载和筛选
- [ ] 手动同步功能正常工作
- [ ] 同步状态正确显示

---

## 实施阶段

### Phase 1: 基础实现

1. 创建类型定义（`src/types/performance.ts`）
2. 扩展 API 客户端（`src/api/index.ts`）
3. 创建 Pinia Store（`src/stores/performance.ts`）
4. 创建绩效数据列表页面（`src/views/performance/PerformanceReportListPage.vue`）

### Phase 2: 功能完善

1. 实现筛选功能
2. 实现分页功能
3. 实现同步触发功能
4. 添加加载状态和错误处理

### Phase 3: 测试和优化

1. 编写单元测试
2. 编写 E2E 测试
3. 集成 Sentry 错误追踪
4. 性能优化

---

## 风险与缓解

### 风险1: API 接口变更

**缓解:** 使用 TypeScript 接口定义，类型检查可提前发现问题

### 风险2: 大数据量性能问题

**缓解:** 使用分页加载，限制单页数据量，添加虚拟滚动（如需要）

### 风险3: 同步状态实时更新

**缓解:** 使用轮询或 WebSocket（如后端支持）更新同步状态
