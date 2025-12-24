<template>
  <div class="sentry-test-page p-6">
    <el-card class="mb-4">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="text-lg font-semibold">Sentry 错误监控测试页面</span>
          <el-tag type="info">开发调试</el-tag>
        </div>
      </template>

      <el-alert title="测试说明" type="info" :closable="false" class="mb-4">
        <p>点击下面的按钮测试不同类型的错误捕获。每次测试后，请检查：</p>
        <ol class="list-decimal list-inside mt-2">
          <li>浏览器控制台输出（开发环境）</li>
          <li>Sentry 控制台是否收到事件</li>
        </ol>
      </el-alert>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 组件错误测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">1. 组件错误测试</span>
          </template>
          <div class="space-y-2">
            <el-button type="danger" @click="triggerComponentError">
              触发组件错误
            </el-button>
            <p class="text-sm text-gray-500">模拟 Vue 组件中的未捕获错误</p>
          </div>
        </el-card>

        <!-- API 错误测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">2. API 错误测试</span>
          </template>
          <div class="space-y-2">
            <el-button type="warning" @click="triggerApiError">
              触发 API 错误
            </el-button>
            <p class="text-sm text-gray-500">模拟 HTTP 请求失败</p>
          </div>
        </el-card>

        <!-- 手动捕获测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">3. 手动捕获测试</span>
          </template>
          <div class="space-y-2">
            <el-button type="primary" @click="manualCapture">
              手动捕获错误
            </el-button>
            <p class="text-sm text-gray-500">使用 captureError() API</p>
          </div>
        </el-card>

        <!-- 消息记录测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">4. 消息记录测试</span>
          </template>
          <div class="space-y-2">
            <el-button type="info" @click="captureTestMessage">
              记录消息
            </el-button>
            <p class="text-sm text-gray-500">使用 captureMessage() API</p>
          </div>
        </el-card>

        <!-- 面包屑测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">5. 面包屑测试</span>
          </template>
          <div class="space-y-2">
            <el-button type="success" @click="addTestBreadcrumb">
              添加面包屑
            </el-button>
            <p class="text-sm text-gray-500">使用 addBreadcrumb() API</p>
          </div>
        </el-card>

        <!-- 性能追踪测试 -->
        <el-card shadow="hover">
          <template #header>
            <span class="font-semibold">6. 性能追踪测试</span>
          </template>
          <div class="space-y-2">
            <el-button @click="testPerformance"> 测试性能追踪 </el-button>
            <p class="text-sm text-gray-500">模拟耗时操作追踪</p>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 测试日志 -->
    <el-card>
      <template #header>
        <span class="font-semibold">测试日志</span>
      </template>
      <div class="space-y-2">
        <div
          v-for="(log, index) in testLogs"
          :key="index"
          class="p-2 bg-gray-50 rounded text-sm"
        >
          <span class="text-gray-500">{{ log.time }}</span> -
          <span :class="getLogColor(log.type)">{{ log.message }}</span>
        </div>
        <el-empty v-if="testLogs.length === 0" description="暂无测试日志" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import * as Sentry from '@sentry/vue';
import { captureError, captureMessage, addBreadcrumb } from '@/utils/sentry';
import request from '@/utils/request';

interface TestLog {
  time: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const testLogs = ref<TestLog[]>([]);

// 添加日志
const addLog = (type: TestLog['type'], message: string) => {
  const now = new Date();
  testLogs.value.unshift({
    time: now.toLocaleTimeString(),
    type,
    message,
  });

  // 最多保留 20 条日志
  if (testLogs.value.length > 20) {
    testLogs.value = testLogs.value.slice(0, 20);
  }
};

// 获取日志颜色类
const getLogColor = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    case 'info':
      return 'text-blue-600';
    default:
      return 'text-gray-600';
  }
};

// 1. 触发组件错误
const triggerComponentError = () => {
  addLog('info', '触发组件错误...');
  // 抛出未捕获的错误
  throw new Error('这是一个测试组件错误');
};

// 2. 触发 API 错误
const triggerApiError = async () => {
  addLog('info', '触发 API 错误...');
  try {
    // 请求一个不存在的端点
    await request.get('/api/test/nonexistent');
  } catch (error) {
    addLog('error', 'API 错误已触发并上报');
    ElMessage.error('API 错误已触发');
  }
};

// 3. 手动捕获错误
const manualCapture = () => {
  addLog('info', '手动捕获错误...');
  try {
    throw new Error('这是一个手动捕获的测试错误');
  } catch (error) {
    captureError(error as Error, {
      testType: 'manual-capture',
      timestamp: Date.now(),
      userAction: 'clicked-test-button',
    });
    addLog('success', '错误已手动捕获并上报到 Sentry');
    ElMessage.success('错误已手动捕获');
  }
};

// 4. 记录消息
const captureTestMessage = () => {
  addLog('info', '记录测试消息...');
  captureMessage('这是一个测试消息', 'info');
  addLog('success', '消息已记录到 Sentry');
  ElMessage.success('消息已记录');
};

// 5. 添加面包屑
const addTestBreadcrumb = () => {
  addLog('info', '添加面包屑...');
  addBreadcrumb({
    message: '用户点击了测试按钮',
    category: 'test-action',
    level: 'info',
    data: {
      testId: 'breadcrumb-test',
      timestamp: Date.now(),
    },
  });
  addLog('success', '面包屑已添加（下次错误时会包含此面包屑）');
  ElMessage.success('面包屑已添加');
};

// 6. 性能追踪测试
const testPerformance = async () => {
  addLog('info', '开始性能追踪...');

  const transaction = Sentry.startTransaction({
    name: '测试操作',
    op: 'test',
  });

  try {
    // 模拟耗时操作
    await new Promise((resolve) => setTimeout(resolve, 1000));

    transaction.setStatus('ok');
    addLog('success', '性能追踪完成（耗时 1s）');
    ElMessage.success('性能追踪完成');
  } catch (error) {
    transaction.setStatus('internal_error');
    addLog('error', '性能追踪失败');
  } finally {
    transaction.finish();
  }
};
</script>

<style scoped>
.sentry-test-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
