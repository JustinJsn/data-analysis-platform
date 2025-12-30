# API 合约文档

本文档定义了绩效数据同步功能的 API 接口合约。

## 接口列表

### 1. 获取绩效数据列表

**接口:** `GET /api/v1/performance-reports`

**描述:** 获取绩效数据列表，支持分页和筛选

**请求参数:**

| 参数名                | 类型   | 必填 | 说明                       |
| --------------------- | ------ | ---- | -------------------------- |
| page                  | number | 否   | 页码（从1开始），默认1     |
| pageSize              | number | 否   | 每页条数，默认10           |
| year                  | number | 否   | 年份筛选                   |
| quarter               | string | 否   | 季度筛选（Q1/Q2/Q3/Q4）    |
| employee_name         | string | 否   | 员工姓名搜索（模糊匹配）   |
| employee_user_id      | string | 否   | 员工用户ID搜索（精确匹配） |
| organization_path_ids | string | 否   | 组织路径ID筛选             |
| performance_rating    | string | 否   | 绩效评级筛选               |

**响应示例:**

```json
{
  "list": [
    {
      "id": "38d2595a-2129-4557-8e9e-fc4aea8b470c",
      "batch_id": "dee3a0f8-60af-48ae-8339-1a39e5e82d49",
      "external_system_id": "ac30999e-12b0-45ae-af7c-5c19aa3640aa",
      "year": 2025,
      "quarter": "Q1",
      "employee_name": "义捡妹",
      "employee_user_id": "620538832",
      "organization_full_name": "深圳市亿道控股有限公司/亿道数码/研发体系/质量管理部/PCBA MQA部",
      "organization_path_ids": "900612450/1725924/1981049/1974860/1974867",
      "performance_rating": "B",
      "last_synced_at": "2025-12-27T12:30:57.632041Z",
      "created_at": "2025-12-27T12:30:57.633048Z",
      "updated_at": "2025-12-27T12:30:57.633048Z"
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 100,
  "totalPages": 10
}
```

### 2. 触发绩效数据同步

**接口:** `POST /api/v1/sync/performance-reports`

**描述:** 触发绩效数据同步任务

**请求体:**

```json
{
  "sync_type": "incremental",
  "external_system_id": "ac30999e-12b0-45ae-af7c-5c19aa3640aa",
  "time_range_start": "2025-01-01T00:00:00Z",
  "time_range_end": "2025-12-31T23:59:59Z"
}
```

**请求参数说明:**

| 参数名             | 类型   | 必填 | 说明                                                           |
| ------------------ | ------ | ---- | -------------------------------------------------------------- |
| sync_type          | string | 否   | 同步类型：incremental（增量）或 full（全量），默认 incremental |
| external_system_id | string | 否   | 外部系统ID，不传则同步所有数据源                               |
| time_range_start   | string | 否   | 时间范围开始（ISO 8601格式）                                   |
| time_range_end     | string | 否   | 时间范围结束（ISO 8601格式）                                   |

**响应示例:**

```json
{
  "message": "同步任务已启动",
  "batch_id": "dee3a0f8-60af-48ae-8339-1a39e5e82d49",
  "status": "running"
}
```

## 错误响应

所有接口在发生错误时返回统一的错误响应格式：

```json
{
  "error": "错误信息",
  "code": 400,
  "requestId": "请求追踪ID"
}
```

## 注意事项

1. 所有时间字段使用 ISO 8601 格式（如：2025-12-27T12:30:57.632041Z）
2. 分页参数 page 从 1 开始
3. 同步任务为异步执行，需要通过 batch_id 查询同步状态
4. 筛选参数支持组合使用，多个条件之间为 AND 关系
