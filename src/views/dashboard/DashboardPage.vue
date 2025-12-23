<script setup lang="ts">
/**
 * 监控中心页面
 */
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Dashboard mounted')
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">监控中心</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
