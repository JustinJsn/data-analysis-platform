# 快速开始：绩效数据报表功能

**版本:** 1.0  
**日期:** 2025-12-28

---

## 概述

本文档提供绩效数据报表功能的快速开始指南，包括功能概述、主要特性、使用示例和开发指南。

---

## 主要特性

### 1. 灵活的时间范围查询

- **年份段查询**: 支持单年或多年查询（如 2025~2023）
- **季度查询**: 支持精确的季度范围查询（如 2025-Q1~2025-Q4）
- **智能推算**: 选择开始时间和查询长度后，自动推算结束时间

### 2. 多维度筛选

- **人员筛选**: 支持多人员查询，使用虚拟列表优化性能
- **部门筛选**: 使用组织树选择部门，支持包含下级部门选项
- **组合查询**: 支持时间、人员、部门等多条件组合查询

### 3. 数据导出

- **批量导出**: 导出当前分页数据（前端处理）
- **全量导出**: 导出所有符合条件的数据（后端异步处理）
- **多格式支持**: 支持 Excel (.xlsx) 和 CSV 格式

### 4. 分页展示

- **服务端分页**: 支持大数据量查询
- **灵活配置**: 支持 10, 20, 50, 100 条/页

---

## 功能演示

### 场景1: 查询2025年全年绩效数据

```typescript
// 1. 设置查询参数
const queryParams = {
  start_year: 2025,
  end_year: 2025,
  page: 1,
  page_size: 20,
};

// 2. 调用查询API
const response = await performanceReportApi.getReports(queryParams);

// 3. 显示结果
console.log(`共 ${response.total} 条记录`);
console.log(response.list);
```

### 场景2: 查询2025年Q1到Q4的绩效数据

```typescript
// 1. 设置查询参数
const queryParams = {
  start_year_quarter: '2025-Q1',
  end_year_quarter: '2025-Q4',
  page: 1,
  page_size: 20,
};

// 2. 调用查询API
const response = await performanceReportApi.getReports(queryParams);
```

### 场景3: 查询特定人员的绩效数据

```typescript
// 1. 选择人员（通过人员选择器）
const selectedUserIds = ['user-001', 'user-002', 'user-003'];

// 2. 设置查询参数
const queryParams = {
  user_ids: selectedUserIds,
  page: 1,
  page_size: 20,
};

// 3. 调用查询API
const response = await performanceReportApi.getReports(queryParams);
```

### 场景4: 查询部门及其下级部门的绩效数据

```typescript
// 1. 选择部门（通过部门选择器）
const departmentId = 'dept-001';
const includeSubDepartments = true;

// 2. 设置查询参数
const queryParams = {
  department_id: departmentId,
  include_sub_departments: includeSubDepartments,
  page: 1,
  page_size: 20,
};

// 3. 调用查询API
const response = await performanceReportApi.getReports(queryParams);
```

### 场景5: 组合查询

```typescript
// 1. 设置组合查询参数
const queryParams = {
  start_year_quarter: '2025-Q1',
  end_year_quarter: '2025-Q3',
  department_id: 'dept-001',
  include_sub_departments: true,
  user_ids: ['user-001', 'user-002'],
  page: 1,
  page_size: 20,
};

// 2. 调用查询API
const response = await performanceReportApi.getReports(queryParams);
```

### 场景6: 批量导出

```typescript
// 1. 提交导出请求
const exportResponse = await performanceReportApi.exportReports({
  query_params: {
    page: 1,
    page_size: 20,
  },
  export_type: 'batch',
  format: 'xlsx',
});

// 2. 下载文件
if (exportResponse.file_url) {
  downloadFile(exportResponse.file_url, '绩效数据.xlsx');
}
```

### 场景7: 全量导出

```typescript
// 1. 提交导出任务
const exportResponse = await performanceReportApi.exportReports({
  query_params: {
    start_year: 2025,
    end_year: 2025,
  },
  export_type: 'all',
  format: 'xlsx',
});

// 2. 轮询检查任务状态
if (exportResponse.task_id) {
  const interval = setInterval(async () => {
    const status = await performanceReportApi.getExportTaskStatus(
      exportResponse.task_id!
    );

    if (status.status === 'completed') {
      // 下载文件
      downloadFile(status.file_url!, '绩效数据.xlsx');
      clearInterval(interval);
    } else if (status.status === 'failed') {
      console.error('导出失败:', status.error_message);
      clearInterval(interval);
    }
  }, 2000);
}
```

---

## 组件使用示例

### TimeRangeSelector（时间范围选择器）

```vue
<template>
  <TimeRangeSelector
    v-model:start-year="startYear"
    v-model:end-year="endYear"
    v-model:start-quarter="startQuarter"
    v-model:end-quarter="endQuarter"
    v-model:query-length="queryLength"
    mode="quarter"
    @change="handleTimeRangeChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TimeRangeSelector from '@/components/performance/TimeRangeSelector.vue';

const startYear = ref(2025);
const endYear = ref(2025);
const startQuarter = ref({ year: 2025, quarter: 1 });
const endQuarter = ref({ year: 2025, quarter: 4 });
const queryLength = ref(1);

function handleTimeRangeChange() {
  // 处理时间范围变化
  console.log('时间范围已更新');
}
</script>
```

### EmployeeSelector（人员选择器）

