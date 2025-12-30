# API 合约文档：绩效数据报表

**版本:** 1.0  
**日期:** 2025-12-28

---

## 概述

本文档定义了绩效数据报表功能的所有 API 接口规范，包括请求参数、响应格式、错误处理等。

---

## API 端点列表

### 1. 查询绩效数据

**Endpoint:** `GET /api/v1/performance-reports`

**描述:** 查询绩效数据，支持多种查询条件组合。

**请求参数:** 见 `PerformanceReportQueryParams`

**响应格式:** `PaginatedResponse<PerformanceRecord>`

**示例请求:**

```bash
GET /api/v1/performance-reports?start_year=2025&end_year=2025&page=1&page_size=20
```

**示例响应:**

```json
{
  "list": [
    {
      "id": "perf-001",
      "employee_name": "张三",
      "year": 2025,
      "quarter": "Q1",
      "performance_rating": "A"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 100,
  "total_pages": 5
}
```

---

### 2. 导出绩效数据

**Endpoint:** `POST /api/v1/performance-reports/export`

**描述:** 导出绩效数据，支持批量导出和全量导出。

**请求体:** `ExportRequest`

**响应格式:** `ExportResponse`

**示例请求（批量导出）:**

```json
{
  "query_params": {
    "page": 1,
    "page_size": 20
  },
  "export_type": "batch",
  "format": "xlsx"
}
```

**示例响应（批量导出）:**

```json
{
  "file_url": "https://example.com/files/export-123.xlsx",
  "status": "completed"
}
```

**示例请求（全量导出）:**

```json
{
  "query_params": {
    "start_year": 2025,
    "end_year": 2025
  },
  "export_type": "all",
  "format": "xlsx"
}
```

**示例响应（全量导出）:**

```json
{
  "task_id": "task-123",
  "status": "processing"
}
```

---

### 3. 获取导出任务状态

**Endpoint:** `GET /api/v1/performance-reports/export/:taskId/status`

**描述:** 获取全量导出任务的状态。

**路径参数:**

- `taskId`: 任务ID

**响应格式:** `ExportTaskStatus`

**示例请求:**

```bash
GET /api/v1/performance-reports/export/task-123/status
```

**示例响应（处理中）:**

```json
{
  "task_id": "task-123",
  "status": "processing",
  "progress": 50
}
```

**示例响应（完成）:**

```json
{
  "task_id": "task-123",
  "status": "completed",
  "progress": 100,
  "file_url": "https://example.com/files/export-123.xlsx"
}
```

---

## 错误处理

### 错误响应格式

```json
{
  "code": 400,
  "message": "参数错误：开始年份不能大于结束年份",
  "request_id": "req-123",
  "details": {
    "field": "start_year",
    "value": 2025
  }
}
```

### 常见错误码

- `400`: 参数错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `500`: 服务器错误
- `503`: 服务不可用

---

## 数据格式说明

### 时间格式

- **年份**: 整数，范围 2015-2030
- **季度**: 字符串，格式 "YYYY-Q[1-4]"，如 "2025-Q1"
- **日期时间**: ISO 8601 格式，如 "2025-01-01T00:00:00Z"

### 分页格式

- **页码**: 从 1 开始
- **每页条数**: 可选值 [10, 20, 50, 100]
- **默认值**: page=1, page_size=20

---

## 使用示例

### TypeScript 使用示例

```typescript
import { performanceReportApi } from '@/api/performance-report';

// 查询绩效数据
const response = await performanceReportApi.getReports({
  start_year: 2025,
  end_year: 2025,
  page: 1,
  page_size: 20,
});

// 批量导出
const exportResponse = await performanceReportApi.exportReports({
  query_params: { page: 1, page_size: 20 },
  export_type: 'batch',
  format: 'xlsx',
});

// 全量导出（轮询状态）
const allExportResponse = await performanceReportApi.exportReports({
  query_params: { start_year: 2025, end_year: 2025 },
  export_type: 'all',
  format: 'xlsx',
});

if (allExportResponse.task_id) {
  // 轮询检查状态
  const interval = setInterval(async () => {
    const status = await performanceReportApi.getExportTaskStatus(
      allExportResponse.task_id!
    );

    if (status.status === 'completed') {
      // 下载文件
      downloadFile(status.file_url!);
      clearInterval(interval);
    } else if (status.status === 'failed') {
      console.error(status.error_message);
      clearInterval(interval);
    }
  }, 2000);
}
```

---

## 注意事项

1. **查询参数验证**: 前端应验证所有查询参数，避免无效请求
2. **分页限制**: 单次查询最多返回 100 条记录
3. **导出限制**: 全量导出最多支持 10 万条记录
4. **超时处理**: 全量导出可能需要较长时间，应实现超时和重试机制
5. **错误处理**: 所有 API 调用都应实现错误处理和用户提示

---

## 更新日志

- **v1.0** (2025-12-28): 初始版本，定义所有 API 接口
