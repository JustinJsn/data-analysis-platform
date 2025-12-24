# Sentry 集成快速验证指南

## ✅ 验证步骤

### 1. 检查配置

```bash
# 确认环境变量已配置
cat .env.development | grep SENTRY
# 输出应该显示: VITE_SENTRY_DSN=http://c82f6a00252969d1a1226cf4a879b4ad@192.168.0.161:9000/2
```

### 2. 启动开发服务器

```bash
pnpm dev
```

### 3. 验证初始化

打开浏览器控制台，应该看到：

```
[Sentry] 错误监控已启用
```

如果看到警告 `Sentry DSN 未配置，错误监控已禁用`，说明环境变量未正确加载。

### 4. 测试错误捕获

#### 方法 1: 控制台测试

打开浏览器控制台，输入：

```javascript
throw new Error('Sentry 测试');
```

#### 方法 2: 登录后测试

1. 登录系统
2. 在任意页面打开控制台
3. 输入以下代码：

```javascript
// 测试错误捕获
import('@/utils/sentry').then(({ captureError }) => {
  captureError(new Error('测试错误'), { test: true });
  console.log('✅ 错误已上报到 Sentry');
});

// 测试消息记录
import('@/utils/sentry').then(({ captureMessage }) => {
  captureMessage('测试消息', 'info');
  console.log('✅ 消息已上报到 Sentry');
});
```

#### 方法 3: 使用测试页面

1. 添加测试路由（临时）：

```typescript
// src/router/routes.ts
{
  path: '/sentry-test',
  name: 'SentryTest',
  component: () => import('@/views/SentryTestPage.vue'),
  meta: { requiresAuth: true },
}
```

2. 访问 `http://localhost:5173/sentry-test`
3. 点击各个测试按钮

### 5. 查看 Sentry 控制台

1. 访问: http://192.168.0.161:9000/
2. 登录你的 Sentry 账号
3. 进入项目（ID: 2）
4. 查看 Issues 页面，应该能看到刚才触发的错误

## 🔍 预期结果

### 控制台输出（开发环境）

```
[Sentry] 错误监控已启用
[Sentry] Error: 测试错误
    at ...
```

### Sentry 控制台应显示

- **错误详情**: 完整的错误堆栈
- **环境**: development
- **用户信息**: 登录后包含用户 ID、用户名等
- **面包屑**: 用户操作历史
- **设备信息**: 浏览器、操作系统等

## 🐛 常见问题

### Q1: 看不到初始化消息

**原因**: 环境变量未配置或未生效

**解决方案**:

1. 确认 `.env.development` 文件存在
2. 确认文件中包含 `VITE_SENTRY_DSN=...`
3. 重启开发服务器（`pnpm dev`）

### Q2: 错误没有上报到 Sentry

**原因**:

- 网络连接问题
- DSN 配置错误
- 错误被过滤规则拦截

**解决方案**:

1. 检查浏览器 Network 标签，查看是否有到 Sentry 的请求
2. 确认 DSN 格式正确
3. 确认错误类型不在过滤列表中

### Q3: Sentry 控制台访问不了

**原因**: 私有化 Sentry 服务未启动或网络不通

**解决方案**:

1. 确认 Sentry 服务运行中：`http://192.168.0.161:9000/`
2. 检查网络连接
3. 确认防火墙设置

## ✨ 验证清单

- [ ] 开发服务器正常启动
- [ ] 控制台显示 Sentry 初始化消息
- [ ] 手动触发错误成功
- [ ] Sentry 控制台收到错误事件
- [ ] 错误详情包含正确的环境信息
- [ ] 登录后错误包含用户信息
- [ ] 面包屑正常记录

## 🎉 验证成功标志

当以上所有步骤都通过时，说明 Sentry 集成成功！

你现在可以：

- ✅ 实时监控生产环境错误
- ✅ 追踪用户操作历史
- ✅ 分析性能瓶颈
- ✅ 接收错误告警

---

**验证完成后，记得移除测试代码和测试路由！**
