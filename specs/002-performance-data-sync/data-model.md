# 数据模型设计：绩效数据同步

**版本:** 1.0  
**日期:** 2025-12-27  
**状态:** 已完成

---

## 目的

本文档定义绩效数据同步功能的数据模型，包括状态管理（Pinia Store）、TypeScript 接口定义、数据流向和验证规则。

---

## 1. 核心数据实体

### 1.1 绩效数据相关

#### PerformanceReport（绩效数据）

```typescript
/**
 * 绩效数据
 * 对应后端 API 返回的绩效数据记录
 */
interface PerformanceReport {
  /** 绩效记录ID（主键） */
  id: string
  /** 同步批次ID（关联到同步批次） */
  batch_id: string
  /** 外部系统ID（关联到数据源） */
  external_system_id: string
  /** 年份 */
  year: number
  /** 季度（Q1/Q2/Q3/Q4） */
  quarter: string
  /** 员工姓名 */
  employee_name: string
  /** 员工用户ID（关联到用户数据） */
  employee_user_id: string
  /** 组织全名 */
  organization_full_name: string
  /** 组织路径ID（用/分隔，如：900612450/1725924/1981049） */
  organization_path_ids: string
  /** 绩效评级（如：A/B/C/D） */
  performance_rating: string
  /** 最后同步时间（ISO 8601格式） */
  last_synced_at: string
  /** 创建时间（ISO 8601格式） */
  created_at: string
  /** 更新时间（ISO 8601格式） */
  updated_at: string
}
```

**验证规则：**

- `id`: 必填，UUID格式
- `batch_id`: 必填，UUID格式
- `external_system_id`: 必填，UUID格式
- `year`: 必填，正整数，范围 2000-2100
- `quarter`: 必填，枚举值：'Q1' | 'Q2' | 'Q3' | 'Q4'
- `employee_name`: 必填，长度 1-50
- `employee_user_id`: 必填，长度 1-50
- `organization_full_name`: 必填，长度 1-500
- `organization_path_ids`: 必填，格式：数字ID用/分隔
- `performance_rating`: 必填，长度 1-10
- `last_synced_at`: 必填，ISO 8601格式
- `created_at`: 必填，ISO 8601格式
- `updated_at`: 必填，ISO 8601格式

#### PerformanceReportFilters（绩效数据筛选条件）

```typescript
/**
 * 绩效数据筛选条件
 * 用于查询绩效数据列表
 */
interface PerformanceReportFilters {
  /** 年份筛选 */
  year?: number
  /** 季度筛选 */
  quarter?: string
  /** 员工姓名搜索（模糊匹配） */
  employee_name?: string
  /** 员工用户ID搜索（精确匹配） */
  employee_user_id?: string
  /** 组织路径ID筛选（精确匹配） */
  organization_path_ids?: string
  /** 绩效评级筛选（精确匹配） */
  performance_rating?: string
}
```

**验证规则：**

- `year`: 可选，正整数，范围 2000-2100
- `quarter`: 可选，枚举值：'Q1' | 'Q2' | 'Q3' | 'Q4'
- `employee_name`: 可选，长度 1-50
- `employee_user_id`: 可选，长度 1-50
- `organization_path_ids`: 可选，格式：数字ID用/分隔
- `performance_rating`: 可选，长度 1-10

#### PerformanceSyncRequest（绩效数据同步请求）

```typescript
/**
 * 绩效数据同步请求
 * 用于触发绩效数据同步
 */
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

**验证规则：**

- `sync_type`: 可选，枚举值：'incremental' | 'full'，默认 'incremental'
- `external_system_id`: 可选，UUID格式
- `time_range_start`: 可选，ISO 8601格式，必须早于 time_range_end
- `time_range_end`: 可选，ISO 8601格式，必须晚于 time_range_start

#### PerformanceSyncResponse（绩效数据同步响应）

```typescript
/**
 * 绩效数据同步响应
 * 同步触发后的响应结果
 */
