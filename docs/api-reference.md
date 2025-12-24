# API 参考文档

本文档详细说明了数据同步服务提供的所有 REST API 接口。

## 基础信息

- **Base URL**: `http://localhost:8080`
- **API 版本**: v1
- **Content-Type**: `application/json`
- **字符编码**: UTF-8
- **API 前缀**: `/api/v1`

## 接口分类

本服务提供三类接口：

1. **同步触发接口** - 触发数据同步任务（异步执行）
2. **监控查询接口** - 查询同步任务的执行状态和日志
3. **核心数据查询接口** - 查询已同步的员工、组织、职务数据

## 目录

1. [同步触发接口](#同步触发接口)
2. [监控查询接口](#监控查询接口)
3. [核心数据查询接口](#核心数据查询接口)
4. [健康检查接口](#健康检查接口)
5. [调度管理界面](#调度管理界面)

---

## 同步触发接口

### 1. 触发员工同步

触发员工数据的全量或增量同步。

**请求**

```
POST /api/v1/sync/employees
Content-Type: application/json
```

**请求体**

```json
{
  "time_range_start": "2025-12-18T00:00:00Z",  // 可选，开始时间（ISO 8601格式）
  "time_range_end": "2025-12-19T00:00:00Z"     // 可选，结束时间（ISO 8601格式）
}
```

- 如果不提供时间范围，则执行全量同步（默认最近90天）
- 时间范围必须是有效的 ISO 8601 格式
- 结束时间必须晚于开始时间

**响应**

```json
{
  "message": "Employee sync triggered successfully",
  "status": "running"
}
```

**状态码**

- `202 Accepted`: 同步任务已接受并开始执行
- `400 Bad Request`: 请求参数无效
- `409 Conflict`: 已有同步任务正在运行
- `500 Internal Server Error`: 服务器内部错误

---

### 2. 触发组织同步

触发组织数据的全量或增量同步。

**请求**

```
POST /api/v1/sync/organizations
Content-Type: application/json
```

**请求体**

```json
{
  "time_range_start": "2025-12-18T00:00:00Z",  // 可选
  "time_range_end": "2025-12-19T00:00:00Z"     // 可选
}
```

**响应**

```json
{
  "message": "Organization sync triggered successfully",
  "status": "running"
}
```

**状态码**

- `202 Accepted`: 同步任务已接受并开始执行
- `400 Bad Request`: 请求参数无效
- `409 Conflict`: 已有同步任务正在运行
- `500 Internal Server Error`: 服务器内部错误

---

### 3. 触发职务同步

触发职务数据的全量或增量同步。

**请求**

```
POST /api/v1/sync/jobposts
Content-Type: application/json
```

**请求体**

```json
{
  "time_range_start": "2025-12-18T00:00:00Z",  // 可选
  "time_range_end": "2025-12-19T00:00:00Z"     // 可选
}
```

**响应**

```json
{
  "message": "JobPost sync triggered successfully",
  "status": "running"
}
```

**状态码**

- `202 Accepted`: 同步任务已接受并开始执行
- `400 Bad Request`: 请求参数无效
- `409 Conflict`: 已有同步任务正在运行
- `500 Internal Server Error`: 服务器内部错误

---

### 4. 触发完整顺序同步

按照 **组织 → 职务 → 员工** 的顺序执行完整数据同步。

**请求**

```
POST /api/v1/sync/ordered
Content-Type: application/json
```

**请求体**

```json
{}
```

**响应**

```json
{
  "message": "Ordered sync triggered successfully (organization → jobpost → employee)",
  "status": "running"
}
```

**状态码**

- `202 Accepted`: 同步任务已接受并在后台执行
- `500 Internal Server Error`: 服务器内部错误

**说明**

- 此接口会在后台依次执行三个同步任务
- 如果任何一个任务失败，后续任务将不会执行
- 每个任务的 batch_id 会记录在 sync_batches 表中
- 使用 parent_batch_id 字段追踪任务依赖关系
- 同步任务是异步执行的，需要通过监控接口查询执行结果

---

## 监控查询接口

### 5. 查询同步批次列表

查询同步批次的历史记录，支持分页和筛选。

**请求**

```
GET /api/v1/sync/batches?page=1&page_size=10&sync_type=employee&status=success
```

**查询参数**

| 参数       | 类型    | 必填 | 说明                                      |
| ---------- | ------- | ---- | ----------------------------------------- |
| page       | integer | 否   | 页码，默认 1                              |
| page_size  | integer | 否   | 每页数量，默认 10，最大 100               |
| sync_type  | string  | 否   | 同步类型：employee, organization, jobpost |
| status     | string  | 否   | 状态：running, success, failed            |
| start_time | string  | 否   | 开始时间（ISO 8601格式）                  |
| end_time   | string  | 否   | 结束时间（ISO 8601格式）                  |

**响应**

```json
{
  "batches": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "batch_id": "550e8400-e29b-41d4-a716-446655440000",
      "sync_type": "employee",
      "trigger_mode": "manual",
      "status": "success",
      "start_time": "2025-12-23T01:00:00Z",
      "end_time": "2025-12-23T01:00:35Z",
      "duration_ms": 35420,
      "total_count": 1654,
      "success_count": 1654,
      "failed_count": 0,
      "error_summary": "",
      "time_range_start": "2025-09-21T00:00:00Z",
      "time_range_end": "2025-12-23T00:00:00Z",
      "parent_batch_id": null,
      "created_at": "2025-12-23T01:00:00Z",
      "updated_at": "2025-12-23T01:00:35Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 10,
    "total_count": 42,
    "total_pages": 5
  }
}
```

**状态码**

- `200 OK`: 查询成功
- `400 Bad Request`: 查询参数无效
- `500 Internal Server Error`: 服务器内部错误

---

### 6. 查询批次详情

查询指定批次的详细信息。

**请求**

```
GET /api/v1/sync/batches/{batch_id}
```

**路径参数**

| 参数     | 类型          | 说明    |
| -------- | ------------- | ------- |
| batch_id | string (UUID) | 批次 ID |

**响应**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "batch_id": "550e8400-e29b-41d4-a716-446655440000",
  "sync_type": "employee",
  "trigger_mode": "manual",
  "status": "success",
  "start_time": "2025-12-23T01:00:00Z",
  "end_time": "2025-12-23T01:00:35Z",
  "duration_ms": 35420,
  "total_count": 1654,
  "success_count": 1654,
  "failed_count": 0,
  "error_summary": "",
  "time_range_start": "2025-09-21T00:00:00Z",
  "time_range_end": "2025-12-23T00:00:00Z",
  "parent_batch_id": null,
  "created_at": "2025-12-23T01:00:00Z",
  "updated_at": "2025-12-23T01:00:35Z"
}
```

**状态码**

- `200 OK`: 查询成功
- `404 Not Found`: 批次不存在
- `500 Internal Server Error`: 服务器内部错误

---

### 7. 查询批次日志

查询指定批次的同步日志记录。

**请求**

```
GET /api/v1/sync/batches/{batch_id}/logs
```

**路径参数**

| 参数     | 类型          | 说明    |
| -------- | ------------- | ------- |
| batch_id | string (UUID) | 批次 ID |

**响应**

```json
{
  "logs": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440000",
      "batch_id": "550e8400-e29b-41d4-a716-446655440000",
      "record_type": "employee",
      "record_identifier": "EMP001",
      "operation": "insert",
      "status": "success",
      "error_message": "",
      "error_code": "",
      "record_details": {
        "name": "张三",
        "code": "EMP001",
        "email": "zhangsan@example.com"
      },
      "processed_at": "2025-12-23T01:00:10Z",
      "created_at": "2025-12-23T01:00:10Z"
    }
  ],
  "total_count": 1654
}
```

**状态码**

- `200 OK`: 查询成功
- `404 Not Found`: 批次不存在
- `500 Internal Server Error`: 服务器内部错误

---

### 8. 查询完整同步流程状态

根据批次ID查询完整顺序同步的执行状态（包括组织、职务、员工三个阶段）。

**请求**

```
GET /api/v1/sync/ordered-flow-status?batch_id={batch_id}
```

**查询参数**

| 参数     | 类型          | 必填 | 说明                                         |
| -------- | ------------- | ---- | -------------------------------------------- |
| batch_id | string (UUID) | 是   | 任一批次ID（组织/职务/员工的任一批次ID均可） |

**响应**

```json
{
  "latest_ordered_sync": {
    "org_batch": {
      "batch_id": "550e8400-e29b-41d4-a716-446655440003",
      "status": "success",
      "start_time": "2025-12-23T02:00:00Z",
      "end_time": "2025-12-23T02:00:05Z",
      "duration_ms": 5200,
      "total_count": 150,
      "success_count": 150,
      "failed_count": 0
    },
    "jobpost_batch": {
      "batch_id": "550e8400-e29b-41d4-a716-446655440004",
      "status": "success",
      "start_time": "2025-12-23T02:00:06Z",
      "end_time": "2025-12-23T02:00:08Z",
      "duration_ms": 2100,
      "total_count": 100,
      "success_count": 100,
      "failed_count": 0
    },
    "employee_batch": {
      "batch_id": "550e8400-e29b-41d4-a716-446655440005",
      "status": "success",
      "start_time": "2025-12-23T02:00:09Z",
      "end_time": "2025-12-23T02:00:44Z",
      "duration_ms": 35120,
      "total_count": 1654,
      "success_count": 1654,
      "failed_count": 0
    },
    "total_duration_ms": 42420,
    "overall_status": "success"
  }
}
```

**状态码**

- `200 OK`: 查询成功
- `400 Bad Request`: 缺少必需的 batch_id 参数
- `404 Not Found`: 没有找到指定的批次记录
- `500 Internal Server Error`: 服务器内部错误

---

### 9. 查询当前运行状态

查询当前正在运行的同步任务。

**请求**

```
GET /api/v1/sync/status
```

**响应**

```json
{
  "running_batches": [
    {
      "batch_id": "550e8400-e29b-41d4-a716-446655440006",
      "sync_type": "employee",
      "trigger_mode": "scheduled",
      "status": "running",
      "start_time": "2025-12-23T02:00:00Z",
      "elapsed_ms": 15420
    }
  ],
  "total_running": 1
}
```

**状态码**

- `200 OK`: 查询成功
- `500 Internal Server Error`: 服务器内部错误

---

## 核心数据查询接口

### 10. 查询员工列表

查询员工列表，支持分页和关键词搜索。

**请求**

```
GET /api/v1/employees?pageNum=1&pageSize=20&keyword=张三
```

**查询参数**

| 参数     | 类型    | 必填 | 说明                       |
| -------- | ------- | ---- | -------------------------- |
| pageNum  | integer | 是   | 页码（从1开始）            |
| pageSize | integer | 是   | 每页数量（1-100）          |
| keyword  | string  | 否   | 搜索关键词（姓名模糊匹配） |

**响应**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "list": [
      {
        "id": "1",
        "employeeNo": "EMP001",
        "name": "张三",
        "email": "zhangsan@example.com",
        "phone": "13800138000",
        "employmentDate": "2020-01-15T00:00:00Z",
        "employmentStatus": "在职",
        "position": "软件工程师",
        "organizationId": "100",
        "organizationName": "技术部",
        "jobPostId": "200",
        "jobPostName": "软件工程师"
      }
    ],
    "pageNum": 1,
    "pageSize": 20,
    "total": 1654,
    "totalPages": 83
  }
}
```

**状态码**

- `200 OK`: 查询成功
- `400 Bad Request`: 请求参数无效
- `500 Internal Server Error`: 服务器内部错误

---

### 11. 查询员工详情

根据员工ID查询员工详细信息。

**请求**

```
GET /api/v1/employees/{id}
```

**路径参数**

| 参数 | 类型   | 说明   |
| ---- | ------ | ------ |
| id   | string | 员工ID |

**响应**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "id": "1",
    "employeeNo": "EMP001",
    "name": "张三",
    "email": "zhangsan@example.com",
    "phone": "13800138000",
    "employmentDate": "2020-01-15T00:00:00Z",
    "employmentStatus": "在职",
    "position": "软件工程师",
    "organizationId": "100",
    "organizationName": "技术部",
    "jobPostId": "200",
    "jobPostName": "软件工程师"
  }
}
```

**状态码**

- `200 OK`: 查询成功
- `404 Not Found`: 员工不存在
- `500 Internal Server Error`: 服务器内部错误

---

### 12. 查询组织树

查询组织的树形结构。

**请求**

```
GET /api/v1/organizations/tree
```

**响应**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": [
    {
      "id": "1",
      "name": "公司总部",
      "code": "HQ",
      "parentId": null,
      "level": 1,
      "children": [
        {
          "id": "2",
          "name": "技术部",
          "code": "TECH",
          "parentId": "1",
          "level": 2,
          "children": []
        }
      ]
    }
  ]
}
```

