<script setup lang="ts">
/**
 * 员工详情页面
 */
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

onMounted(() => {
  console.log('Employee detail:', route.params.id)
})
</script>

<template>
  <div class="page-container">
    <h1 class="page-title">员工详情</h1>
    <div class="content-area">
      <el-empty description="功能开发中..." />
    </div>
  </div>
</template>
