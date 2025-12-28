# 数据模型设计：绩效数据报表

**版本:** 1.0  
**日期:** 2025-12-28  
**状态:** 已完成

---

## 目的

本文档定义绩效数据报表功能的数据模型，包括TypeScript接口定义、Pinia Store结构、数据验证规则和状态转换。

---

## 1. 核心数据实体

### 1.1 绩效数据查询参数

#### PerformanceReportQueryParams（查询参数）

```typescript
/**
 * 绩效数据查询参数
 */
interface PerformanceReportQueryParams {
  // 年份段查询
  /** 开始年份 */
  start_year?: number;
  /** 结束年份 */
  end_year?: number;

  // 季度查询
  /** 开始时间（年份+季度，格式: "2025-Q1"） */
  start_year_quarter?: string;
  /** 结束时间（年份+季度，格式: "2025-Q4"） */
  end_year_quarter?: string;
  /** 查询长度（年数，1-10） */
  query_length?: number;

  // 人员查询
  /** 人员ID数组 */
  user_ids?: string[];

  // 部门查询
  /** 部门ID */
  department_id?: string;
  /** 是否包含下级部门 */
  include_sub_departments?: boolean;

  // 分页
  /** 页码（从1开始） */
  page?: number;
  /** 每页条数（10, 20, 50, 100） */
  page_size?: number;
}
```

**验证规则：**

- `start_year`, `end_year`: 可选，范围 2015-2030，结束年份 >= 开始年份
- `start_year_quarter`, `end_year_quarter`: 可选，格式 "YYYY-Q[1-4]"
- `query_length`: 可选，范围 1-10
- `user_ids`: 可选，数组，每个元素为字符串
- `department_id`: 可选，字符串
- `include_sub_departments`: 可选，布尔值，默认 false
- `page`: 可选，最小值 1，默认 1
- `page_size`: 可选，可选值 [10, 20, 50, 100]，默认 20

---

### 1.2 绩效数据记录

#### PerformanceRecord（绩效记录）

```typescript
/**
 * 绩效数据记录
 */
interface PerformanceRecord {
  /** 绩效记录ID（主键） */
  id: string;
  /** 同步批次ID */
  batch_id: string;
  /** 外部系统ID */
  external_system_id: string;
  /** 员工ID */
  employee_id: string;
  /** 员工姓名 */
  employee_name: string;
  /** 员工工号 */
  employee_number: string;
  /** 员工用户ID */
  employee_user_id: string;
  /** 部门ID */
  department_id: string;
  /** 部门名称 */
  department_name: string;
  /** 部门路径（如："A部门/B部门/C部门"） */
  department_path: string;
  /** 组织全名 */
  organization_full_name: string;
  /** 组织路径ID（用/分隔） */
  organization_path_ids: string;
  /** 年份 */
  year: number;
  /** 季度（Q1/Q2/Q3/Q4） */
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  /** 绩效评级 */
  performance_rating: string;
  /** 绩效指标列表 */
  performance_indicators?: PerformanceIndicator[];
  /** 评价人ID */
  evaluator_id?: string;
  /** 评价时间 */
  evaluated_at?: string;
  /** 最后同步时间 */
  last_synced_at: string;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at: string;
}
```

#### PerformanceIndicator（绩效指标）

```typescript
/**
 * 绩效指标
 */
interface PerformanceIndicator {
  /** 指标名称 */
  name: string;
  /** 指标值 */
  value: string | number;
  /** 指标类型 */
  type: 'number' | 'text' | 'rating';
}
```

---

### 1.3 时间范围相关

#### QuarterTime（季度时间）

```typescript
/**
 * 季度时间
 */
interface QuarterTime {
  /** 年份 */
  year: number;
  /** 季度（1-4） */
  quarter: 1 | 2 | 3 | 4;
}
```

#### TimeRange（时间范围）

```typescript
/**
 * 时间范围
 */
interface TimeRange {
  /** 开始时间 */
  start: Date;
  /** 结束时间 */
  end: Date;
}
```

**转换函数：**

```typescript
/**
 * 季度时间转换为日期范围
 */
function quarterToDateRange(quarter: QuarterTime): TimeRange {
  const quarterMonths = {
    1: { start: 0, end: 2 },   // Q1: 1-3月
    2: { start: 3, end: 5 },   // Q2: 4-6月
    3: { start: 6, end: 8 },  // Q3: 7-9月
    4: { start: 9, end: 11 }, // Q4: 10-12月
  };

  const { start: startMonth, end: endMonth } = quarterMonths[quarter.quarter];

  return {
    start: new Date(quarter.year, startMonth, 1, 0, 0, 0, 0),
    end: new Date(quarter.year, endMonth + 1, 0, 23, 59, 59, 999),
  };
}
```

---

