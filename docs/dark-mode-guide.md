# 暗黑模式使用指南

## 概述

本项目已经完整实现了暗黑模式支持，整合了 Element Plus 和 Tailwind CSS 的暗黑模式方案。

## 技术实现

### 1. Element Plus 暗黑模式

- 导入了 Element Plus 官方暗黑模式 CSS：`element-plus/theme-chalk/dark/css-vars.css`
- 通过 CSS 变量自定义了暗色模式下的主题色和中性色
- 支持 `.dark` class 和 `[data-theme="dark"]` 属性两种方式

### 2. Tailwind CSS 暗黑模式

- 配置了 `darkMode: ['class', '[data-theme="dark"]']` 双重策略
- 扩展了完整的主题色系统（primary, success, warning, danger, info）
- 优化了间距、圆角、阴影等常用设计令牌
- 添加了自定义滚动条样式

### 3. 主题切换逻辑

主题切换由 `useAppStore` 统一管理，实现了：

- 自动同步 HTML 元素的 `class="dark"` 和 `data-theme="dark"` 属性
- 主题状态持久化到 localStorage
- 应用启动时自动恢复上次的主题设置

## 使用方式

### 在 Vue 组件中使用

#### 1. 获取主题状态

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { theme, isDark, toggleTheme, setTheme } = useTheme()
</script>

<template>
  <!-- 显示当前主题 -->
  <div>当前主题: {{ theme }}</div>

  <!-- 主题切换按钮 -->
  <el-button @click="toggleTheme">
    切换为{{ isDark ? '亮色' : '暗色' }}模式
  </el-button>
</template>
```

#### 2. 使用 Tailwind 暗黑模式类

Tailwind CSS 提供了 `dark:` 变体来定义暗黑模式下的样式：

```vue
<template>
  <!-- 文本颜色 -->
  <p class="text-gray-900 dark:text-gray-100">
    这段文字在亮色模式下是深色，暗色模式下是浅色
  </p>

  <!-- 背景色 -->
  <div class="bg-white dark:bg-gray-800">
    背景色会随主题变化
  </div>

  <!-- 边框 -->
  <div class="border border-gray-200 dark:border-gray-700">
    边框颜色也会适配
  </div>

  <!-- 组合使用 -->
  <button class="bg-primary text-white hover:bg-primary-600 dark:bg-primary-400 dark:hover:bg-primary-500">
    主题色按钮
  </button>
</template>
```

#### 3. 使用自定义组件类

项目内置了一些常用的组件类，已自动支持暗黑模式：

```vue
<template>
  <!-- 卡片 -->
  <div class="card">
    卡片内容
  </div>

  <!-- 带悬停效果的卡片 -->
  <div class="card-hover">
    悬停时阴影加深
  </div>

  <!-- 页面标题 -->
  <h1 class="page-title">页面标题</h1>

  <!-- 统计卡片 -->
  <div class="stat-card">
    <div class="text-2xl font-bold">1,234</div>
    <div class="text-sm text-gray-500">总用户数</div>
  </div>

  <!-- 表格容器 -->
  <div class="table-container">
    <el-table :data="tableData">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>
```

### 使用 CSS 变量

如果需要在样式中使用主题颜色，可以使用预定义的 CSS 变量：

```vue
<style scoped>
.custom-element {
  /* 使用自定义主题变量 */
  color: var(--color-text-primary);
  background-color: var(--color-background);
  border-color: var(--color-border);

  /* 使用 Element Plus 变量 */
  padding: var(--el-padding);
  border-radius: var(--el-border-radius-base);
}

.highlight {
  color: var(--color-primary);
}
</style>
```

## 最佳实践

### 1. 优先使用 Tailwind 实用类

对于简单的样式，优先使用 Tailwind 的实用类：

```vue
<!-- ✅ 推荐 -->
<div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
  内容
</div>

<!-- ❌ 不推荐 -->
<div class="custom-box">
  内容
