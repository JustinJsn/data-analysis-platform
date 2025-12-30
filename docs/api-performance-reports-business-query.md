# 绩效数据业务查询接口 API 文档

## 接口信息

- **接口路径**: `GET /api/v1/performance-reports/business-query`
- **接口描述**: 根据查询条件查询绩效数据，支持年份范围、季度范围、员工列表、部门等多种查询条件，返回以员工为聚合点的绩效数据
- **Content-Type**: `application/json` (请求和响应)

## 请求参数

### 查询参数 (Query Parameters)

所有参数通过 URL 查询字符串传递。

#### 参数说明

| 参数名              | 类型    | 必填 | 说明                                                                           | 示例值                                   |
| ------------------- | ------- | ---- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| `pageNum`           | integer | 否   | 页码，从 1 开始，默认 `1`                                                      | `1`                                      |
| `pageSize`          | integer | 否   | 每页条数，范围 1-100，默认 `20`                                                | `20`                                     |
| `start_year`        | integer | 否\* | 开始年份（2000-2100）                                                          | `2023`                                   |
| `end_year`          | integer | 否\* | 结束年份（2000-2100）                                                          | `2025`                                   |
| `start_quarter`     | string  | 否   | 开始季度，必须与 `end_quarter` 同时提供                                        | `"Q1"`                                   |
| `end_quarter`       | string  | 否   | 结束季度，必须与 `start_quarter` 同时提供                                      | `"Q4"`                                   |
| `employee_user_ids` | string  | 否   | 员工 UserId 列表（**北森ID/BeisenID，数字格式字符串**），逗号分隔，最多 100 个 | `"620538606,620538607"`                  |
| `organization_id`   | string  | 否   | 部门 ID（**UUID 格式**），系统内部会转换为北森ID进行查询                       | `"550e8400-e29b-41d4-a716-446655440000"` |
| `include_children`  | boolean | 否   | 是否包含下级部门，默认 `false`                                                 | `true`                                   |
| `batch_id`          | string  | 否   | 批次 ID（UUID 格式），默认使用最新批次                                         | `"550e8400-e29b-41d4-a716-446655440000"` |

**注意**：

- `*` 表示如果没有提供任何查询条件（年份、季度、员工、部门），系统会自动设置默认值：从当前季度往前推 12 个连续季度（最近 3 年）
- 如果提供了 `start_quarter` 或 `end_quarter`，必须同时提供 `start_year` 和 `end_year`
- `employee_user_ids` 中每个 UserId 最大长度为 50 字符
- 支持跨年度查询（如 `start_year: 2025, end_year: 2022`）
- **ID 格式说明**：
  - `employee_user_ids`: 使用**北森ID（BeisenID）**，为数字格式字符串（如 `"620538606"`），**不是UUID**
  - `organization_id`: 使用**UUID格式**（如 `"550e8400-e29b-41d4-a716-446655440000"`），系统内部会转换为北森ID进行查询
  - `batch_id`: 使用**UUID格式**

### 请求示例

#### 示例 1: 按年份范围查询

```
GET /api/v1/performance-reports/business-query?start_year=2023&end_year=2025&pageNum=1&pageSize=20
```

#### 示例 2: 按季度范围查询

```
GET /api/v1/performance-reports/business-query?start_year=2025&end_year=2025&start_quarter=Q1&end_quarter=Q4&pageNum=1&pageSize=20
```

#### 示例 3: 按员工列表查询（使用北森ID）

```
GET /api/v1/performance-reports/business-query?start_year=2024&end_year=2025&employee_user_ids=620538606,620538607,620538608&pageNum=1&pageSize=20
```

**注意**：`employee_user_ids` 使用北森ID（数字格式字符串），不是UUID。

#### 示例 4: 按部门查询（包含下级部门，使用UUID）

```
GET /api/v1/performance-reports/business-query?start_year=2023&end_year=2025&organization_id=550e8400-e29b-41d4-a716-446655440000&include_children=true&pageNum=1&pageSize=20
```

**注意**：`organization_id` 使用UUID格式，系统内部会转换为北森ID进行查询。