```vue
<template>
  <EmployeeSelector
    v-model="selectedUserIds"
    :multiple="true"
    :virtual-list="true"
    @change="handleEmployeeChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EmployeeSelector from '@/components/performance/EmployeeSelector.vue';

const selectedUserIds = ref<string[]>([]);

function handleEmployeeChange(userIds: string[]) {
  console.log('已选择人员:', userIds);
}
</script>
```

### DepartmentSelector（部门选择器）

```vue
<template>
  <DepartmentSelector
    v-model="selectedDepartmentId"
    v-model:include-sub="includeSubDepartments"
    @change="handleDepartmentChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DepartmentSelector from '@/components/performance/DepartmentSelector.vue';

const selectedDepartmentId = ref<string>('');
const includeSubDepartments = ref(false);

function handleDepartmentChange(departmentId: string, includeSub: boolean) {
  console.log('已选择部门:', departmentId, '包含下级:', includeSub);
}
</script>
```

---

## Store 使用示例

### 使用 PerformanceReportStore

```typescript
import { usePerformanceReportStore } from '@/stores/performance-report';

const store = usePerformanceReportStore();

// 查询绩效数据
await store.fetchRecords({
  start_year: 2025,
  end_year: 2025,
});

// 更新查询参数
store.updateQueryParams({
  department_id: 'dept-001',
  include_sub_departments: true,
});

// 更新分页
store.updatePagination(2, 50);

// 批量导出
await store.exportBatch('xlsx');

// 全量导出
await store.exportAll('xlsx');
```

---

## 工具函数使用示例

### 季度智能推算

```typescript
import { calculateEndQuarter } from '@/utils/quarter-calculator';

// 计算结束时间
const startQuarter = { year: 2025, quarter: 3 };
const queryLength = 3;
const endQuarter = calculateEndQuarter(startQuarter, queryLength);
// 结果: { year: 2023, quarter: 3 }
```

### 时间范围转换

```typescript
import { quarterToDateRange, yearRangeToDateRange } from '@/utils/date-range';

// 季度转换为日期范围
const quarter = { year: 2025, quarter: 1 };
const dateRange = quarterToDateRange(quarter);
// 结果: { start: 2025-01-01, end: 2025-03-31 }

// 年份段转换为日期范围
const dateRange2 = yearRangeToDateRange(2025, 2025);
// 结果: { start: 2025-01-01, end: 2025-12-31 }
```

---

## 开发指南

### 1. 安装依赖

```bash
# 安装 Excel 导出库
pnpm add xlsx
pnpm add -D @types/xlsx
```

### 2. 创建 API 客户端

```typescript
// src/api/performance-report.ts
import { request } from '@/utils/request';
import type {
  PerformanceReportQueryParams,
  PaginatedResponse,
  PerformanceRecord,
  ExportRequest,
  ExportResponse,
  ExportTaskStatus,
} from '@/types/performance-report';

export const performanceReportApi = {
  getReports(params?: PerformanceReportQueryParams) {
    return request.get<PaginatedResponse<PerformanceRecord>>(
      '/api/v1/performance-reports',
      { params }
    );
  },

  exportReports(request: ExportRequest) {
    return request.post<ExportResponse>(
      '/api/v1/performance-reports/export',
      request
    );
  },

  getExportTaskStatus(taskId: string) {
    return request.get<ExportTaskStatus>(
      `/api/v1/performance-reports/export/${taskId}/status`
    );
  },
};
```

### 3. 创建 Store

参考 `data-model.md` 中的 Store 设计。

### 4. 创建组件

参考 `plan.md` 中的组件设计。

---

## 测试示例

### 单元测试

```typescript
// tests/utils/quarter-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateEndQuarter } from '@/utils/quarter-calculator';

describe('季度智能推算', () => {
  it('应该正确计算结束时间', () => {
    const startQuarter = { year: 2025, quarter: 3 };
    const queryLength = 3;
    const endQuarter = calculateEndQuarter(startQuarter, queryLength);

    expect(endQuarter).toEqual({ year: 2023, quarter: 3 });
  });
});
```

### E2E 测试

```typescript
// tests/e2e/performance-report-query.spec.ts
import { test, expect } from '@playwright/test';

test('查询2025年绩效数据', async ({ page }) => {
  await page.goto('/performance/reports');

  // 选择年份
  await page.selectOption('[data-testid="start-year"]', '2025');
  await page.selectOption('[data-testid="end-year"]', '2025');

  // 点击查询
  await page.click('[data-testid="search-button"]');

  // 等待结果加载
  await page.waitForSelector('[data-testid="performance-table"]');

  // 验证结果
  const total = await page.textContent('[data-testid="total-count"]');
  expect(total).toBeTruthy();
});
```

---

## 常见问题

### Q1: 如何实现季度智能推算？

A: 使用 `calculateEndQuarter` 函数，传入开始时间和查询长度即可。

### Q2: 虚拟列表如何实现？

A: 使用 Element Plus Virtual Table (`el-table-v2`) 组件，参考 `research.md`。

### Q3: 全量导出如何实现？

A: 后端异步处理，前端轮询检查任务状态，参考场景7。

### Q4: 如何优化查询性能？

A:

- 使用服务端分页
- 实现查询结果缓存
- 优化数据库索引

---

## 相关文档

- [功能规范](./spec.md)
- [实现计划](./plan.md)
- [研究文档](./research.md)
- [数据模型](./data-model.md)
- [API合约](./contracts/api-client.ts)

---

## 更新日志

- **v1.0** (2025-12-28): 初始版本
