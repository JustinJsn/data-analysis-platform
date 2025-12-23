<script setup lang="ts">
/**
 * 员工列表页面
 */
import { onMounted } from 'vue'

onMounted(() => {
  console.log('Employee list mounted')
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">员工列表</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
