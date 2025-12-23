<script setup lang="ts">
/**
 * 暗黑模式测试页面
 * 用于测试和展示亮色/暗色模式下各组件的显示效果
 */
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { ElMessage } from 'element-plus'

const { isDark, toggleTheme } = useTheme()

// 表单数据
const formData = ref({
  name: '',
  email: '',
  date: '',
  region: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

// 表格数据
const tableData = ref([
  {
    id: 1,
    name: '张三',
    email: 'zhangsan@example.com',
    department: '技术部',
    status: '在职',
  },
  {
    id: 2,
    name: '李四',
    email: 'lisi@example.com',
    department: '产品部',
    status: '在职',
  },
  {
    id: 3,
    name: '王五',
    email: 'wangwu@example.com',
    department: '设计部',
    status: '离职',
  },
])

// 统计数据
const stats = [
  { label: '总用户数', value: '1,234', trend: '+12%', icon: '👥' },
  { label: '活跃用户', value: '856', trend: '+8%', icon: '🔥' },
  { label: '新增用户', value: '42', trend: '+23%', icon: '✨' },
  { label: '转化率', value: '68%', trend: '+5%', icon: '📈' },
]

const handleSubmit = () => {
  ElMessage.success('表单提交成功')
}

const handleReset = () => {
  ElMessage.info('表单已重置')
}
</script>

<template>
  <div class="page-container">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between mb-6">
      <h1 class="page-title mb-0">暗黑模式测试页面</h1>
      <el-button :type="isDark ? 'warning' : 'primary'" @click="toggleTheme">
        {{ isDark ? '☀️ 切换到亮色模式' : '🌙 切换到暗色模式' }}
      </el-button>
    </div>

    <!-- 说明卡片 -->
    <div class="card mb-6">
      <h2 class="section-title">测试说明</h2>
      <p class="text-gray-700 dark:text-gray-300 mb-2">
        本页面用于测试暗黑模式下各组件的显示效果。请点击右上角按钮切换主题，观察各组件的变化。
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        当前主题：<span
          class="font-bold text-primary"
          >{{ isDark ? '暗色模式' : '亮色模式' }}</span
        >
      </p>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="flex items-center justify-between mb-2">
          <span class="text-3xl">{{ stat.icon }}</span>
          <span
            class="text-xs font-semibold text-green-500 dark:text-green-400"
            >{{ stat.trend }}</span
          >
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {{ stat.value }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- 颜色测试 -->
    <div class="card mb-6">
      <h2 class="section-title">颜色系统测试</h2>

      <!-- 主题色 -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          主题色
        </h3>
        <div class="flex flex-wrap gap-2">
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded bg-primary"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >Primary</span
            >
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded bg-success"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >Success</span
            >
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded bg-warning"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >Warning</span
            >
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded bg-danger"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Danger</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="w-12 h-12 rounded bg-info"></div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Info</span>
          </div>
        </div>
      </div>

      <!-- 文本颜色 -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          文本颜色
        </h3>
        <div class="space-y-2">
          <p class="text-gray-900 dark:text-gray-100">
            主要文本 (gray-900 / gray-100)
          </p>
          <p class="text-gray-700 dark:text-gray-300">
            常规文本 (gray-700 / gray-300)
          </p>
          <p class="text-gray-500 dark:text-gray-400">
            次要文本 (gray-500 / gray-400)
          </p>
          <p class="text-gray-400 dark:text-gray-500">
            占位文本 (gray-400 / gray-500)
          </p>
        </div>
      </div>

      <!-- 背景色 -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          背景色
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
          <div
            class="bg-white dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >白色/灰800</span
            >
          </div>
          <div
            class="bg-gray-50 dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >灰50/灰900</span
            >
          </div>
          <div
            class="bg-gray-100 dark:bg-gray-800 p-4 rounded border border-gray-200 dark:border-gray-700"
          >
            <span class="text-sm text-gray-700 dark:text-gray-300"
              >灰100/灰800</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Element Plus 按钮测试 -->
    <div class="card mb-6">
      <h2 class="section-title">按钮组件</h2>
      <div class="space-y-4">
        <div class="button-group">
          <el-button>默认按钮</el-button>
          <el-button type="primary">主要按钮</el-button>
          <el-button type="success">成功按钮</el-button>
          <el-button type="warning">警告按钮</el-button>
          <el-button type="danger">危险按钮</el-button>
          <el-button type="info">信息按钮</el-button>
        </div>
        <div class="button-group">
          <el-button plain>朴素按钮</el-button>
          <el-button type="primary" plain>主要按钮</el-button>
          <el-button type="success" plain>成功按钮</el-button>
        </div>
        <div class="button-group">
          <el-button disabled>禁用按钮</el-button>
          <el-button type="primary" disabled>主要按钮</el-button>
          <el-button type="success" disabled>成功按钮</el-button>
        </div>
      </div>
    </div>

    <!-- 表单组件测试 -->
    <div class="card mb-6">
      <h2 class="section-title">表单组件</h2>
      <el-form :model="formData" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="formData.name" placeholder="请输入活动名称" />
        </el-form-item>

        <el-form-item label="邮箱地址">
          <el-input
            v-model="formData.email"
            type="email"
            placeholder="请输入邮箱地址"
          />
        </el-form-item>

        <el-form-item label="活动时间">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="活动区域">
          <el-select v-model="formData.region" placeholder="请选择活动区域">
            <el-option label="区域一" value="shanghai" />
            <el-option label="区域二" value="beijing" />
          </el-select>
        </el-form-item>

        <el-form-item label="即时配送">
          <el-switch v-model="formData.delivery" />
        </el-form-item>

        <el-form-item label="活动性质">
          <el-checkbox-group v-model="formData.type">
            <el-checkbox label="美食/餐厅线上活动" name="type" />
            <el-checkbox label="地推活动" name="type" />
            <el-checkbox label="线下主题活动" name="type" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="特殊资源">
          <el-radio-group v-model="formData.resource">
            <el-radio label="线上品牌商赞助" />
            <el-radio label="线下场地免费" />
          </el-radio-group>
        </el-form-item>

        <el-form-item label="活动形式">
          <el-input
            v-model="formData.desc"
            type="textarea"
            :rows="3"
            placeholder="请输入活动形式"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit">立即创建</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格组件测试 -->
    <div class="table-container mb-6">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          数据表格
        </h2>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="department" label="部门" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '在职' ? 'success' : 'info'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default>
            <el-button size="small" type="primary" link>编辑</el-button>
            <el-button size="small" type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 其他组件 -->
    <div class="card mb-6">
      <h2 class="section-title">其他组件</h2>

      <!-- 标签 -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          标签 (Tag)
        </h3>
        <div class="flex flex-wrap gap-2">
          <el-tag>默认标签</el-tag>
          <el-tag type="success">成功标签</el-tag>
          <el-tag type="warning">警告标签</el-tag>
          <el-tag type="danger">危险标签</el-tag>
          <el-tag type="info">信息标签</el-tag>
        </div>
      </div>

      <!-- 警告 -->
      <div class="mb-4">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          警告 (Alert)
        </h3>
        <div class="space-y-2">
          <el-alert title="成功提示" type="success" :closable="false" />
          <el-alert title="消息提示" type="info" :closable="false" />
          <el-alert title="警告提示" type="warning" :closable="false" />
          <el-alert title="错误提示" type="error" :closable="false" />
        </div>
      </div>

      <!-- 进度条 -->
      <div>
        <h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
          进度条 (Progress)
        </h3>
        <div class="space-y-2">
          <el-progress :percentage="50" />
          <el-progress :percentage="100" status="success" />
          <el-progress :percentage="100" status="warning" />
          <el-progress :percentage="50" status="exception" />
        </div>
      </div>
    </div>

    <!-- 卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div class="card-hover">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          卡片标题 1
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          这是一个带悬停效果的卡片，鼠标悬停时阴影会加深。
        </p>
        <el-button type="primary" size="small">查看详情</el-button>
      </div>

      <div class="card-hover">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          卡片标题 2
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          所有组件都会自动适配暗黑模式，无需额外配置。
        </p>
        <el-button type="success" size="small">了解更多</el-button>
      </div>

      <div class="card-hover">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          卡片标题 3
        </h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
          使用 Tailwind CSS 的 dark: 前缀可以轻松定义暗黑模式样式。
        </p>
        <el-button type="warning" size="small">开始使用</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义样式也支持暗黑模式 */
</style>
