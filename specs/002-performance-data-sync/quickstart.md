# 快速开始：绩效数据同步功能

本文档提供绩效数据同步功能的快速开发指南。

---

## 功能概述

绩效数据同步功能包括：

1. **绩效数据列表** - 展示从第三方系统同步的绩效数据
2. **绩效数据同步** - 手动触发绩效数据同步（增量/全量）
3. **数据筛选** - 支持按年份、季度、员工、组织、评级等筛选
4. **分页展示** - 支持分页浏览绩效数据

---

## 开发步骤

### 步骤 1: 创建类型定义

创建 `src/types/performance.ts`：

```typescript
/**
 * 绩效数据
 */
export interface PerformanceReport {
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

/**
 * 绩效数据查询参数
 */
export interface PerformanceReportQueryParams {
  page?: number
  pageSize?: number
  year?: number
  quarter?: string
  employee_name?: string
  employee_user_id?: string
  organization_path_ids?: string
  performance_rating?: string
}

/**
 * 绩效数据同步请求
 */
export interface PerformanceSyncRequest {
  sync_type?: 'incremental' | 'full'
  external_system_id?: string
  time_range_start?: string
  time_range_end?: string
}
```

### 步骤 2: 扩展 API 客户端

在 `src/api/index.ts` 中添加绩效数据接口：

```typescript
import type {
  PerformanceReport,
  PerformanceReportQueryParams,
  PerformanceSyncRequest,
} from '@/types/performance'

/**
 * 获取绩效数据列表
 */
export async function getPerformanceReports(
  params?: PerformanceReportQueryParams,
): Promise<PaginatedResponse<PerformanceReport>> {
  const response = await request.get<UnifiedResponse<PaginatedResponse<PerformanceReport>>>(
    '/api/v1/performance-reports',
    { params },
  )
  return response.data.data
}

/**
 * 触发绩效数据同步
 */
export async function triggerPerformanceSync(
  data?: PerformanceSyncRequest,
): Promise<SimpleResponse> {
  const response = await request.post<UnifiedResponse<SimpleResponse>>(
    '/api/v1/sync/performance-reports',
    data,
  )
  return response.data.data
}
```

### 步骤 3: 创建 Pinia Store

创建 `src/stores/performance.ts`：

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPerformanceReports, triggerPerformanceSync } from '@/api'
import type {
  PerformanceReport,
  PerformanceReportQueryParams,
  PerformanceSyncRequest,
} from '@/types/performance'

