<script setup lang="ts">
/**
 * 职务列表页面
 */
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Position list mounted')
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">职务列表</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