**状态码**

- `200 OK`: 查询成功
- `500 Internal Server Error`: 服务器内部错误

---

### 13. 查询职务列表

查询职务列表，支持分页和关键词搜索。

**请求**

```
GET /api/v1/positions?pageNum=1&pageSize=20&keyword=工程师
```

**查询参数**

| 参数     | 类型    | 必填 | 说明                           |
| -------- | ------- | ---- | ------------------------------ |
| pageNum  | integer | 是   | 页码（从1开始）                |
| pageSize | integer | 是   | 每页数量（1-100）              |
| keyword  | string  | 否   | 搜索关键词（职务名称模糊匹配） |

**响应**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "list": [
      {
        "id": "1",
        "name": "软件工程师",
        "code": "SE"
      }
    ],
    "pageNum": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**状态码**

- `200 OK`: 查询成功
- `400 Bad Request`: 请求参数无效
- `500 Internal Server Error`: 服务器内部错误

---

## 健康检查接口

### 14. 健康检查

检查服务是否正常运行。

**请求**

```
GET /health
```

**响应**

```json
{
  "status": "ok"
}
```

**状态码**

- `200 OK`: 服务正常

---

### 15. 就绪检查

检查服务是否就绪（包括数据库连接检测）。

**请求**

```
GET /ready
```