export const usePerformanceStore = defineStore('performance', () => {
  // State
  const reports = ref<PerformanceReport[]>([])
  const total = ref(0)
  const loading = ref(false)
  const filters = ref<PerformanceReportQueryParams>({})
  const currentPage = ref(1)
  const pageSize = ref(10)

  const syncing = ref(false)
  const syncStatus = ref<'idle' | 'syncing' | 'success' | 'failed'>('idle')
  const syncError = ref<string | null>(null)

  // Getters
  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasReports = computed(() => reports.value.length > 0)

  // Actions
  async function fetchReports(params?: PerformanceReportQueryParams) {
    loading.value = true
    try {
      const queryParams = {
        page: currentPage.value,
        pageSize: pageSize.value,
        ...filters.value,
        ...params,
      }
      const response = await getPerformanceReports(queryParams)
      reports.value = response.list
      total.value = response.total
    } catch (error) {
      console.error('获取绩效数据失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function triggerSync(data?: PerformanceSyncRequest) {
    syncing.value = true
    syncStatus.value = 'syncing'
    syncError.value = null
    try {
      await triggerPerformanceSync(data)
      syncStatus.value = 'success'
      // 同步成功后刷新列表
      await fetchReports()
    } catch (error) {
      syncStatus.value = 'failed'
      syncError.value = error instanceof Error ? error.message : '同步失败'
      throw error
    } finally {
      syncing.value = false
    }
  }

  function updateFilters(newFilters: Partial<PerformanceReportQueryParams>) {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1 // 重置到第一页
  }

  function resetFilters() {
    filters.value = {}
    currentPage.value = 1
  }

  return {
    reports,
    total,
    loading,
    filters,
    currentPage,
    pageSize,
    syncing,
    syncStatus,
    syncError,
    totalPages,
    hasReports,
    fetchReports,
    triggerSync,
    updateFilters,
    resetFilters,
  }
})
```

### 步骤 4: 创建页面组件

创建 `src/views/performance/PerformanceReportListPage.vue`：

```vue
<template>
  <div class="performance-report-list-page">
    <PageHeader title="绩效数据列表">
      <template #actions>
        <el-button
          type="primary"
          :loading="performanceStore.syncing"
          @click="handleSync"
        >
          同步数据
        </el-button>
      </template>
    </PageHeader>

    <FilterPanel>
      <el-form :model="filters" inline>
        <el-form-item label="年份">
          <el-input-number
            v-model="filters.year"
            :min="2000"
            :max="2100"
            placeholder="年份"
            clearable
          />
        </el-form-item>
        <el-form-item label="季度">
          <el-select v-model="filters.quarter" placeholder="季度" clearable>
            <el-option label="Q1" value="Q1" />
            <el-option label="Q2" value="Q2" />
            <el-option label="Q3" value="Q3" />
            <el-option label="Q4" value="Q4" />
          </el-select>
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-input
            v-model="filters.employee_name"
            placeholder="员工姓名"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </FilterPanel>

    <el-table
      :data="performanceStore.reports"
      v-loading="performanceStore.loading"
      style="width: 100%"
    >
      <el-table-column prop="employee_name" label="员工姓名" width="120" />
      <el-table-column prop="employee_user_id" label="员工ID" width="120" />
      <el-table-column prop="year" label="年份" width="80" />
      <el-table-column prop="quarter" label="季度" width="80" />
      <el-table-column
        prop="organization_full_name"
        label="组织"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="performance_rating" label="绩效评级" width="100" />
      <el-table-column prop="last_synced_at" label="最后同步时间" width="180" />
    </el-table>

    <el-pagination
      v-model:current-page="performanceStore.currentPage"
      v-model:page-size="performanceStore.pageSize"
      :total="performanceStore.total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handlePageSizeChange"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePerformanceStore } from '@/stores/performance'
import PageHeader from '@/components/common/PageHeader.vue'
import FilterPanel from '@/components/common/FilterPanel.vue'
import type { PerformanceReportQueryParams } from '@/types/performance'
import { ElMessage } from 'element-plus'

const performanceStore = usePerformanceStore()

const filters = ref<PerformanceReportQueryParams>({
  year: undefined,
  quarter: undefined,
  employee_name: undefined,
})

// 搜索
function handleSearch() {
  performanceStore.updateFilters(filters.value)
  performanceStore.fetchReports()
}

// 重置
function handleReset() {
  filters.value = {}
  performanceStore.resetFilters()
  performanceStore.fetchReports()
}

// 分页
function handlePageChange(page: number) {
  performanceStore.currentPage = page
  performanceStore.fetchReports()
}

function handlePageSizeChange(size: number) {
  performanceStore.pageSize = size
  performanceStore.currentPage = 1
  performanceStore.fetchReports()
}

// 同步
async function handleSync() {
  try {
    await performanceStore.triggerSync({ sync_type: 'incremental' })
    ElMessage.success('同步成功')
  } catch (error) {
    ElMessage.error('同步失败')
  }
}

// 初始化
onMounted(() => {
  performanceStore.fetchReports()
})
</script>
```

### 步骤 5: 添加路由

在 `src/router/routes.ts` 中添加路由：

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
      meta: { title: '绩效数据列表', requiresAuth: true },
    },
  ],
}
```

---

## 测试

### 单元测试

创建 `tests/stores/performance.test.ts`：

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePerformanceStore } from '@/stores/performance'

describe('Performance Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should fetch reports', async () => {
    const store = usePerformanceStore()
    await store.fetchReports()
    expect(store.reports).toBeDefined()
  })

  it('should trigger sync', async () => {
    const store = usePerformanceStore()
    await store.triggerSync({ sync_type: 'incremental' })
    expect(store.syncStatus).toBe('success')
  })
})
```

### E2E 测试

创建 `tests/e2e/performance-sync.spec.ts`：

```typescript
import { test, expect } from '@playwright/test'

test('绩效数据列表加载', async ({ page }) => {
  await page.goto('/performance/reports')
  await expect(page.locator('text=绩效数据列表')).toBeVisible()
  await expect(page.locator('table')).toBeVisible()
})

test('触发绩效数据同步', async ({ page }) => {
  await page.goto('/performance/reports')
  await page.click('text=同步数据')
  await expect(page.locator('text=同步成功')).toBeVisible()
})
```

---

## 下一步

1. 完善筛选功能（添加更多筛选条件）
2. 添加数据导出功能
3. 优化性能（虚拟滚动、防抖等）
4. 添加同步状态实时更新（轮询或 WebSocket）

---

## 参考文档

- [实现计划](./plan.md)
- [数据模型](./data-model.md)
- [API 合约](./contracts/README.md)
