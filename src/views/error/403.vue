<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900"
  >
    <div class="text-center">
      <h1 class="text-9xl font-bold text-primary">403</h1>
      <p class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mt-4">
        无权访问
      </p>
      <p class="text-gray-500 dark:text-gray-400 mt-2">
        抱歉，您没有权限访问此页面
      </p>
      <div class="mt-6 space-x-4">
        <el-button @click="goBack">返回上页</el-button>
        <el-button type="primary" @click="goHome">返回首页</el-button>
      </div>
    </div>
  </div>
</template>