interface PerformanceSyncResponse {
  /** 响应消息 */
  message: string
  /** 批次ID（同步任务ID） */
  batch_id?: string
  /** 同步状态 */
  status?: string
}
```

---

## 2. Pinia Store 状态定义

### 2.1 Performance Store

```typescript
/**
 * 绩效数据 Store
 * 管理绩效数据列表、筛选条件、同步状态等
 */
interface PerformanceState {
  // ========== 绩效数据列表 ==========
  /** 绩效数据列表 */
  reports: PerformanceReport[]
  /** 总记录数 */
  total: number
  /** 加载状态 */
  loading: boolean
  /** 筛选条件 */
  filters: PerformanceReportFilters
  /** 当前页码 */
  currentPage: number
  /** 每页条数 */
  pageSize: number

  // ========== 同步状态 ==========
  /** 是否正在同步 */
  syncing: boolean
  /** 同步进度（0-100） */
  syncProgress: number | null
  /** 最后同步时间 */
  lastSyncTime: string | null
  /** 同步状态 */
  syncStatus: 'idle' | 'syncing' | 'success' | 'failed'
  /** 同步错误信息 */
  syncError: string | null
  /** 当前同步批次ID */
  currentBatchId: string | null
}

/**
 * Performance Store Getters
 */
interface PerformanceGetters {
  /** 总页数 */
  totalPages: number
  /** 是否有数据 */
  hasReports: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否可以触发同步 */
  canSync: boolean
}

/**
 * Performance Store Actions
 */