**响应**

```json
{
  "status": "ready",
  "checks": {
    "database": "ok"
  }
}
```

**状态码**

- `200 OK`: 服务就绪
- `503 Service Unavailable`: 服务未就绪

---

## 调度管理界面

### 16. Gocron UI

访问定时任务管理界面。

**请求**

```
GET /scheduler
```

**说明**

- 提供可视化的定时任务管理界面
- 可以查看任务执行历史
- 可以手动触发定时任务
- 可以查看任务调度配置

---

## 响应格式说明

### 同步和监控接口响应格式

同步触发和监控接口使用简单的 JSON 响应格式：

**成功响应示例：**

```json
{
  "message": "操作成功消息"
}
```

**错误响应示例：**

```json
{
  "error": "错误描述信息"
}
```

### 核心数据查询接口响应格式

核心数据查询接口使用统一的响应格式（UnifiedResponse）：

**成功响应结构：**

```json
{
  "code": 200,           // 业务状态码（200=成功）
  "message": "success",  // 响应消息
  "requestId": "uuid",   // 请求追踪ID
  "data": {}            // 实际数据
}
```

**分页响应结构：**

```json
{
  "code": 200,
  "message": "success",
  "requestId": "uuid",
  "data": {
    "list": [],          // 数据列表
    "pageNum": 1,        // 当前页码
    "pageSize": 20,      // 每页条数
    "total": 100,        // 总记录数
    "totalPages": 5      // 总页数
  }
}
```

