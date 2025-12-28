# 研究文档：绩效数据报表功能

**版本:** 1.0  
**日期:** 2025-12-28  
**状态:** 已完成

---

## 目的

本文档记录绩效数据报表功能的技术选型、设计决策和研究发现。

---

## 技术选型

### 1. 虚拟列表实现方案

**决策:** 使用 Element Plus Virtual Table (el-table-v2)

**理由:**

- 与现有UI库（Element Plus）保持一致，集成简单
- 支持大量数据渲染（1000+条记录），性能优秀
- 内置虚拟滚动，减少DOM节点，提升渲染性能
- 支持搜索、排序、筛选等常用功能
- 与现有代码风格一致，降低学习成本

**替代方案考虑:**

- **vue-virtual-scroller**:
  - 优点：更轻量，更灵活
  - 缺点：需要自己实现表格功能，增加开发工作量
  - 结论：如果Element Plus Virtual Table不满足需求，再考虑此方案

**实现要点:**

```vue
<el-table-v2
  :columns="columns"
  :data="employeeList"
  :width="800"
  :height="600"
  fixed
/>
```

**性能目标:**

- 支持1000+条人员数据流畅渲染
- 滚动性能：60fps
- 搜索响应时间：< 500ms

---

### 2. Excel导出库选择

**决策:** 使用 `xlsx` (SheetJS)

**理由:**

- 轻量级，体积小（~100KB）
- 功能完整，支持Excel和CSV格式
- 社区活跃，文档完善
- 支持浏览器和Node.js环境
- 性能良好，支持大数据量导出

**替代方案考虑:**

- **exceljs**:
  - 优点：功能更强大，支持样式、图表等
  - 缺点：体积较大（~500KB），对于简单导出需求过于复杂
  - 结论：如果后续需要复杂样式或图表，再考虑迁移

**实现要点:**

```typescript
import * as XLSX from 'xlsx';

// 批量导出（前端处理）
function exportBatch(data: PerformanceRecord[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '绩效数据');
  XLSX.writeFile(wb, '绩效数据.xlsx');
}

// 全量导出（后端生成，前端下载）
async function exportAll(params: QueryParams) {
  const response = await api.exportPerformanceReports(params);
  // 下载文件
  downloadFile(response.data, '绩效数据.xlsx');
}
```

**性能目标:**

- 批量导出（1000条）：< 2秒
- 全量导出（10万条）：后端异步处理，前端显示进度

---

### 3. 季度智能推算算法

**决策:** 前端计算，基于开始时间和查询长度

**理由:**

- 实时反馈，用户体验好
- 减少后端请求，提升性能
- 算法简单，易于维护

**算法设计:**

```typescript
interface QuarterTime {
  year: number;
  quarter: 1 | 2 | 3 | 4;
}

/**
 * 计算结束时间
 * @param startTime 开始时间
 * @param queryLength 查询长度（年数）
 * @returns 结束时间
 */
function calculateEndTime(
  startTime: QuarterTime,
  queryLength: number
): QuarterTime {
  const endYear = startTime.year - queryLength + 1;
  const endQuarter = startTime.quarter;

  // 边界检查：确保结束年份不早于开始年份
  if (endYear > startTime.year) {
    return { year: startTime.year, quarter: startTime.quarter };
  }

  return { year: endYear, quarter: endQuarter };
}
```

**边界情况处理:**

1. **单年查询**（查询长度为1）：
   - 开始：2025-Q1，结束：2025-Q1
   - 返回2025年Q1的数据

2. **跨年查询**（查询长度>1）：
   - 开始：2025-Q3，查询长度：3年
   - 结束：2023-Q3
   - 返回2023年Q3到2025年Q3的数据

3. **季度边界**：
   - 开始：2025-Q1，查询长度：1年
   - 结束：2024-Q1
   - 返回2024年Q1到2025年Q1的数据

4. **用户手动调整**：
   - 允许用户手动修改推算结果
   - 系统不强制使用推算值

**测试用例:**

```typescript
// 测试用例1：单年查询
expect(calculateEndTime({ year: 2025, quarter: 1 }, 1))
  .toEqual({ year: 2025, quarter: 1 });

// 测试用例2：跨年查询
expect(calculateEndTime({ year: 2025, quarter: 3 }, 3))
  .toEqual({ year: 2023, quarter: 3 });

// 测试用例3：边界情况（查询长度为0）
expect(calculateEndTime({ year: 2025, quarter: 1 }, 0))
  .toEqual({ year: 2025, quarter: 1 });
```

