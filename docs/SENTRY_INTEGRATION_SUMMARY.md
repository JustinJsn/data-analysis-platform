# Sentry 集成完成总结

## 📋 完成任务清单

- ✅ **T173** - 创建 `src/utils/sentry.ts` Sentry 初始化配置
- ✅ **T174** - 在 `src/main.ts` 调用 `initSentry()` 初始化 Sentry
- ✅ **T175** - 在全局错误处理器中集成 `Sentry.captureException()`
- ✅ **T176** - 在 Axios 拦截器中集成 Sentry 错误上报

## 🎯 已实现功能

### 1. 核心集成

| 功能              | 文件位置               | 说明                           |
| ----------------- | ---------------------- | ------------------------------ |
| Sentry 初始化配置 | `src/utils/sentry.ts`  | 包含完整的初始化配置和工具函数 |
| 应用初始化        | `src/main.ts`          | 在应用启动时初始化 Sentry      |
| 全局错误处理      | `src/main.ts`          | Vue 全局错误处理器集成         |
| HTTP 错误上报     | `src/utils/request.ts` | Axios 拦截器集成               |
| 用户信息追踪      | `src/stores/auth.ts`   | 登录/登出时设置用户信息        |

### 2. 错误监控功能

#### ✅ 自动捕获

- **Vue 组件错误**: 通过全局错误处理器自动捕获
- **HTTP 错误**: 5xx、网络错误、配置错误自动上报
- **路由错误**: 集成 Vue Router 追踪
- **未处理的 Promise 拒绝**: 自动捕获

#### ✅ 错误过滤

已配置过滤规则，避免无意义错误：

- 浏览器扩展相关错误
- 401 认证错误（由路由守卫处理）
- 404 错误（常见错误）
- 网络超时（部分场景）

#### ✅ 用户追踪

- 登录时自动设置用户信息（ID、用户名、邮箱、姓名）
- 登出时自动清除用户信息
- 错误报告中包含用户上下文

#### ✅ 面包屑记录

- API 业务错误自动记录为面包屑
- 支持手动添加面包屑追踪用户行为

### 3. 性能监控

- **性能采样率**:
  - 生产环境: 50%
  - 开发环境: 100%
- **Session Replay**:
  - 常规会话: 10%
  - 错误会话: 100%

- **路由追踪**: 自动追踪页面切换性能

### 4. 开发体验

- **开发环境调试**: 所有错误同时输出到控制台
- **智能过滤**: 避免干扰性错误上报
- **灵活配置**: 通过环境变量控制启用/禁用
- **类型安全**: 完整的 TypeScript 类型定义

## 📦 新增文件

```
src/
├── utils/
│   └── sentry.ts                    # Sentry 工具函数（新建）
├── views/
│   └── SentryTestPage.vue          # 测试页面（新建）
docs/
├── sentry-integration.md           # 集成文档（新建）
└── SENTRY_INTEGRATION_SUMMARY.md  # 本文件（新建）
```

## 🔧 修改文件

```
src/
├── main.ts                         # 添加 Sentry 初始化和全局错误处理
├── utils/request.ts                # Axios 拦截器集成 Sentry
├── stores/auth.ts                  # 集成用户信息追踪
.env.development                    # 添加 VITE_SENTRY_DSN
.env.production                     # 添加 VITE_SENTRY_DSN
specs/001-data-analysis-platform/
└── tasks.md                        # 更新任务状态
```

## 🚀 使用方法

### 环境配置

```bash
# .env.development 或 .env.production
VITE_SENTRY_DSN=http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2
```

### 自动捕获（无需手动调用）

```typescript
// Vue 组件错误 - 自动捕获
throw new Error('Something went wrong');

// HTTP 错误 - 自动捕获
await request.get('/api/endpoint');
```

### 手动使用 API

```typescript
import { captureError, captureMessage, addBreadcrumb } from '@/utils/sentry';

// 1. 捕获错误
captureError(error, { context: '额外信息' });

// 2. 记录消息
captureMessage('重要操作完成', 'info');

// 3. 添加面包屑
addBreadcrumb({
  message: '用户点击了按钮',
  category: 'user-action',
  data: { buttonId: 'export' },
});
```

