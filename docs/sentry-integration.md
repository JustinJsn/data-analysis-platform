# Sentry 错误监控集成指南

## 概述

本项目已集成 Sentry 错误监控系统，用于实时追踪和分析生产环境中的错误和性能问题。

## 配置说明

### 1. 环境变量配置

在 `.env.development` 和 `.env.production` 文件中配置 Sentry DSN：

```bash
# Sentry DSN（私有化部署地址）
VITE_SENTRY_DSN=http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2
```

### 2. 初始化配置

Sentry 在 `src/main.ts` 中自动初始化，配置文件位于 `src/utils/sentry.ts`。

**主要配置项：**

- **DSN**: 私有化 Sentry 地址
- **环境标识**: 自动使用 `import.meta.env.MODE`（development/production）
- **性能监控**: 生产环境 50% 采样率，开发环境 100%
- **Session Replay**: 10% 常规会话，100% 错误会话
- **路由追踪**: 自动集成 Vue Router
- **PII 数据**: 启用默认 PII 数据收集（IP 地址等）

## 功能特性

### 1. 全局错误捕获

自动捕获 Vue 组件中的未处理错误：

```typescript
// 自动捕获，无需手动调用
throw new Error('Something went wrong');
```

### 2. HTTP 请求错误追踪

Axios 拦截器自动上报 HTTP 错误：

- ✅ **5xx 服务器错误**: 自动上报
- ✅ **网络错误**: 自动上报
- ✅ **请求配置错误**: 自动上报
- ❌ **401 未授权**: 不上报（由路由守卫处理）
- ❌ **404 资源不存在**: 不上报（常见错误）

### 3. 用户信息追踪

登录后自动关联用户信息到错误报告：

```typescript
// 在 Auth Store 中自动调用
setSentryUser({
  id: user.id,
  username: user.username,
  email: user.email,
  name: user.name,
});

// 登出时自动清除
clearSentryUser();
```

### 4. 业务错误记录

非严重业务错误记录为 Breadcrumb（面包屑）：

```typescript
// API 业务错误自动记录
addBreadcrumb({
  message: '业务错误: 权限不足',
  category: 'api.business-error',
  level: 'warning',
});
```

## 手动使用 Sentry API

### 1. 手动捕获错误

```typescript
import { captureError } from '@/utils/sentry';

try {
  // 一些可能出错的代码
  riskyOperation();
} catch (error) {
  captureError(error as Error, {
    context: '用户操作',
    action: '导出数据',
  });
}
```

### 2. 记录消息

```typescript
import { captureMessage } from '@/utils/sentry';

captureMessage('用户完成了重要操作', 'info');
captureMessage('检测到异常行为', 'warning');
```

### 3. 添加面包屑

```typescript
import { addBreadcrumb } from '@/utils/sentry';

addBreadcrumb({
  message: '用户点击了导出按钮',
  category: 'user-action',
  level: 'info',
  data: {
    filters: { status: 'active' },
    pageSize: 100,
  },
});
```

### 4. 设置自定义上下文

```typescript
import * as Sentry from '@sentry/vue';

// 设置标签
Sentry.setTag('feature', 'data-export');

// 设置上下文
Sentry.setContext('export-config', {
  format: 'xlsx',
  fields: ['name', 'email', 'phone'],
});
```

## 错误过滤规则

以下错误会被自动过滤，不会上报到 Sentry：

1. **浏览器扩展错误**:
   - `ResizeObserver loop limit exceeded`
   - `Non-Error promise rejection captured`

2. **网络相关错误**（已在 Axios 中处理）:
   - `Network Error`
   - `timeout`

3. **401 认证错误**（由路由守卫处理）

## 开发环境调试

开发环境下，所有上报到 Sentry 的错误都会同时输出到浏览器控制台：

```bash
[Sentry] Error: Something went wrong
    at Component.vue:42
    ...
```

## 生产环境部署

### 1. 环境变量设置

确保 `.env.production` 中配置了正确的 Sentry DSN：

```bash
VITE_SENTRY_DSN=http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2
```

### 2. 构建应用

```bash
pnpm build
```

### 3. 验证集成

访问 Sentry 控制台查看是否收到事件：

```
http://192.168.0.161:9000/organizations/sentry/projects/
```

## 最佳实践

### 1. 错误边界

在关键组件中使用 `try-catch` 捕获特定错误：

```vue
<script setup lang="ts">
import { captureError } from '@/utils/sentry';

const handleCriticalOperation = async () => {
  try {
    await criticalOperation();
  } catch (error) {
    captureError(error as Error, {
      operation: 'critical-operation',
      userId: currentUser.value?.id,
    });
    ElMessage.error('操作失败，请稍后重试');
  }
};
</script>
```

### 2. 添加上下文信息

在执行重要操作前添加面包屑：

```typescript
addBreadcrumb({
  message: '开始导出数据',
  category: 'data-export',
  data: {
    filters: currentFilters.value,
    total: totalRecords.value,
  },
});
```

### 3. 设置用户标签

为不同类型的用户设置标签：

```typescript
import * as Sentry from '@sentry/vue';

Sentry.setTag('user_role', user.role);
Sentry.setTag('department', user.department);
```

### 4. 性能监控

关键操作添加性能追踪：

```typescript
import * as Sentry from '@sentry/vue';

const transaction = Sentry.startTransaction({
  name: '数据导出',
  op: 'export',
});

try {
  await exportData();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## 常见问题

### Q: Sentry 未初始化？

**A:** 检查环境变量 `VITE_SENTRY_DSN` 是否配置正确。未配置 DSN 时，Sentry 会输出警告但不会影响应用运行。

### Q: 错误没有上报到 Sentry？

**A:** 检查以下几点：

1. 错误是否在过滤规则中
2. 浏览器控制台是否有 Sentry 相关错误
3. 网络请求是否被防火墙拦截

### Q: 如何禁用 Sentry？

**A:** 删除或注释 `.env` 文件中的 `VITE_SENTRY_DSN` 配置即可。

### Q: 开发环境需要启用 Sentry 吗？

**A:** 建议启用，可以帮助在开发阶段发现潜在问题。如需禁用，删除 `.env.development` 中的 DSN 配置。

## 相关资源

- [Sentry 官方文档](https://docs.sentry.io/)
- [Sentry Vue SDK](https://docs.sentry.io/platforms/javascript/guides/vue/)
- [私有化部署地址](http://192.168.0.161:9000/)

## 任务清单

- [x] T173 创建 src/utils/sentry.ts Sentry 初始化配置
- [x] T174 在 src/main.ts 调用 initSentry() 初始化 Sentry
- [x] T175 在全局错误处理器中集成 Sentry.captureException()
- [x] T176 在 Axios 拦截器中集成 Sentry 错误上报
- [x] 配置环境变量（.env.development 和 .env.production）
- [x] 集成用户信息追踪（Auth Store）
- [x] 编写集成文档

## 更新日志

**2025-12-24**

- ✅ 完成 Sentry 私有化部署集成
- ✅ 实现全局错误捕获
- ✅ 实现 HTTP 错误自动上报
- ✅ 实现用户信息追踪
- ✅ 配置错误过滤规则
- ✅ 编写使用文档
