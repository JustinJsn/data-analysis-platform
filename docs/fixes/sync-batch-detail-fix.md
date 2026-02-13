# 日志详情页面显示修复

## 问题描述

日志详情页面 (`/sync/batches/$batch_id`) 无法正确显示同步日志数据。

## 问题分析

### 问题1: Store数据字段名不匹配

Store中的数据转换逻辑与Vue组件期望的字段名不匹配：

- **Store转换后的字段**: `recordIdentifier`, `processedAt`, `recordDetails`, `errorMessage`, `errorCode`
- **组件期望的字段**: `recordId`, `timestamp`, `details`, `message`, `level`

这导致Vue组件无法正确读取和显示日志数据。

### 问题2: Level状态显示不正确

Vue组件检查`row.level === 'error'`来显示失败状态，但后端实际返回的是`'failed'`，导致失败记录显示为灰色info标签而不是红色danger标签。

### 问题3: Details字段显示不友好

`formatDetails`函数将JSON格式化为多行缩进格式，在表格单元格中显示不清晰。

## 修复内容

### 1. 修改Store数据转换逻辑 (`src/stores/sync.ts`)

简化了`fetchBatchDetail`方法中的日志数据转换，直接映射后端字段到组件需要的字段：

```typescript
// 修复前：复杂的转换逻辑，字段名不匹配
currentLogs.value = response.logs.logs.map((log) => ({
  recordIdentifier: log.record_id,  // ❌ 组件期望 recordId
  processedAt: log.created_at,       // ❌ 组件期望 timestamp
  recordDetails: JSON.parse(...),    // ❌ 组件期望 details (字符串)
  errorMessage: ...,                 // ❌ 组件期望 message
  errorCode: ...,                    // ❌ 组件期望 level
  // ...
}));

// 修复后：简化的转换逻辑，字段名匹配
currentLogs.value = response.logs.logs.map((log) => ({
  id: log.log_id,
  batchId: log.batch_id,
  recordType: log.record_type,
  recordId: log.record_id,           // ✅ 正确映射
  status: log.status,
  level: log.level,                   // ✅ 保持原始值
  message: log.message,               // ✅ 保持原始值
  details: log.details,               // ✅ 保持JSON字符串格式
  timestamp: log.created_at,          // ✅ 正确映射
}));
```

### 2. 更新类型定义 (`src/types/sync.ts`)

更新`SyncLog`接口，使其与实际使用的字段一致：

```typescript
export interface SyncLog {
  id: string;
  batchId: string;
  recordType: string;
  recordId: string;           // 从 recordIdentifier 改为 recordId
  status: 'success' | 'failed';
  level: string;              // 新增
  message: string;            // 从 errorMessage 改为 message
  details: string;            // 从 recordDetails (对象) 改为 details (字符串)
  timestamp: string;          // 从 processedAt/createdAt 改为 timestamp
}
```

### 3. 修复Level状态显示 (`src/views/sync/SyncBatchDetailPage.vue`)

更新level列的判断逻辑，正确处理`'failed'`状态：

```vue
<!-- 修复前 -->
<el-tag v-else-if="row.level === 'error'" type="danger" size="small">
  {{ row.level }}
</el-tag>

<!-- 修复后 -->
<el-tag v-else-if="row.level === 'failed' || row.level === 'error'" type="danger" size="small">
  失败
</el-tag>
```

同时改进了标签显示文字：

- `success` → "成功"
- `failed/error` → "失败"
- `warning` → "警告"

### 4. 优化Details字段显示 (`src/views/sync/SyncBatchDetailPage.vue`)

改进`formatDetails`函数，提取关键字段显示而不是完整JSON：

```typescript
// 修复前：显示多行缩进JSON
return JSON.stringify(parsed, null, 2);

// 修复后：提取关键字段显示
const keyFields: string[] = [];
if (parsed.code) keyFields.push(`code: ${parsed.code}`);
if (parsed.name) keyFields.push(`name: ${parsed.name}`);
if (parsed.oId) keyFields.push(`oId: ${parsed.oId}`);

return keyFields.length > 0
  ? keyFields.join(', ')
  : JSON.stringify(parsed);
```

示例输出：`code: 12105057, name: 集团部门, oId: 1725925`

### 5. 新增单元测试

- `tests/stores/sync.test.ts` - 验证Store数据转换逻辑（2个测试）
- `tests/utils/format-details.test.ts` - 验证details格式化逻辑（8个测试）

## 验证结果

- ✅ TypeScript类型检查通过
- ✅ 所有单元测试通过（164个测试，新增10个）
- ✅ Lint检查无新增警告
- ✅ 日志详情页面现在可以正确显示：
  - ✅ 记录ID - 正确显示
  - ✅ 记录类型 - 正确显示为标签
  - ✅ 状态 - 成功/失败显示正确颜色
  - ✅ 级别 - 失败状态显示为红色"失败"标签
  - ✅ 消息 - 正确显示错误或成功消息
  - ✅ 详情 - 显示关键字段（code, name, oId）
  - ✅ 时间戳 - 正确格式化显示

## 显示效果对比

### 修复前

- Level列：失败记录显示为灰色标签，文字为原始level值（`failed`）
- Details列：显示多行缩进JSON，在表格中难以阅读

### 修复后

- Level列：失败记录显示为红色"失败"标签，成功记录显示为绿色"成功"标签
- Details列：显示清晰的关键信息，如 `code: 12105057, name: 集团部门, oId: 1725925`

## 影响范围

仅影响日志详情页面的数据展示，不影响其他功能。

## 相关文件

- `src/stores/sync.ts` - Store数据转换逻辑
- `src/types/sync.ts` - SyncLog类型定义
- `src/views/sync/SyncBatchDetailPage.vue` - 日志详情页面组件
- `tests/stores/sync.test.ts` - Store单元测试
- `tests/utils/format-details.test.ts` - Details格式化测试
