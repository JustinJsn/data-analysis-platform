<script setup lang="ts">
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'

const appStore = useAppStore()

onMounted(() => {
  // 初始化主题
  appStore.initTheme()
})
</script>

<template>
  <router-view />
</template>

<style>
/* 全局样式已在 main.ts 中导入 */
</style>