---

### 4. 部门层级查询实现

**决策:** 后端递归查询，前端传递"包含下级"标志

**理由:**

- 后端处理更高效，减少前端计算
- 支持深层级部门树（10级+）
- 可以优化查询性能（索引、缓存）

**实现方式:**

**前端:**

```typescript
interface DepartmentQuery {
  departmentId: string;
  includeSubDepartments: boolean;
}
```

**后端API:**

```typescript
// GET /api/v1/performance-reports?department_id=xxx&include_sub_departments=true
```

**后端查询逻辑:**

1. 如果 `include_sub_departments = false`：
   - 只查询指定部门直接下属人员的绩效数据
2. 如果 `include_sub_departments = true`：
   - 递归查找所有下级部门
   - 查询所有相关部门的绩效数据

**性能优化:**

- 使用递归CTE（Common Table Expression）优化查询
- 缓存部门层级关系（Redis，TTL: 5分钟）
- 限制查询深度（最大10级）

---

### 5. 人员选择器实现

**决策:** 使用虚拟列表 + 搜索 + 部门路径标识

**理由:**

- 虚拟列表支持大量人员数据（1000+）
- 搜索功能快速定位目标人员
- 部门路径标识帮助用户识别人员所属部门

**数据结构:**

```typescript
interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  departmentId: string;
  departmentPath: string; // 如："A部门/B部门/C部门"
  departmentName: string;
}
```

**实现要点:**

1. **虚拟列表渲染:**
   - 使用 `el-table-v2` 或 `el-select` + 虚拟滚动
   - 支持搜索过滤
   - 显示部门路径

2. **搜索功能:**
   - 支持姓名、工号模糊搜索
   - 防抖处理（500ms）
   - 服务端搜索（如果数据量大）

3. **多选功能:**
   - 支持复选框多选
   - 显示已选人员数量
   - 支持快速清除

---

### 6. 分页策略

**决策:** 服务端分页

**理由:**

- 绩效数据量大，客户端分页不现实
- 减少数据传输量，提升性能
- 与现有模块保持一致

**分页参数:**

- `page`: 页码（从1开始）
- `page_size`: 每页条数（默认20，可选：10, 20, 50, 100）

**实现要点:**

- 使用 Element Plus Pagination 组件
- 支持页码跳转
- 支持每页条数调整
- 分页与查询条件联动

---

### 7. 导出功能实现

**决策:** 批量导出（前端）+ 全量导出（后端异步）

**理由:**

- 批量导出数据量小（< 1000条），前端处理即可
- 全量导出数据量大（可能10万+），后端异步处理更合适
- 避免前端内存溢出和超时问题

**批量导出实现:**

```typescript
// 前端处理，直接导出当前页数据
function exportBatch() {
  const data = performanceStore.reports; // 当前页数据
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '绩效数据');
  XLSX.writeFile(wb, `绩效数据_${Date.now()}.xlsx`);
}
```

**全量导出实现:**

```typescript
// 后端异步处理
async function exportAll() {
  // 1. 提交导出任务
  const taskId = await api.submitExportTask(queryParams);

  // 2. 轮询检查任务状态
  const interval = setInterval(async () => {
    const status = await api.getExportTaskStatus(taskId);
    if (status === 'completed') {
      // 3. 下载文件
      const fileUrl = await api.getExportFile(taskId);
      downloadFile(fileUrl);
      clearInterval(interval);
    }
  }, 2000);
}
```

**导出格式:**

- Excel (.xlsx) - 默认格式
- CSV (.csv) - 可选格式

**导出字段:**

- 员工姓名、员工ID、工号
- 部门名称、部门路径
- 年份、季度
- 绩效评级、绩效指标
- 评价时间、最后同步时间

---

## API接口设计

### 1. 查询绩效数据

**Endpoint:** `GET /api/v1/performance-reports`

**Query Parameters:**

```typescript
interface PerformanceReportQueryParams {
  // 年份段查询
  start_year?: number;
  end_year?: number;

  // 季度查询
  start_year_quarter?: string; // 格式: "2025-Q1"
  end_year_quarter?: string;    // 格式: "2025-Q4"
  query_length?: number;       // 查询长度（年数）

  // 人员查询
  user_ids?: string[];         // 人员ID数组

  // 部门查询
  department_id?: string;
  include_sub_departments?: boolean;

  // 分页
  page?: number;
  page_size?: number;
}
```