**错误响应结构：**

```json
{
  "code": 400,           // 错误状态码
  "message": "错误信息",
  "requestId": "uuid",
  "data": null
}
```

### HTTP 状态码

| 状态码 | 说明                           |
| ------ | ------------------------------ |
| 200    | 请求成功                       |
| 202    | 请求已接受（异步处理）         |
| 400    | 请求参数无效                   |
| 404    | 资源不存在                     |
| 409    | 资源冲突（如同步任务已在运行） |
| 500    | 服务器内部错误                 |
| 503    | 服务不可用                     |

### 业务状态码（核心数据查询接口）

| 状态码 | 说明       |
| ------ | ---------- |
| 200    | 成功       |
| 400    | 参数错误   |
| 404    | 记录不存在 |
| 500    | 数据库错误 |

---

## 使用示例

### 示例 1: 执行完整数据同步

```bash
# 1. 触发完整顺序同步
curl -X POST http://localhost:8080/api/v1/sync/ordered

# 2. 查询同步状态
curl http://localhost:8080/api/v1/sync/ordered-flow-status

# 3. 查询具体批次详情
curl http://localhost:8080/api/v1/sync/batches/{batch_id}
```

### 示例 2: 增量同步特定时间范围的数据

```bash
# 同步昨天的员工数据
curl -X POST http://localhost:8080/api/v1/sync/employees \
  -H "Content-Type: application/json" \
  -d '{
    "time_range_start": "2025-12-22T00:00:00Z",
    "time_range_end": "2025-12-22T23:59:59Z"
  }'
```

### 示例 3: 查询同步历史

```bash
# 查询所有成功的员工同步批次
curl "http://localhost:8080/api/v1/sync/batches?sync_type=employee&status=success&page=1&page_size=20"

# 查询最近一周的同步记录
curl "http://localhost:8080/api/v1/sync/batches?start_time=2025-12-16T00:00:00Z&end_time=2025-12-23T23:59:59Z"
```

### 示例 4: 监控当前运行状态

```bash
# 检查是否有任务正在运行
curl http://localhost:8080/api/v1/sync/status

# 如果有任务运行，查询详情
curl http://localhost:8080/api/v1/sync/batches/{batch_id}
```

### 示例 5: 查询员工数据

```bash
# 查询员工列表（第一页，每页20条）
curl "http://localhost:8080/api/v1/employees?pageNum=1&pageSize=20"

# 搜索姓名包含"张"的员工
curl "http://localhost:8080/api/v1/employees?pageNum=1&pageSize=20&keyword=张"

# 查询特定员工详情
curl http://localhost:8080/api/v1/employees/1
```

