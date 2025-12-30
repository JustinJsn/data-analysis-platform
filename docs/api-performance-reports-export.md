# 绩效数据导出接口 API 文档

## 接口信息

- **接口路径**: `POST /api/v1/performance-reports/export`
- **接口描述**: 根据查询条件导出绩效数据，支持 CSV 格式导出
- **Content-Type**: `application/json` (请求), `text/csv; charset=utf-8` (响应)

## 请求参数

### 请求体 (JSON)

请求体包含业务查询条件和导出格式参数。

#### 基础结构

```json
{
  "format": "csv",
  "start_year": 2023,
  "end_year": 2025,
  "start_quarter": "Q1",
  "end_quarter": "Q4",
  "employee_user_ids": "620538606,620538607",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_children": true,
  "batch_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 参数说明

| 参数名              | 类型    | 必填 | 说明                                                                | 示例值                                   |
| ------------------- | ------- | ---- | ------------------------------------------------------------------- | ---------------------------------------- |
| `format`            | string  | 是   | 导出格式，目前仅支持 `csv`                                          | `"csv"`                                  |
| `start_year`        | integer | 否\* | 开始年份（2000-2100）                                               | `2023`                                   |
| `end_year`          | integer | 否\* | 结束年份（2000-2100）                                               | `2025`                                   |
| `start_quarter`     | string  | 否   | 开始季度，必须与 `end_quarter` 同时提供                             | `"Q1"`                                   |
| `end_quarter`       | string  | 否   | 结束季度，必须与 `start_quarter` 同时提供                           | `"Q4"`                                   |
| `employee_user_ids` | string  | 否   | 员工 UserId 列表（北森ID/BeisenID 数字格式），逗号分隔，最多 100 个 | `"620538606,620538607"`                  |
| `organization_id`   | string  | 否   | 部门 ID（系统UUID格式）                                             | `"550e8400-e29b-41d4-a716-446655440000"` |
| `include_children`  | boolean | 否   | 是否包含下级部门，默认 `false`                                      | `true`                                   |
| `batch_id`          | string  | 否   | 批次 ID（UUID），默认使用最新批次                                   | `"550e8400-e29b-41d4-a716-446655440000"` |

**注意**：

- `*` 表示如果没有提供任何查询条件（年份、季度、员工、部门），系统会自动设置默认值：从当前季度往前推 12 个连续季度（最近 3 年）
- 如果提供了 `start_quarter` 或 `end_quarter`，必须同时提供 `start_year` 和 `end_year`
- `employee_user_ids` 中每个 UserId 最大长度为 50 字符
- 支持跨年度查询（如 `start_year: 2025, end_year: 2022`）

**ID 格式说明**：

- **`employee_user_ids`**: 使用**北森ID（BeisenID）**，数字格式（如 `620538606`）。该ID直接对应绩效报告表中的 `employee_user_id` 字段
- **`organization_id`**: 使用**系统UUID**格式（如 `550e8400-e29b-41d4-a716-446655440000`）。系统会根据UUID查询组织表，获取对应的北森ID（BeisenID）进行匹配

### 请求示例

#### 示例 1: 按年份范围导出

```json
{
  "format": "csv",
  "start_year": 2023,
  "end_year": 2025
}
```

#### 示例 2: 按季度范围导出

```json
{
  "format": "csv",
  "start_year": 2025,
  "end_year": 2025,
  "start_quarter": "Q1",
  "end_quarter": "Q4"
}
```

#### 示例 3: 按员工列表导出

```json
{
  "format": "csv",
  "start_year": 2024,
  "end_year": 2025,
  "employee_user_ids": "620538606,620538607,620538608"
}
```

#### 示例 4: 按部门导出（包含下级部门）

```json
{
  "format": "csv",
  "start_year": 2023,
  "end_year": 2025,
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_children": true
}
```

#### 示例 5: 组合查询条件

```json
{
  "format": "csv",
  "start_year": 2024,
  "end_year": 2025,
  "start_quarter": "Q1",
  "end_quarter": "Q4",
  "organization_id": "550e8400-e29b-41d4-a716-446655440000",
  "include_children": true
}
```

## 响应

### 成功响应

**状态码**: `200 OK`

**响应头**:

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename=performance_reports_20250102_150405.csv
```

**响应体**: CSV 文件流

#### CSV 文件格式

CSV 文件包含以下列（按顺序）：

1. **员工基本信息列**（固定 8 列）:
   - `工号`: 员工工号
   - `姓名`: 员工姓名
   - `一级部门`: 一级部门名称
   - `二级部门`: 二级部门名称
   - `三级部门`: 三级部门名称
   - `四级部门`: 四级部门名称
   - `入职日期`: 入职日期（格式：YYYY-MM-DD）
   - `职务`: 职务名称

2. **年度/季度绩效列**（动态列，根据查询条件生成）:
   - 年度列：格式为 `{年份}年度`，如 `2025年度`、`2024年度`
   - 季度列：格式为 `{年份}{季度}`，如 `2025Q4`、`2025Q3`、`2025Q2`、`2025Q1`
   - 列的顺序：按年份从高到低，每个年份先显示年度列，再显示季度列（Q4, Q3, Q2, Q1）
   - 列的值：绩效评级（S、A、B、C、D）或空字符串

3. **评级统计列**（固定 5 列）:
   - `获得S次数`: 获得 S 评级的次数
   - `获得A次数`: 获得 A 评级的次数
   - `获得B次数`: 获得 B 评级的次数
   - `获得C次数`: 获得 C 评级的次数
   - `获得D次数`: 获得 D 评级的次数