interface PerformanceActions {
  /** 获取绩效数据列表 */
  fetchReports(params?: PerformanceReportQueryParams): Promise<void>
  /** 触发绩效数据同步 */
  triggerSync(data?: PerformanceSyncRequest): Promise<void>
  /** 更新筛选条件 */
  updateFilters(filters: Partial<PerformanceReportFilters>): void
  /** 重置筛选条件 */
  resetFilters(): void
  /** 更新分页信息 */
  updatePagination(page: number, pageSize: number): void
  /** 检查同步状态 */
  checkSyncStatus(batchId: string): Promise<void>
}
```

---

## 3. API 接口定义

### 3.1 绩效数据列表接口

**接口:** `GET /api/v1/performance-reports`

**请求参数:**

```typescript
interface PerformanceReportQueryParams {
  /** 页码（从1开始） */
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
  /** 数据列表 */
  list: PerformanceReport[]
  /** 当前页码 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 总记录数 */
  total: number
  /** 总页数 */
  totalPages: number
}
```

### 3.2 绩效数据同步接口

**接口:** `POST /api/v1/sync/performance-reports`

**请求体:**

```typescript
interface PerformanceSyncRequest {
  sync_type?: 'incremental' | 'full'
  external_system_id?: string
  time_range_start?: string
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

---

## 4. 数据流向

### 4.1 绩效数据列表加载流程

```
用户操作
  ↓
PerformanceReportListPage.vue (组件)
  ↓
usePerformanceStore().fetchReports() (Store Action)
  ↓
api.getPerformanceReports() (API 调用)
  ↓
后端 API: GET /api/v1/performance-reports
  ↓
响应数据转换
  ↓
更新 Store State (reports, total, loading)
  ↓
组件响应式更新
```

### 4.2 绩效数据同步流程

```
用户触发同步
  ↓
PerformanceSyncTrigger.vue (组件)
  ↓
usePerformanceStore().triggerSync() (Store Action)
  ↓
api.triggerPerformanceSync() (API 调用)
  ↓
后端 API: POST /api/v1/sync/performance-reports
  ↓
更新同步状态 (syncing, syncStatus)
  ↓
轮询检查同步状态 (checkSyncStatus)
  ↓
同步完成，刷新数据列表
```

---

## 5. 数据转换规则

### 5.1 API 响应转换

后端返回的字段名使用 snake_case，前端需要转换为 camelCase：

```typescript
/**
 * 转换后端响应到前端模型
 */
function transformPerformanceReport(data: any): PerformanceReport {
  return {
    id: data.id,
    batchId: data.batch_id,
    externalSystemId: data.external_system_id,
    year: data.year,
    quarter: data.quarter,
    employeeName: data.employee_name,
    employeeUserId: data.employee_user_id,
    organizationFullName: data.organization_full_name,
    organizationPathIds: data.organization_path_ids,
    performanceRating: data.performance_rating,
    lastSyncedAt: data.last_synced_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  }
}
```

### 5.2 请求参数转换

前端使用 camelCase，发送到后端时转换为 snake_case：

```typescript
/**
 * 转换前端请求参数到后端格式
 */
function transformQueryParams(params: PerformanceReportQueryParams): any {
  return {
    page: params.page,
    page_size: params.pageSize,
    year: params.year,
    quarter: params.quarter,
    employee_name: params.employee_name,
    employee_user_id: params.employee_user_id,
    organization_path_ids: params.organization_path_ids,
    performance_rating: params.performance_rating
  }
}
```

---

## 6. 状态管理规则

### 6.1 筛选条件管理

- 筛选条件存储在 Store 的 `filters` 中
- 筛选条件变更时自动触发数据重新加载
- 支持筛选条件的重置功能

### 6.2 分页管理

- 分页信息存储在 Store 的 `currentPage` 和 `pageSize` 中
- 默认每页 10 条记录
- 分页变更时自动触发数据重新加载

### 6.3 同步状态管理

- 同步状态存储在 Store 的 `syncStatus` 中
- 同步进行时显示进度提示
- 同步完成后自动刷新数据列表
- 同步失败时显示错误信息

---

## 7. 错误处理

### 7.1 API 错误处理

```typescript
try {
  await performanceStore.fetchReports()
} catch (error) {
  // 记录错误到 Sentry
  Sentry.captureException(error, {
    tags: { module: 'performance' },
    extra: { filters: performanceStore.filters }
  })

  // 显示用户友好的错误提示
  ElMessage.error('加载绩效数据失败，请稍后重试')
}
```

### 7.2 数据验证错误

```typescript
/**
 * 验证绩效数据
 */
function validatePerformanceReport(data: any): data is PerformanceReport {
  if (!data.id || !data.batch_id || !data.external_system_id) {
    return false
  }
  if (!data.year || data.year < 2000 || data.year > 2100) {
    return false
  }
  if (!['Q1', 'Q2', 'Q3', 'Q4'].includes(data.quarter)) {
    return false
  }
  return true
}
```

---

## 8. 性能优化

### 8.1 数据缓存

- 绩效数据列表使用 Store 缓存，避免重复请求
- 筛选条件或分页变更时才重新请求

### 8.2 分页加载

- 使用分页加载，限制单次请求数据量
- 默认每页 10 条，可根据需要调整

### 8.3 防抖处理

- 搜索输入框使用防抖，避免频繁请求
- 筛选条件变更时使用防抖，减少请求次数

---

## 9. 类型安全

所有类型定义使用 TypeScript strict mode，确保：

- 无隐式 any
- 所有字段都有明确的类型
- 可选字段使用 `?` 标记
- 枚举值使用联合类型

---

## 10. 测试数据

### 10.1 Mock 数据示例

```typescript
const mockPerformanceReport: PerformanceReport = {
  id: '38d2595a-2129-4557-8e9e-fc4aea8b470c',
  batch_id: 'dee3a0f8-60af-48ae-8339-1a39e5e82d49',
  external_system_id: 'ac30999e-12b0-45ae-af7c-5c19aa3640aa',
  year: 2025,
  quarter: 'Q1',
  employee_name: '义捡妹',
  employee_user_id: '620538832',
  organization_full_name: '深圳市亿道控股有限公司/亿道数码/研发体系/质量管理部/PCBA MQA部',
  organization_path_ids: '900612450/1725924/1981049/1974860/1974867',
  performance_rating: 'B',
  last_synced_at: '2025-12-27T12:30:57.632041Z',
  created_at: '2025-12-27T12:30:57.633048Z',
  updated_at: '2025-12-27T12:30:57.633048Z'
}
```
