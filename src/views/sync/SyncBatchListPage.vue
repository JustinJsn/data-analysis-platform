<script setup lang="ts">
/**
 * 同步批次列表页面
 */
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Sync batch list mounted')
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">同步批次</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
