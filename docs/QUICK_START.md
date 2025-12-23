# 快速开始 - 暗黑模式使用

## 🚀 5分钟快速上手

### 1. 在组件中使用暗黑模式

#### 方式一：使用 Tailwind CSS 工具类（推荐）

```vue
<template>
  <!-- 文本颜色 -->
  <p class="text-gray-900 dark:text-gray-100">
    自动适配暗黑模式的文本
  </p>

  <!-- 背景色 -->
  <div class="bg-white dark:bg-gray-800 p-4 rounded-lg">
    自动适配暗黑模式的容器
  </div>

  <!-- 边框 -->
  <div class="border border-gray-200 dark:border-gray-700">
    自动适配的边框
  </div>
</template>
```

#### 方式二：使用预定义组件类

```vue
<template>
  <!-- 卡片 -->
  <div class="card">
    <h2 class="section-title">标题</h2>
    <p>卡片内容会自动适配暗黑模式</p>
  </div>

  <!-- 页面容器 -->
  <div class="page-container">
    <h1 class="page-title">页面标题</h1>
    <div class="content-area">
      内容区域
    </div>
  </div>
</template>
```

#### 方式三：使用 Element Plus 组件（自动适配）

```vue
<template>
  <!-- Element Plus 组件会自动适配暗黑模式，无需任何配置 -->
  <el-button type="primary">按钮</el-button>
  <el-input v-model="input" />
  <el-table :data="tableData" />
</template>
```

### 2. 添加主题切换按钮

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <el-button @click="toggleTheme">
    {{ isDark ? '☀️ 亮色模式' : '🌙 暗色模式' }}
  </el-button>
</template>
```

### 3. 查看效果

访问测试页面查看完整的暗黑模式效果：

```typescript
// 在 src/router/routes.ts 中添加路由（如果需要）
{
  path: '/theme-test',
  name: 'ThemeTest',
  component: () => import('@/views/ThemeTestPage.vue'),
  meta: { title: '主题测试' }
}
```

## 📚 常用类名速查

### 文本颜色

```html
<!-- 主要文本 -->
<p class="text-gray-900 dark:text-gray-100">

<!-- 常规文本 -->
<p class="text-gray-700 dark:text-gray-300">

<!-- 次要文本 -->
<p class="text-gray-500 dark:text-gray-400">
```

### 背景颜色

```html
<!-- 主背景 -->
<div class="bg-white dark:bg-gray-800">

<!-- 次背景 -->
<div class="bg-gray-50 dark:bg-gray-900">
```

### 边框

```html
<!-- 标准边框 -->
<div class="border border-gray-200 dark:border-gray-700">

<!-- 浅色边框 -->
<div class="border border-gray-100 dark:border-gray-800">
```

### 预定义组件类

```html
<!-- 卡片 -->
<div class="card">...</div>
<div class="card-hover">...</div>

<!-- 标题 -->
<h1 class="page-title">...</h1>
<h2 class="section-title">...</h2>

<!-- 容器 -->
<div class="page-container">...</div>
<div class="content-area">...</div>
<div class="table-container">...</div>

<!-- 其他 -->
<div class="stat-card">...</div>
<div class="filter-section">...</div>
```

## 🎨 主题色使用

```html
<!-- 主色 -->
<div class="bg-primary text-white">主色背景</div>

<!-- 成功色 -->
<div class="bg-success text-white">成功提示</div>

<!-- 警告色 -->
<div class="bg-warning text-white">警告提示</div>

<!-- 危险色 -->
<div class="bg-danger text-white">危险提示</div>

<!-- 信息色 -->
<div class="bg-info text-white">信息提示</div>
```

## 💡 最佳实践

### ✅ 推荐做法

1. **优先使用 Tailwind 工具类**

   ```vue
   <div class="bg-white dark:bg-gray-800 p-4">内容</div>
   ```

2. **使用预定义组件类提高复用性**

   ```vue
   <div class="card">卡片内容</div>
   ```

3. **Element Plus 组件直接使用**
   ```vue
   <el-button type="primary">按钮</el-button>
   ```

### ❌ 不推荐做法

1. **避免硬编码颜色**

   ```vue
   <!-- 不推荐 -->
   <div style="color: #000; background: #fff">内容</div>

   <!-- 推荐 -->
   <div class="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800">内容</div>
   ```

2. **避免重复定义样式**

   ```vue
   <!-- 不推荐 -->
   <style scoped>
   .my-card {
     background: white;
     padding: 1.5rem;
     border-radius: 0.5rem;
   }
   </style>

   <!-- 推荐 -->
   <div class="card">内容</div>
   ```

## 🔧 进阶使用

### 使用 CSS 变量

```vue
<style scoped>
.custom-element {
  color: var(--color-text-primary);
  background-color: var(--color-background);
  border-color: var(--color-border);
}

.highlight {
  color: var(--color-primary);
}
</style>
```

### 条件渲染主题相关内容

```vue
<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()
</script>

<template>
  <!-- 根据主题显示不同图标 -->
  <img v-if="isDark" src="/logo-dark.svg" alt="Logo" />
  <img v-else src="/logo-light.svg" alt="Logo" />

  <!-- 根据主题显示不同文本 -->
  <p>当前是{{ isDark ? '暗色' : '亮色' }}模式</p>
</template>
```

### 监听主题变化

```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

watch(theme, (newTheme) => {
  console.log('主题已切换为:', newTheme)
  // 执行其他操作...
})
</script>
```

## 📖 更多资源

- **详细文档：** [暗黑模式使用指南](./dark-mode-guide.md)
- **优化总结：** [基础架构优化总结](./optimization-summary.md)
- **测试页面：** `src/views/ThemeTestPage.vue`

## ❓ 常见问题

### Q: 主题切换后刷新页面会重置吗？

A: 不会。主题状态会保存到 localStorage，刷新后自动恢复。

### Q: 可以获取系统的主题设置吗？

A: 当前版本使用手动切换。如需系统主题检测，可以扩展 `useTheme` composable。

### Q: Element Plus 组件需要特殊配置吗？

A: 不需要。所有 Element Plus 组件会自动适配暗黑模式。

### Q: 自定义组件如何支持暗黑模式？

A: 使用 `dark:` 前缀定义暗黑模式样式：

```vue
<div class="text-gray-900 dark:text-gray-100">文本</div>
```

### Q: 如何在 JS/TS 中获取当前主题？

A: 使用 `useTheme` composable：

```typescript
import { useTheme } from '@/composables/useTheme'

const { theme, isDark } = useTheme()
console.log(theme.value) // 'light' 或 'dark'
console.log(isDark.value) // true 或 false
```

## 🎉 开始使用

现在你已经了解了暗黑模式的基本使用方法，可以开始在项目中使用了！

记住三个要点：

1. 使用 `dark:` 前缀定义暗黑模式样式
2. 优先使用预定义的组件类
3. Element Plus 组件会自动适配

祝开发愉快！🚀