**Response:**

```typescript
interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}
```

### 2. 导出绩效数据

**Endpoint:** `POST /api/v1/performance-reports/export`

**Request Body:**

```typescript
interface ExportRequest {
  query_params: PerformanceReportQueryParams;
  export_type: 'batch' | 'all';  // 批量或全量
  format: 'xlsx' | 'csv';         // 导出格式
}
```

**Response:**

```typescript
interface ExportResponse {
  task_id: string;        // 任务ID（全量导出）
  file_url?: string;       // 文件URL（批量导出直接返回）
  status: 'processing' | 'completed' | 'failed';
}
```

### 3. 获取导出任务状态

**Endpoint:** `GET /api/v1/performance-reports/export/:taskId/status`

**Response:**

```typescript
interface ExportTaskStatus {
  task_id: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;      // 进度（0-100）
  file_url?: string;       // 文件URL（完成时）
  error_message?: string;  // 错误信息（失败时）
}
```

---

## 数据模型

### 1. 绩效数据查询参数

```typescript
interface PerformanceReportQueryParams {
  // 时间范围
  startYear?: number;
  endYear?: number;
  startQuarter?: QuarterTime;
  endQuarter?: QuarterTime;
  queryLength?: number;

  // 人员
  userIds?: string[];

  // 部门
  departmentId?: string;
  includeSubDepartments?: boolean;

  // 分页
  page: number;
  pageSize: number;
}
```

### 2. 绩效数据记录

```typescript
interface PerformanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNumber: string;
  departmentId: string;
  departmentName: string;
  departmentPath: string;
  year: number;
  quarter: 1 | 2 | 3 | 4;
  performanceRating: string;
  performanceIndicators: PerformanceIndicator[];
  evaluatorId: string;
  evaluatedAt: string;
  lastSyncedAt: string;
}
```

### 3. 人员信息（用于选择器）

```typescript
interface Employee {
  id: string;
  name: string;
  employeeNumber: string;
  departmentId: string;
  departmentName: string;
  departmentPath: string; // 部门路径，如："A部门/B部门/C部门"
}
```

### 4. 部门信息（用于选择器）

```typescript
interface Department {
  id: string;
  name: string;
  parentId: string | null;
  level: number;
  path: string; // 部门路径
  children?: Department[];
}
```

---

## 性能优化策略

### 1. 虚拟列表优化

- 使用虚拟滚动，只渲染可见区域
- 实现搜索过滤，减少显示数据量
- 懒加载数据，按需加载

### 2. 查询优化

- 服务端分页，减少数据传输
- 查询结果缓存（5分钟TTL）
- 索引优化（年份、季度、部门ID、员工ID）

### 3. 导出优化

- 批量导出：前端处理，快速响应
- 全量导出：后端异步处理，避免超时
- 流式导出，减少内存占用

### 4. 部门层级查询优化

- 递归CTE优化查询
- 缓存部门层级关系
- 限制查询深度（最大10级）

---

## 测试策略

### 1. 单元测试

- **季度推算算法**: 90%+ 覆盖率
- **时间范围计算**: 覆盖所有边界情况
- **Store actions**: 80%+ 覆盖率

### 2. E2E测试

- **查询流程**: 年份段、季度、人员、部门查询
- **组合查询**: 多条件组合
- **导出功能**: 批量导出、全量导出
- **分页功能**: 分页切换、每页条数调整

---

## 风险评估

### 风险1: 虚拟列表性能问题

**缓解措施:**

- 使用Element Plus Virtual Table，性能经过验证
- 实现搜索过滤，减少显示数据量
- 性能测试，确保1000+条记录流畅

### 风险2: 季度推算算法错误

**缓解措施:**

- 详细设计算法，覆盖所有边界情况
- 编写全面的单元测试
- 允许用户手动调整

### 风险3: 全量导出大数据量问题

**缓解措施:**

- 后端异步处理，避免超时
- 实现导出进度提示
- 限制单次导出最大数据量（10万条）

---

## 总结

本文档记录了绩效数据报表功能的所有技术选型和设计决策。主要技术选型包括：

1. **虚拟列表**: Element Plus Virtual Table
2. **Excel导出**: xlsx (SheetJS)
3. **季度推算**: 前端算法实现
4. **部门查询**: 后端递归查询
5. **分页策略**: 服务端分页
6. **导出策略**: 批量前端处理，全量后端异步

所有决策都基于性能、用户体验和开发效率的平衡考虑。