#### 示例 5: 组合查询条件

```
GET /api/v1/performance-reports/business-query?start_year=2024&end_year=2025&start_quarter=Q1&end_quarter=Q4&organization_id=550e8400-e29b-41d4-a716-446655440000&include_children=true&pageNum=1&pageSize=20
```

#### 示例 6: 使用默认查询条件（不提供任何查询条件）

```
GET /api/v1/performance-reports/business-query?pageNum=1&pageSize=20
```

## 响应

### 成功响应

**状态码**: `200 OK`

**响应体** (JSON):

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "employeeNo": "E001",
        "name": "张三",
        "level1Department": "技术部",
        "level2Department": "后端组",
        "level3Department": "API组",
        "level4Department": null,
        "employmentDate": "2020-01-15T00:00:00Z",
        "position": "高级工程师",
        "year2025": {
          "rating": "A"
        },
        "year2024": {
          "rating": "B"
        },
        "year2023": null,
        "2025Q4": "A",
        "2025Q3": "B",
        "2025Q2": "A",
        "2025Q1": "A",
        "2024Q4": "B",
        "2024Q3": "B",
        "2024Q2": "A",
        "2024Q1": "B",
        "ratingCountS": 2,
        "ratingCountA": 3,
        "ratingCountB": 2,
        "ratingCountC": 0,
        "ratingCountD": 0
      }
    ],
    "pageNum": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  },
  "request_id": "xxx-xxx-xxx"
}
```

#### 响应字段说明

**顶层字段**:

- `code`: 业务码，200 表示成功
- `message`: 响应消息
- `data`: 响应数据
- `request_id`: 请求 ID（用于追踪）

**data 字段**:

- `list`: 员工绩效聚合数据列表
- `pageNum`: 当前页码
- `pageSize`: 每页条数
- `total`: 总记录数
- `totalPages`: 总页数

**list 中每个员工对象字段**:

| 字段名             | 类型           | 说明                      | 示例值                   |
| ------------------ | -------------- | ------------------------- | ------------------------ |
| `employeeNo`       | string         | 员工工号                  | `"E001"`                 |
| `name`             | string         | 员工姓名                  | `"张三"`                 |
| `level1Department` | string \| null | 一级部门名称              | `"技术部"`               |
| `level2Department` | string \| null | 二级部门名称              | `"后端组"`               |
| `level3Department` | string \| null | 三级部门名称              | `"API组"`                |
| `level4Department` | string \| null | 四级部门名称              | `null`                   |
| `employmentDate`   | string \| null | 入职日期（ISO 8601 格式） | `"2020-01-15T00:00:00Z"` |
| `position`         | string         | 职务名称                  | `"高级工程师"`           |
| `year2025`         | object \| null | 2025 年度绩效数据         | `{"rating": "A"}`        |
| `year2024`         | object \| null | 2024 年度绩效数据         | `{"rating": "B"}`        |
| `year2023`         | object \| null | 2023 年度绩效数据         | `null`                   |
| `2025Q4`           | string \| null | 2025 年 Q4 季度绩效评级   | `"A"`                    |
| `2025Q3`           | string \| null | 2025 年 Q3 季度绩效评级   | `"B"`                    |
| `2025Q2`           | string \| null | 2025 年 Q2 季度绩效评级   | `"A"`                    |
| `2025Q1`           | string \| null | 2025 年 Q1 季度绩效评级   | `"A"`                    |
| `2024Q4`           | string \| null | 2024 年 Q4 季度绩效评级   | `"B"`                    |
| `2024Q3`           | string \| null | 2024 年 Q3 季度绩效评级   | `"B"`                    |
| `2024Q2`           | string \| null | 2024 年 Q2 季度绩效评级   | `"A"`                    |
| `2024Q1`           | string \| null | 2024 年 Q1 季度绩效评级   | `"B"`                    |
| `ratingCountS`     | integer        | 获得 S 评级的次数         | `2`                      |
| `ratingCountA`     | integer        | 获得 A 评级的次数         | `3`                      |
| `ratingCountB`     | integer        | 获得 B 评级的次数         | `2`                      |
| `ratingCountC`     | integer        | 获得 C 评级的次数         | `0`                      |
| `ratingCountD`     | integer        | 获得 D 评级的次数         | `0`                      |

**注意**:

- 年度绩效数据对象包含 `rating` 字段，值为绩效评级（S、A、B、C、D）或 `null`
- 季度绩效数据直接为字符串，值为绩效评级（S、A、B、C、D）或 `null`
- 年度和季度字段会根据查询条件动态生成，只包含查询范围内的年份和季度
- 如果某个年份或季度没有数据，对应字段为 `null` 或不存在（使用 `omitempty`）

### 错误响应

**状态码**: `400 Bad Request` 或 `500 Internal Server Error`

**响应体** (JSON):

```json
{
  "code": "PARAM_ERROR",
  "message": "请求参数错误: 季度范围查询需要同时指定开始年份和结束年份。当前值：开始年份=<nil>, 结束年份=<nil>",
  "request_id": "xxx-xxx-xxx"
}
```

#### 常见错误码

| 错误码         | 说明         | 示例                                 |
| -------------- | ------------ | ------------------------------------ |
| `PARAM_ERROR`  | 请求参数错误 | 季度范围验证失败、员工列表格式错误等 |
| `SYSTEM_ERROR` | 系统错误     | 数据库查询失败等                     |

#### 错误响应示例

**示例 1: 季度范围验证失败**

```json
{
  "code": "PARAM_ERROR",
  "message": "季度范围验证失败: 开始季度（Q4）必须早于或等于结束季度（Q1）。开始：2025年Q4，结束：2025年Q1",
  "request_id": "abc-123-def"
}
```

**示例 2: 员工列表格式错误**

```json
{
  "code": "PARAM_ERROR",
  "message": "员工UserId列表最多支持100个，当前提供150个。请减少员工数量后重试",
  "request_id": "abc-123-def"
}
```

**示例 3: 部门 ID 格式错误（必须是UUID）**

```json
{
  "code": "PARAM_ERROR",
  "message": "请求参数错误: invalid UUID format",
  "request_id": "abc-123-def"
}
```

**注意**：`organization_id` 必须使用UUID格式，如果使用北森ID会导致此错误。

## 业务规则

### 查询条件规则

1. **默认查询条件**: 如果未提供任何查询条件，系统自动设置：
   - 从当前季度往前推 12 个连续季度（最近 3 年）
   - 例如：当前为 2025 年 Q2，则查询范围为 2022 年 Q3 至 2025 年 Q2

2. **年份范围**:
   - 支持跨年度查询（如 2025 ~ 2022）
   - 年份范围：2000-2100

3. **季度范围**:
   - 必须同时提供 `start_quarter` 和 `end_quarter`
   - 必须同时提供 `start_year` 和 `end_year`
   - 季度值：Q1、Q2、Q3、Q4
   - 同一年内，开始季度必须早于或等于结束季度

4. **员工查询**:
   - 最多支持 100 个员工
   - 每个 UserId 最大长度 50 字符
   - 多个 UserId 用逗号分隔
   - **UserId 必须使用北森ID（BeisenID）**，为数字格式字符串（如 `"620538606"`），**不是UUID**
   - 该ID对应北森系统中的 `userID` 字段

5. **部门查询**:
   - `organization_id` 必须使用**UUID格式**（如 `"550e8400-e29b-41d4-a716-446655440000"`）
   - 系统内部会将UUID转换为北森ID（部门路径ID）进行查询
   - `include_children: true` 时包含所有下级部门（递归）
   - 部门查询最终基于部门路径 ID（BeisenID）进行匹配

6. **批次选择**:
   - 如果不指定 `batch_id`，系统会使用最新的同步批次数据
   - `batch_id` 必须是有效的 UUID 格式

### 数据聚合规则

1. **员工聚合**: 查询结果以员工为聚合点，每个员工一条记录
2. **年度绩效**: 每个年份的年度绩效评级（如果有）存储在对应的 `year{年份}` 字段中
3. **季度绩效**: 每个季度的绩效评级存储在对应的 `{年份}{季度}` 字段中（如 `2025Q4`）
4. **评级统计**: 自动统计每个员工在查询范围内获得各评级的次数

### 分页规则

1. **分页参数**:
   - `pageNum`: 从 1 开始，默认 1
   - `pageSize`: 范围 1-100，默认 20

2. **分页逻辑**:
   - 分页基于员工数量（去重后的员工列表）
   - 每个员工包含该员工在查询范围内的所有绩效数据

## 使用示例

### cURL 示例

```bash
# 按年份范围查询
curl -X GET "http://localhost:8080/api/v1/performance-reports/business-query?start_year=2023&end_year=2025&pageNum=1&pageSize=20"