### 1.4 人员选择器相关

#### Employee（人员信息）

```typescript
/**
 * 人员信息（用于选择器）
 */
interface Employee {
  /** 人员ID */
  id: string;
  /** 姓名 */
  name: string;
  /** 工号 */
  employeeNumber: string;
  /** 部门ID */
  departmentId: string;
  /** 部门名称 */
  departmentName: string;
  /** 部门路径（如："A部门/B部门/C部门"） */
  departmentPath: string;
  /** 邮箱 */
  email?: string;
  /** 手机号 */
  phone?: string;
}
```

#### EmployeeQueryParams（人员查询参数）

```typescript
/**
 * 人员查询参数
 */
interface EmployeeQueryParams {
  /** 搜索关键词（姓名、工号） */
  keyword?: string;
  /** 部门ID（可选） */
  department_id?: string;
  /** 页码 */
  page?: number;
  /** 每页条数 */
  page_size?: number;
}
```

---

### 1.5 部门选择器相关

#### Department（部门信息）

```typescript
/**
 * 部门信息（用于选择器）
 */
interface Department {
  /** 部门ID */
  id: string;
  /** 部门名称 */
  name: string;
  /** 部门编码 */
  code: string;
  /** 父部门ID（根部门为null） */
  parentId: string | null;
  /** 部门层级（根部门为1） */
  level: number;
  /** 部门路径（如："A部门/B部门/C部门"） */
  path: string;
  /** 子部门列表 */
  children?: Department[];
}
```

---

### 1.6 导出相关

#### ExportRequest（导出请求）

```typescript
/**
 * 导出请求
 */
interface ExportRequest {
  /** 查询参数 */
  query_params: PerformanceReportQueryParams;
  /** 导出类型：batch（批量）或 all（全量） */
  export_type: 'batch' | 'all';
  /** 导出格式：xlsx 或 csv */
  format: 'xlsx' | 'csv';
}
```

#### ExportResponse（导出响应）

```typescript
/**
 * 导出响应
 */
interface ExportResponse {
  /** 任务ID（全量导出） */
  task_id?: string;
  /** 文件URL（批量导出直接返回） */
  file_url?: string;
  /** 状态 */
  status: 'processing' | 'completed' | 'failed';
  /** 错误信息（失败时） */
  error_message?: string;
}
```

#### ExportTaskStatus（导出任务状态）

```typescript
/**
 * 导出任务状态
 */
interface ExportTaskStatus {
  /** 任务ID */
  task_id: string;
  /** 状态 */
  status: 'processing' | 'completed' | 'failed';
  /** 进度（0-100） */
  progress?: number;
  /** 文件URL（完成时） */
  file_url?: string;
  /** 错误信息（失败时） */
  error_message?: string;
}
```

---

## 2. Pinia Store 设计

### 2.1 PerformanceReportStore（绩效报表Store）