</div>
<style>
.custom-box {
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
}
.dark .custom-box {
  background: #1f2937;
}
</style>
```

### 2. 组件样式使用 @layer

如果需要创建可复用的组件样式，使用 `@layer components`：

```css
@layer components {
  .custom-button {
    @apply px-4 py-2 bg-primary text-white rounded hover:bg-primary-600;
    @apply dark:bg-primary-400 dark:hover:bg-primary-500;
  }
}
```

### 3. 避免硬编码颜色

尽量使用主题色系统，避免硬编码颜色值：

```vue
<!-- ✅ 推荐 -->
<div class="text-gray-900 dark:text-gray-100">文本</div>
<div class="bg-primary">主色背景</div>

<!-- ❌ 不推荐 -->
<div style="color: #000">文本</div>
<div style="background: #146eff">背景</div>
```

### 4. Element Plus 组件

Element Plus 组件会自动适配暗黑模式，无需额外配置：

```vue
<template>
  <!-- 这些组件会自动适配暗黑模式 -->
  <el-button type="primary">按钮</el-button>
  <el-input v-model="input" />
  <el-dialog v-model="visible">对话框</el-dialog>
  <el-table :data="tableData">表格</el-table>
</template>
```

## 常用颜色对照表

### 文本颜色

| 亮色模式 | 暗色模式 | Tailwind 类                        | CSS 变量                      |
| -------- | -------- | ---------------------------------- | ----------------------------- |
| #303133  | #e5e7eb  | `text-gray-900 dark:text-gray-100` | `var(--color-text-primary)`   |
| #606266  | #d1d5db  | `text-gray-700 dark:text-gray-300` | `var(--color-text-regular)`   |
| #909399  | #9ca3af  | `text-gray-500 dark:text-gray-400` | `var(--color-text-secondary)` |

### 背景颜色

| 亮色模式 | 暗色模式 | Tailwind 类                   | CSS 变量                  |
| -------- | -------- | ----------------------------- | ------------------------- |
| #ffffff  | #1f2937  | `bg-white dark:bg-gray-800`   | `var(--el-bg-color)`      |
| #f5f7fa  | #111827  | `bg-gray-50 dark:bg-gray-900` | `var(--color-background)` |

### 边框颜色

| 亮色模式 | 暗色模式 | Tailwind 类                            | CSS 变量                    |
| -------- | -------- | -------------------------------------- | --------------------------- |
| #dcdfe6  | #4b5563  | `border-gray-200 dark:border-gray-600` | `var(--color-border)`       |
| #e4e7ed  | #374151  | `border-gray-200 dark:border-gray-700` | `var(--color-border-light)` |

## 测试清单

在开发完成后，请检查以下项目：

- [ ] 所有页面在亮色/暗色模式下都正常显示
- [ ] 文本在两种模式下都清晰可读（对比度足够）
- [ ] Element Plus 组件（按钮、表单、表格等）样式正确
- [ ] 自定义组件在两种模式下都正常工作
- [ ] 主题切换流畅，无闪烁
- [ ] 刷新页面后主题保持不变
- [ ] 阴影、边框等细节在暗色模式下也清晰可见

## 故障排查

### 1. 主题切换无效

检查 `src/main.ts` 中是否调用了 `appStore.initTheme()`：

```typescript
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()
appStore.initTheme()
```

### 2. Element Plus 组件不适配暗黑模式

确认已导入暗黑模式 CSS：

```typescript
import 'element-plus/theme-chalk/dark/css-vars.css'
```

### 3. Tailwind 暗黑模式类不生效

检查 `tailwind.config.ts` 中的 darkMode 配置：

```typescript
darkMode: ['class', '[data-theme="dark"]']
```

### 4. 自定义样式不适配

使用 `dark:` 前缀或 CSS 变量：

```vue
<!-- 使用 Tailwind -->
<div class="text-gray-900 dark:text-gray-100">文本</div>

<!-- 使用 CSS 变量 -->
<style scoped>
.custom {
  color: var(--color-text-primary);
}
</style>
```

## 相关资源

- [Element Plus 暗黑模式文档](https://element-plus.org/zh-CN/guide/dark-mode.html)
- [Tailwind CSS 暗黑模式文档](https://tailwindcss.com/docs/dark-mode)
- [Tailwind CSS 工具类文档](https://tailwindcss.com/docs/styling-with-utility-classes)
