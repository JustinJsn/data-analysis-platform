<script setup lang="ts">
/**
 * 空白布局 - 用于登录页等无需侧边栏的页面
 */
</script>

<template>
  <div class="blank-layout min-h-screen bg-gray-50 dark:bg-gray-900">
    <router-view />
  </div>
</template>

<style scoped>
.blank-layout {
  width: 100%;
  height: 100vh;
}
</style>