## 🧪 测试验证

### 方法 1: 使用测试页面

访问开发环境中的测试页面（需要在路由中添加）：

```typescript
// src/router/routes.ts
{
  path: '/sentry-test',
  name: 'SentryTest',
  component: () => import('@/views/SentryTestPage.vue'),
}
```

### 方法 2: 浏览器控制台

```javascript
// 触发测试错误
throw new Error('Sentry 测试错误');
```

### 方法 3: API 测试

```typescript
// 触发 API 错误
await request.get('/non-existent-endpoint');
```

## 📊 监控内容

### 在 Sentry 控制台可以看到：

1. **错误详情**
   - 错误堆栈
   - 错误发生的组件/文件
   - 错误发生时的路由
2. **用户信息**
   - 用户 ID
   - 用户名
   - 邮箱
   - 姓名

3. **面包屑**
   - 用户操作历史
   - API 调用记录
   - 路由导航历史

4. **设备信息**
   - 浏览器类型和版本
   - 操作系统
   - 屏幕分辨率
   - IP 地址（已启用）

5. **性能数据**
   - 页面加载时间
   - API 响应时间
   - 路由切换耗时

## ⚙️ 配置项说明

| 配置项                     | 默认值                 | 说明                  |
| -------------------------- | ---------------------- | --------------------- |
| `dsn`                      | 从环境变量读取         | Sentry DSN 地址       |
| `environment`              | `import.meta.env.MODE` | 环境标识              |
| `tracesSampleRate`         | 生产 0.5 / 开发 1.0    | 性能监控采样率        |
| `replaysSessionSampleRate` | 0.1                    | Session Replay 采样率 |
| `replaysOnErrorSampleRate` | 1.0                    | 错误会话重放采样率    |
| `sendDefaultPii`           | `true`                 | 发送默认 PII 数据     |

## 🎓 最佳实践

### 1. 关键操作错误处理

```typescript
try {
  await criticalOperation();
} catch (error) {
  captureError(error as Error, {
    operation: 'critical-operation',
    userId: user.value.id,
  });
  ElMessage.error('操作失败');
}
```

### 2. 添加操作上下文

```typescript
addBreadcrumb({
  message: '开始数据导出',
  category: 'export',
  data: { filters, total },
});
```

### 3. 设置自定义标签

```typescript
import * as Sentry from '@sentry/vue';

Sentry.setTag('feature', 'data-export');
Sentry.setTag('user_role', user.role);
```

## 📝 注意事项

1. **隐私保护**: 已启用 PII 数据收集，包括 IP 地址。如有需要可关闭。

2. **采样率**: 生产环境性能监控采样率为 50%，可根据需要调整。

3. **错误过滤**: 已过滤 401、404 等常见错误，避免噪音。

4. **开发环境**: 建议开发时保持启用，帮助发现问题。

5. **禁用方法**: 删除或注释环境变量中的 `VITE_SENTRY_DSN` 即可禁用。

## 🔗 相关链接

- **Sentry 控制台**: http://192.168.0.161:9000/
- **项目 ID**: 2
- **DSN**: `http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2`
- **集成文档**: [docs/sentry-integration.md](./sentry-integration.md)

## ✨ 下一步建议

1. **测试验证**: 使用测试页面验证各项功能
2. **查看事件**: 登录 Sentry 控制台查看上报的事件
3. **调整配置**: 根据实际需求调整采样率和过滤规则
4. **团队培训**: 向团队成员介绍如何查看和分析错误
5. **告警配置**: 在 Sentry 中配置邮件或 Webhook 告警

## 🎉 总结

Sentry 错误监控系统已完全集成到项目中，具备：

- ✅ **自动化**: 无需手动调用，自动捕获各类错误
- ✅ **智能化**: 过滤无意义错误，只上报关键问题
- ✅ **可追踪**: 完整的用户信息和操作历史
- ✅ **可调试**: 开发环境双重输出，便于调试
- ✅ **可配置**: 灵活的配置选项，适应不同场景

现在可以实时监控生产环境的错误和性能问题了！🚀