# 按部门查询（包含下级部门，使用UUID）
curl -X GET "http://localhost:8080/api/v1/performance-reports/business-query?start_year=2023&end_year=2025&organization_id=550e8400-e29b-41d4-a716-446655440000&include_children=true&pageNum=1&pageSize=20"

# 按员工列表查询（使用北森ID，不是UUID）
curl -X GET "http://localhost:8080/api/v1/performance-reports/business-query?start_year=2024&end_year=2025&employee_user_ids=620538606,620538607&pageNum=1&pageSize=20"
```

### JavaScript (Fetch) 示例

```javascript
async function queryPerformanceReports() {
  const params = new URLSearchParams({
    start_year: 2023,
    end_year: 2025,
    organization_id: '550e8400-e29b-41d4-a716-446655440000',
    include_children: true,
    pageNum: 1,
    pageSize: 20,
  });

  const response = await fetch(`/api/v1/performance-reports/business-query?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('查询失败:', error.message);
    return;
  }

  const result = await response.json();
  console.log('查询成功:', result.data);
  console.log('总记录数:', result.data.total);
  console.log('总页数:', result.data.totalPages);
  console.log('员工列表:', result.data.list);
}

queryPerformanceReports();
```

### Python 示例

```python
import requests

def query_performance_reports():
    url = "http://localhost:8080/api/v1/performance-reports/business-query"
    params = {
        "start_year": 2023,
        "end_year": 2025,
        "organization_id": "550e8400-e29b-41d4-a716-446655440000",
        "include_children": True,
        "pageNum": 1,
        "pageSize": 20,
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        result = response.json()
        data = result["data"]
        print(f"查询成功: 总记录数={data['total']}, 总页数={data['totalPages']}")
        print(f"当前页员工数: {len(data['list'])}")
        for employee in data["list"]:
            print(f"员工: {employee['name']}, 工号: {employee['employeeNo']}")
    else:
        error = response.json()
        print(f"查询失败: {error['message']}")

query_performance_reports()
```

## 注意事项

1. **ID 格式重要提示**:
   - **员工ID (`employee_user_ids`)**: 必须使用**北森ID（BeisenID）**，为数字格式字符串（如 `"620538606"`），**不是UUID**。该ID对应北森系统中的 `userID` 字段。
   - **部门ID (`organization_id`)**: 必须使用**UUID格式**（如 `"550e8400-e29b-41d4-a716-446655440000"`），系统内部会自动转换为北森ID进行查询。
   - **批次ID (`batch_id`)**: 必须使用**UUID格式**。

2. **查询性能**: 对于大量数据的查询，建议使用合理的分页参数，避免单次查询过多数据

3. **默认查询条件**: 如果不提供任何查询条件，系统会自动设置默认值（最近 3 年），这可能会影响查询性能

4. **部门查询**: 当 `include_children: true` 时，系统会递归查询所有下级部门，对于大型组织可能耗时较长

5. **批次选择**: 如果不指定 `batch_id`，系统会使用最新的同步批次数据，确保数据是最新的

6. **空结果处理**: 如果查询结果为空，`list` 字段将为空数组，`total` 为 0

7. **字段动态性**: 年度和季度字段会根据查询条件动态生成，只包含查询范围内的年份和季度

## 相关接口

- [绩效数据导出接口](./api-performance-reports-export.md): `POST /api/v1/performance-reports/export`
- [绩效数据列表查询接口](./api-performance-reports-list.md): `GET /api/v1/performance-reports`