#### CSV 示例

```csv
工号,姓名,一级部门,二级部门,三级部门,四级部门,入职日期,职务,2025年度,2025Q4,2025Q3,2025Q2,2025Q1,2024年度,2024Q4,2024Q3,2024Q2,2024Q1,获得S次数,获得A次数,获得B次数,获得C次数,获得D次数
E001,张三,技术部,后端组,API组,,2020-01-15,高级工程师,A,B,A,A,B,2,3,0,0,0
E002,李四,产品部,产品组,,,2021-03-20,产品经理,S,S,S,S,S,5,0,0,0,0
```

### 错误响应

**状态码**: `400 Bad Request` 或 `500 Internal Server Error`

**响应体** (JSON):

```json
{
  "code": "PARAM_ERROR",
  "message": "请求参数错误: 导出格式必须是 csv 或 excel",
  "request_id": "xxx-xxx-xxx"
}
```

#### 常见错误码

| 错误码         | 说明         | 示例                         |
| -------------- | ------------ | ---------------------------- |
| `PARAM_ERROR`  | 请求参数错误 | 导出格式无效、年份范围无效等 |
| `SYSTEM_ERROR` | 系统错误     | 数据库查询失败、导出失败等   |

#### 错误响应示例

**示例 1: 导出格式无效**

```json
{
  "code": "PARAM_ERROR",
  "message": "导出格式必须是 csv 或 excel",
  "request_id": "abc-123-def"
}
```

**示例 2: 季度范围验证失败**

```json
{
  "code": "PARAM_ERROR",
  "message": "季度范围验证失败: 开始季度（Q4）必须早于或等于结束季度（Q1）。开始：2025年Q4，结束：2025年Q1",
  "request_id": "abc-123-def"
}
```

**示例 3: 数据量过大**

```json
{
  "code": "SYSTEM_ERROR",
  "message": "导出失败: 导出数据量过大，最多支持1万名员工，当前有15000名",
  "request_id": "abc-123-def"
}
```

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

4. **员工查询**:
   - 最多支持 100 个员工
   - 每个 UserId 最大长度 50 字符
   - 多个 UserId 用逗号分隔

5. **部门查询**:
   - `organization_id` 必须是有效的系统UUID（如 `550e8400-e29b-41d4-a716-446655440000`），系统会根据UUID查询对应的北森ID进行匹配
   - `include_children: true` 时包含所有下级部门

### 导出限制

1. **数据量限制**:
   - 单次导出最多 10,000 名员工
   - 如果超过限制，返回错误提示

2. **文件大小限制**:
   - 导出文件大小不超过 100MB（估算）

3. **导出格式**:
   - 目前仅支持 CSV 格式
   - Excel 格式暂未实现

### CSV 列生成规则

1. **年度列**: 根据查询的年份范围，为每个年份生成一个年度列
2. **季度列**: 根据查询的年份和季度范围，为每个季度生成一个季度列
3. **列顺序**:
   - 年份从高到低（如 2025 → 2024 → 2023）
   - 每个年份先显示年度列，再显示季度列
   - 季度列顺序：Q4 → Q3 → Q2 → Q1

## 使用示例

### cURL 示例

```bash
curl -X POST "http://localhost:8080/api/v1/performance-reports/export" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "start_year": 2023,
    "end_year": 2025,
    "organization_id": "550e8400-e29b-41d4-a716-446655440000",
    "include_children": true
  }' \
  --output performance_reports.csv
```

### JavaScript (Fetch) 示例

```javascript
async function exportPerformanceReports() {
  const response = await fetch('/api/v1/performance-reports/export', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      format: 'csv',
      start_year: 2023,
      end_year: 2025,
      organization_id: '550e8400-e29b-41d4-a716-446655440000',
      include_children: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('导出失败:', error.message);
    return;
  }

  // 获取文件名
  const contentDisposition = response.headers.get('Content-Disposition');
  const filename = contentDisposition
    ? contentDisposition.split('filename=')[1]
    : 'performance_reports.csv';

  // 下载文件
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
```

### Python 示例

```python
import requests

def export_performance_reports():
    url = "http://localhost:8080/api/v1/performance-reports/export"
    payload = {
        "format": "csv",
        "start_year": 2023,
        "end_year": 2025,
        "organization_id": "550e8400-e29b-41d4-a716-446655440000",
        "include_children": True
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        # 获取文件名
        content_disposition = response.headers.get('Content-Disposition', '')
        filename = 'performance_reports.csv'
        if 'filename=' in content_disposition:
            filename = content_disposition.split('filename=')[1]

        # 保存文件
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"导出成功: {filename}")
    else:
        error = response.json()
        print(f"导出失败: {error['message']}")

export_performance_reports()
```

## 注意事项

1. **文件编码**: CSV 文件使用 UTF-8 编码，包含 BOM（如果客户端需要）
2. **大文件处理**: 对于大量数据，建议使用流式下载，避免内存溢出
3. **错误处理**: 如果响应头已写入但后续处理失败，可能无法返回 JSON 错误响应，请检查响应状态码
4. **性能考虑**: 导出大量数据可能需要较长时间，建议设置合理的超时时间
5. **批次选择**: 如果不指定 `batch_id`，系统会使用最新的同步批次数据

## 相关接口

- [绩效数据业务查询接口](./api-performance-reports-business-query.md): `GET /api/v1/performance-reports/business-query`
- [绩效数据列表查询接口](./api-performance-reports-list.md): `GET /api/v1/performance-reports`
