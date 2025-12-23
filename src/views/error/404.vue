<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
  >
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary">404</h1>
      <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
        页面不存在
      </p>
      <p class="text-gray-500 dark:text-gray-400 mt-2">
        抱歉，您访问的页面不存在或已被删除
      </p>
      <div class="mt-6">
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>