```typescript
// src/stores/performance-report.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  PerformanceRecord,
  PerformanceReportQueryParams,
} from '@/types/performance-report';
import { performanceReportApi } from '@/api/performance-report';
import { captureError, addBreadcrumb } from '@/utils/sentry';

export const usePerformanceReportStore = defineStore('performance-report', () => {
  // ==================== State ====================

  /** 绩效数据列表 */
  const records = ref<PerformanceRecord[]>([]);

  /** 总记录数 */
  const total = ref(0);

  /** 加载状态 */
  const loading = ref(false);

  /** 查询参数 */
  const queryParams = ref<PerformanceReportQueryParams>({
    page: 1,
    page_size: 20,
  });

  /** 当前页码 */
  const currentPage = ref(1);

  /** 每页条数 */
  const pageSize = ref(20);

  /** 导出状态 */
  const exporting = ref(false);

  /** 导出任务ID（全量导出） */
  const exportTaskId = ref<string | null>(null);

  // ==================== Getters ====================

  /** 总页数 */
  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value);
  });

  /** 是否有数据 */
  const hasRecords = computed(() => {
    return records.value.length > 0;
  });

  /** 是否可以导出 */
  const canExport = computed(() => {
    return !exporting.value && hasRecords.value;
  });

  // ==================== Actions ====================

  /**
   * 查询绩效数据
   */
  const fetchRecords = async (params?: Partial<PerformanceReportQueryParams>) => {
    try {
      loading.value = true;

      // 合并查询参数
      const mergedParams: PerformanceReportQueryParams = {
        ...queryParams.value,
        ...params,
        page: currentPage.value,
        page_size: pageSize.value,
      };

      const response = await performanceReportApi.getReports(mergedParams);
      records.value = response.list;
      total.value = response.total;

      // 更新查询参数
      queryParams.value = mergedParams;

      // 记录成功操作
      addBreadcrumb({
        message: '查询绩效数据成功',
        category: 'performance-report.fetchRecords',
        level: 'info',
        data: {
          page: currentPage.value,
          pageSize: pageSize.value,
          total: response.total,
        },
      });
    } catch (error) {
      records.value = [];
      total.value = 0;

      // 上报错误到 Sentry
      const err = error instanceof Error ? error : new Error(String(error));
      captureError(err, {
        type: 'Performance Report Fetch Error',
        queryParams: queryParams.value,
        fingerprint: ['performance-report-fetch-error'],
      });

      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新查询参数
   */
  const updateQueryParams = (params: Partial<PerformanceReportQueryParams>) => {
    queryParams.value = { ...queryParams.value, ...params };
    currentPage.value = 1; // 重置到第一页
  };

  /**
   * 重置查询参数
   */
  const resetQueryParams = () => {
    queryParams.value = {
      page: 1,
      page_size: 20,
    };
    currentPage.value = 1;
    pageSize.value = 20;
  };

  /**
   * 更新分页信息
   */
  const updatePagination = (page: number, size: number) => {
    currentPage.value = page;
    pageSize.value = size;
  };

  /**
   * 批量导出（前端处理）
   */
  const exportBatch = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exporting.value = true;

      // 使用当前页数据
      const data = records.value;

      // 调用导出工具函数
      await exportToFile(data, format, '绩效数据');

      addBreadcrumb({
        message: '批量导出成功',
        category: 'performance-report.exportBatch',
        level: 'info',
        data: { count: data.length, format },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      captureError(err, {
        type: 'Performance Report Export Batch Error',
        fingerprint: ['performance-report-export-batch-error'],
      });
      throw error;
    } finally {
      exporting.value = false;
    }
  };

  /**
   * 全量导出（后端异步处理）
   */
  const exportAll = async (format: 'xlsx' | 'csv' = 'xlsx') => {
    try {
      exporting.value = true;

      // 提交导出任务
      const response = await performanceReportApi.exportReports({
        query_params: queryParams.value,
        export_type: 'all',
        format,
      });

      exportTaskId.value = response.task_id || null;

      addBreadcrumb({
        message: '全量导出任务已提交',
        category: 'performance-report.exportAll',
        level: 'info',
        data: { taskId: exportTaskId.value, format },
      });

      return response;
    } catch (error) {
      exporting.value = false;
      exportTaskId.value = null;

      const err = error instanceof Error ? error : new Error(String(error));
      captureError(err, {
        type: 'Performance Report Export All Error',
        fingerprint: ['performance-report-export-all-error'],
      });
      throw error;
    }
  };

  /**
   * 检查导出任务状态
   */
  const checkExportTaskStatus = async (taskId: string) => {
    try {
      const status = await performanceReportApi.getExportTaskStatus(taskId);

      if (status.status === 'completed' && status.file_url) {
        // 下载文件
        downloadFile(status.file_url, '绩效数据.xlsx');
        exporting.value = false;
        exportTaskId.value = null;
      } else if (status.status === 'failed') {
        exporting.value = false;
        exportTaskId.value = null;
        throw new Error(status.error_message || '导出失败');
      }

      return status;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      captureError(err, {
        type: 'Performance Report Export Task Status Error',
        fingerprint: ['performance-report-export-task-status-error'],
      });
      throw error;
    }
  };

  return {
    // State
    records,
    total,
    loading,
    queryParams,
    currentPage,
    pageSize,
    exporting,
    exportTaskId,

    // Getters
    totalPages,
    hasRecords,
    canExport,

    // Actions
    fetchRecords,
    updateQueryParams,
    resetQueryParams,
    updatePagination,
    exportBatch,
    exportAll,
    checkExportTaskStatus,
  };
});
```

---

### 2.2 EmployeeStore（人员Store，扩展）

```typescript
// src/stores/employee.ts (扩展)
// 添加虚拟列表相关状态和方法

export const useEmployeeStore = defineStore('employee', () => {
  // ... 现有代码 ...

  /** 虚拟列表数据（用于选择器） */
  const virtualListData = ref<Employee[]>([]);

  /** 虚拟列表总数量 */
  const virtualListTotal = ref(0);

  /**
   * 获取人员列表（用于选择器，支持虚拟列表）
   */
  const fetchEmployeeListForSelector = async (params: EmployeeQueryParams) => {
    try {
      loading.value = true;
      const response = await employeeApi.getList(params);
      virtualListData.value = response.list.map(emp => ({
        id: emp.id,
        name: emp.name,
        employeeNumber: emp.employeeNo,
        departmentId: emp.organizationId || '',
        departmentName: emp.organizationName || '',
        departmentPath: getDepartmentPath(emp.organizationId), // 需要实现
      }));
      virtualListTotal.value = response.total;
    } catch (error) {
      virtualListData.value = [];
      virtualListTotal.value = 0;
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // ... 其他代码 ...
});
```

