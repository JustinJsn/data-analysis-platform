<script setup lang="ts">
/**
 * 组织架构页面
 */
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Organization tree mounted')
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">组织架构</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