### 示例 6: 查询组织和职务数据

```bash
# 查询组织树形结构
curl http://localhost:8080/api/v1/organizations/tree

# 查询职务列表
curl "http://localhost:8080/api/v1/positions?pageNum=1&pageSize=20"

# 搜索职务名称包含"工程师"的职务
curl "http://localhost:8080/api/v1/positions?pageNum=1&pageSize=20&keyword=工程师"
```

---

## 最佳实践

### 1. 同步顺序

建议按以下顺序执行同步：

1. 组织数据（因为员工依赖组织）
2. 职务数据（因为员工依赖职务）
3. 员工数据

或者直接使用 `/api/v1/sync/ordered` 接口自动按顺序执行。

### 2. 增量同步

- 首次同步使用全量同步（不传时间范围参数）
- 后续使用增量同步，指定合理的时间范围
- 建议每天执行一次增量同步
- 时间格式使用 ISO 8601 标准（如：`2025-12-23T00:00:00Z`）

### 3. 错误处理

**同步接口错误处理：**

- 检查 HTTP 状态码（202=已接受，409=冲突）
- 同步任务是异步执行的，通过监控接口查询执行结果
- 通过 `/api/v1/sync/batches/{batch_id}/logs` 查看详细错误日志

**数据查询接口错误处理：**

- 检查响应中的 `code` 字段判断业务状态
- 使用 `requestId` 字段追踪请求链路
- HTTP 状态码和业务状态码可能不同

### 4. 并发控制

- 同一类型的同步任务不能并发执行
- 如果收到 409 错误，说明已有任务在运行
- 等待当前任务完成后再触发新任务
- 可通过 `/api/v1/sync/status` 查询当前运行状态

### 5. 分页查询

- 页码从 1 开始
- 合理设置 `pageSize`，建议不超过 100
- 员工和职务列表支持关键词搜索
- 搜索时使用 URL 编码处理特殊字符

### 6. 请求追踪

- 所有核心数据查询接口响应都包含 `requestId`
- 使用 `requestId` 追踪请求链路
- 在日志文件中可通过 `requestId` 查找详细日志

---

## 附录

### A. 字段说明

#### 员工字段（EmployeeVO）

| 字段             | 类型   | 说明                       |
| ---------------- | ------ | -------------------------- |
| id               | string | 员工内部ID                 |
| employeeNo       | string | 员工工号                   |
| name             | string | 员工姓名                   |
| email            | string | 邮箱地址                   |
| phone            | string | 手机号码                   |
| employmentDate   | string | 入职日期（ISO 8601格式）   |
| employmentStatus | string | 在职状态                   |
| position         | string | 职务（字符串）             |
| organizationId   | string | 所属组织ID（可能为null）   |
| organizationName | string | 所属组织名称（可能为null） |
| jobPostId        | string | 职务ID（可能为null）       |
| jobPostName      | string | 职务名称（可能为null）     |

#### 组织字段（OrganizationTreeNodeVO）

| 字段     | 类型    | 说明                     |
| -------- | ------- | ------------------------ |
| id       | string  | 组织ID                   |
| name     | string  | 组织名称                 |
| code     | string  | 组织编码                 |
| parentId | string  | 父组织ID（根节点为null） |
| level    | integer | 组织层级                 |
| children | array   | 子组织列表               |

#### 职务字段（PositionVO）

| 字段 | 类型   | 说明     |
| ---- | ------ | -------- |
| id   | string | 职务ID   |
| name | string | 职务名称 |
| code | string | 职务编码 |

### B. 时间格式

所有时间字段使用 ISO 8601 格式：

- 格式：`YYYY-MM-DDTHH:mm:ssZ`
- 示例：`2025-12-23T01:00:00Z`
- 时区：UTC

### C. 同步批次状态

| 状态    | 说明               |
| ------- | ------------------ |
| running | 同步任务正在执行中 |
| success | 同步任务执行成功   |
| failed  | 同步任务执行失败   |

### D. 触发模式

| 模式      | 说明                   |
| --------- | ---------------------- |
| manual    | 手动触发（通过 API）   |
| scheduled | 定时触发（通过调度器） |

---

## 技术支持

如有问题，请参考：

- [README.md](../README.md) - 项目说明
- [migration-guide.md](migration-guide.md) - 迁移指南
- [测试文档](../tests/README.md) - 测试用例说明
- [核心数据 API 实现总结](../specs/003-core-data-api/IMPLEMENTATION-SUMMARY.md) - 核心数据 API 详细说明