---

## 3. 数据验证规则

### 3.1 查询参数验证

```typescript
/**
 * 验证查询参数
 */
function validateQueryParams(params: PerformanceReportQueryParams): string[] {
  const errors: string[] = [];

  // 年份验证
  if (params.start_year !== undefined) {
    if (params.start_year < 2015 || params.start_year > 2030) {
      errors.push('开始年份必须在2015-2030之间');
    }
  }

  if (params.end_year !== undefined) {
    if (params.end_year < 2015 || params.end_year > 2030) {
      errors.push('结束年份必须在2015-2030之间');
    }
  }

  if (params.start_year !== undefined && params.end_year !== undefined) {
    if (params.end_year < params.start_year) {
      errors.push('结束年份不能早于开始年份');
    }
  }

  // 季度验证
  if (params.start_year_quarter) {
    if (!/^\d{4}-Q[1-4]$/.test(params.start_year_quarter)) {
      errors.push('开始季度格式错误，应为 "YYYY-Q[1-4]"');
    }
  }

  if (params.end_year_quarter) {
    if (!/^\d{4}-Q[1-4]$/.test(params.end_year_quarter)) {
      errors.push('结束季度格式错误，应为 "YYYY-Q[1-4]"');
    }
  }

  // 查询长度验证
  if (params.query_length !== undefined) {
    if (params.query_length < 1 || params.query_length > 10) {
      errors.push('查询长度必须在1-10年之间');
    }
  }

  // 分页验证
  if (params.page !== undefined && params.page < 1) {
    errors.push('页码必须大于0');
  }

  if (params.page_size !== undefined) {
    const validSizes = [10, 20, 50, 100];
    if (!validSizes.includes(params.page_size)) {
      errors.push('每页条数必须是 10, 20, 50, 100 之一');
    }
  }

  return errors;
}
```

---

## 4. 数据转换函数

### 4.1 季度时间转换

```typescript
/**
 * 季度时间转换为字符串
 */
function quarterToString(quarter: QuarterTime): string {
  return `${quarter.year}-Q${quarter.quarter}`;
}

/**
 * 字符串转换为季度时间
 */
function stringToQuarter(str: string): QuarterTime | null {
  const match = str.match(/^(\d{4})-Q([1-4])$/);
  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    quarter: parseInt(match[2], 10) as 1 | 2 | 3 | 4,
  };
}

/**
 * 计算结束时间（季度智能推算）
 */
function calculateEndQuarter(
  startQuarter: QuarterTime,
  queryLength: number
): QuarterTime {
  const endYear = startQuarter.year - queryLength + 1;
  const endQuarter = startQuarter.quarter;

  // 边界检查
  if (endYear > startQuarter.year) {
    return { year: startQuarter.year, quarter: startQuarter.quarter };
  }

  return { year: endYear, quarter: endQuarter };
}
```

### 4.2 年份段转换为日期范围

```typescript
/**
 * 年份段转换为日期范围
 */
function yearRangeToDateRange(startYear: number, endYear: number): TimeRange {
  return {
    start: new Date(startYear, 0, 1, 0, 0, 0, 0),
    end: new Date(endYear, 11, 31, 23, 59, 59, 999),
  };
}
```

---

## 5. 状态转换

### 5.1 查询状态转换

```
初始状态
  ↓
[用户输入查询条件]
  ↓
[验证查询参数]
  ↓ (成功)
[设置loading=true]
  ↓
[调用API]
  ↓ (成功)
[更新records和total]
  ↓
[设置loading=false]
  ↓
[显示结果]
```

### 5.2 导出状态转换

**批量导出：**

```
初始状态
  ↓
[用户点击批量导出]
  ↓
[设置exporting=true]
  ↓
[处理当前页数据]
  ↓
[生成文件]
  ↓
[下载文件]
  ↓
[设置exporting=false]
```

**全量导出：**

```
初始状态
  ↓
[用户点击全量导出]
  ↓
[设置exporting=true]
  ↓
[提交导出任务]
  ↓
[获取task_id]
  ↓
[轮询检查任务状态]
  ↓ (processing)
[继续轮询]
  ↓ (completed)
[下载文件]
  ↓
[设置exporting=false]
```

---

## 总结

本文档定义了绩效数据报表功能的所有数据模型，包括：

1. **核心实体**: 查询参数、绩效记录、时间范围、人员、部门、导出相关
2. **Pinia Store**: 绩效报表Store、人员Store扩展
3. **验证规则**: 查询参数验证
4. **转换函数**: 季度时间转换、日期范围转换
5. **状态转换**: 查询和导出的状态流转

所有数据模型都使用TypeScript严格类型定义，确保类型安全。
