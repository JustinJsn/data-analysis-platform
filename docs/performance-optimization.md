# 性能优化指南

本文档记录了数据分析平台的性能优化措施和最佳实践。

---

## 📦 已实施的优化

### 1. 路由级代码分割 ✅

所有路由组件都使用动态导入（`import()`），实现按需加载：

```typescript
// src/router/routes.ts
{
  path: '/dashboard',
  component: () => import('@/views/dashboard/DashboardPage.vue'),
}
```

**优势：**

- 减少初始加载体积
- 提升首屏加载速度
- 用户只加载访问的页面代码

---

### 2. Vite 构建优化 ✅

#### Chunk 分割策略

```typescript
// vite.config.ts
manualChunks: {
  vue: ['vue', 'vue-router', 'pinia'],
  'element-plus': ['element-plus', '@element-plus/icons-vue'],
  vendor: ['axios', 'nprogress'],
}
```

**优势：**

- 第三方库独立缓存
- 减少主应用代码变更时的缓存失效
- 提升构建效率

#### CSS 代码分割

```typescript
build: {
  cssCodeSplit: true,
}
```

**优势：**

- 按路由分离 CSS
- 减少首屏 CSS 体积
- 提升样式加载性能

---

### 3. Unplugin 自动导入 ✅

#### 组件自动导入

```typescript
Components({
  resolvers: [ElementPlusResolver()],
})
```

**优势：**

- 无需手动导入组件
- 按需引入 Element Plus 组件
- 减少打包体积

#### API 自动导入

```typescript
AutoImport({
  resolvers: [ElementPlusResolver()],
})
```

**优势：**

- 自动导入常用 API（ref, computed 等）
- 减少样板代码
- 提升开发体验

---

### 4. nprogress 加载进度 ✅

在 HTTP 请求和路由切换时显示进度条：

```typescript
// src/utils/request.ts
request.interceptors.request.use((config) => {
  NProgress.start();
  return config;
});

// src/router/guards.ts
router.beforeEach(() => {
  NProgress.start();
});
```

**优势：**

- 提升用户体验
- 避免加载时的空白感
- 提供视觉反馈

---

## 🚀 进一步优化建议

### 1. 图片优化

```bash
# 安装图片优化插件
pnpm add -D vite-plugin-imagemin
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin';

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    pngquant: { quality: [0.8, 0.9], speed: 4 },
    svgo: {
      plugins: [
        { name: 'removeViewBox' },
        { name: 'removeEmptyAttrs', active: false },
      ],
    },
  }),
]
```

---

### 2. 虚拟滚动

对于大列表（如员工列表），考虑使用虚拟滚动：

```bash
pnpm add vue-virtual-scroller
```

```vue
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <EmployeeItem :employee="item" />
    </template>
  </RecycleScroller>
</template>
```

---

### 3. 组件懒加载

对于条件渲染的重型组件，使用 `defineAsyncComponent`：

```typescript
import { defineAsyncComponent } from 'vue';

const HeavyComponent = defineAsyncComponent(() =>
  import('./components/HeavyComponent.vue')
);
```

---

### 4. Gzip 压缩

```bash
pnpm add -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

plugins: [
  viteCompression({
    algorithm: 'gzip',
    ext: '.gz',
  }),
]
```

---

### 5. PWA 支持

```bash
pnpm add -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    },
  }),
]
```

---

## 📊 性能监控

### 1. Lighthouse 测试

```bash
# 安装 Lighthouse
npm install -g @lhci/cli

# 运行测试
lhci autorun --upload.target=temporary-public-storage
```

### 2. Bundle 分析

```bash
# 安装分析工具
pnpm add -D rollup-plugin-visualizer

# 构建并生成报告
pnpm run build
```

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  visualizer({
    open: true,
    gzipSize: true,
    brotliSize: true,
  }),
]
```

---

## ✅ 性能检查清单

- [x] 路由级代码分割
- [x] 组件按需导入
- [x] CSS 代码分割
- [x] Chunk 分割策略
- [x] 加载进度提示
- [ ] 图片优化
- [ ] 虚拟滚动（大列表）
- [ ] Gzip 压缩
- [ ] PWA 支持
- [ ] Service Worker 缓存

---

## 📈 预期性能指标

### 目标指标

- **首屏加载时间（FCP）**: < 1.5s
- **可交互时间（TTI）**: < 3.0s
- **首次输入延迟（FID）**: < 100ms
- **累积布局偏移（CLS）**: < 0.1
- **最大内容绘制（LCP）**: < 2.5s

### Lighthouse 评分目标

- **Performance**: > 90
- **Accessibility**: > 95
- **Best Practices**: > 90
- **SEO**: > 90

---

## 📝 注意事项

1. **开发环境**：某些优化（如压缩）仅在生产环境生效
2. **缓存策略**：合理配置 HTTP 缓存头
3. **CDN 加速**：考虑使用 CDN 托管静态资源
4. **监控告警**：集成性能监控工具（如 Sentry Performance）

---

**更新日期:** 2025-12-24  
**维护者:** 开发团队
