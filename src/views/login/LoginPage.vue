<script setup lang="ts">
/**
 * 登录页面
 */
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { usernameRules, passwordRules } from '@/utils/validation'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const formData = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: usernameRules,
  password: passwordRules,
}

const loading = ref(false)

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      await authStore.login(formData)
      ElMessage.success('登录成功')

      // 跳转到原来的页面或首页
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
    } catch (error) {
      console.error('登录失败:', error)
      ElMessage.error('登录失败，请检查用户名和密码')
    } finally {
      loading.value = false
    }
  })
}
</script>

<template>
  <div
    class="login-page min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800"
  >
    <el-card class="login-card w-full max-w-md" shadow="always">
      <!-- 标题 -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-primary mb-2">数据分析平台</h1>
        <p class="text-gray-500 dark:text-gray-400">欢迎登录</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="formRef" :model="formData" :rules="rules" size="large">
        <el-form-item prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleSubmit"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="w-full"
            :loading="loading"
            @click="handleSubmit"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 提示信息 -->
      <div class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
        <p>测试账号: admin / admin123</p>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-card {
  padding: 40px 30px;
}
</style>
