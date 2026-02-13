<template>
  <div class="sync-batch-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon>
          <ArrowLeft />
        </el-icon>
        返回列表
      </el-button>
      <h2 class="page-title">批次详情</h2>
    </div>

    <!-- 批次信息 -->
    <div v-loading="syncStore.batchDetailLoading" class="card">
      <div class="card-title">批次信息</div>

      <template v-if="syncStore.currentBatch">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="批次ID" :span="2">
            {{ syncStore.currentBatch.batch_id }}
          </el-descriptions-item>

          <el-descriptions-item label="同步类型">
            <el-tag
              :type="getSyncTypeTagType(syncStore.currentBatch.sync_type)"
            >
              {{ getSyncTypeLabel(syncStore.currentBatch.sync_type) }}
            </el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="状态">
            <el-tag
              v-if="syncStore.currentBatch.status === 'success'"
              type="success"
            >
              成功
            </el-tag>
            <el-tag
              v-else-if="syncStore.currentBatch.status === 'partial_success'"
              type="warning"
            >
              部分成功
            </el-tag>
            <el-tag
              v-else-if="syncStore.currentBatch.status === 'failed'"
              type="danger"
            >
              失败
            </el-tag>
            <el-tag v-else type="info">运行中</el-tag>
          </el-descriptions-item>

          <el-descriptions-item label="触发方式">
            <span v-if="syncStore.currentBatch.trigger_mode === 'manual'"
              >手动触发</span
            >
            <span v-else>定时触发</span>
          </el-descriptions-item>

          <el-descriptions-item label="开始时间">
            {{ formatDateTime(syncStore.currentBatch.started_at) }}
          </el-descriptions-item>

          <el-descriptions-item label="结束时间">
            {{ formatDateTime(syncStore.currentBatch.completed_at) }}
          </el-descriptions-item>

          <el-descriptions-item label="持续时间">
            {{ formatDuration(syncStore.currentBatch.duration_ms) }}
          </el-descriptions-item>

          <el-descriptions-item label="总记录数">
            {{ syncStore.currentBatch.total_records }}
          </el-descriptions-item>

          <el-descriptions-item label="成功记录数">
            <span
              class="success-count"
              >{{ syncStore.currentBatch.success_records }}</span
            >
          </el-descriptions-item>

          <el-descriptions-item label="失败记录数">
            <span
              class="failed-count"
              >{{ syncStore.currentBatch.failed_records }}</span
            >
          </el-descriptions-item>

          <el-descriptions-item label="错误信息" :span="2">
            <span
              v-if="syncStore.currentBatch.error_message"
              class="error-message"
            >
              {{ syncStore.currentBatch.error_message }}
            </span>
            <span v-else>-</span>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <el-empty v-else description="批次信息不存在" />
    </div>

    <!-- 同步日志 -->
    <div class="card">
      <div class="card-title">同步日志</div>

      <el-table
        v-loading="syncStore.logsLoading"
        :data="syncStore.currentLogs"
        stripe
        style="width: 100%; margin-top: 16px"
        max-height="600"
      >
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="recordId" label="记录ID" width="200" />
        <el-table-column prop="recordType" label="记录类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getSyncTypeTagType(row.recordType)" size="small">
              {{ getSyncTypeLabel(row.recordType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'success'" type="success" size="small">
              成功
            </el-tag>
            <el-tag v-else type="danger" size="small">失败</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.level === 'success'" type="success" size="small">
              成功
            </el-tag>
            <el-tag
              v-else-if="row.level === 'failed' || row.level === 'error'"
              type="danger"
              size="small"
            >
              失败
            </el-tag>
            <el-tag
              v-else-if="row.level === 'warning'"
              type="warning"
              size="small"
            >
              警告
            </el-tag>
            <el-tag v-else type="info" size="small">
              {{ row.level || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="消息"
          min-width="200"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span
              v-if="row.status === 'failed' && row.errorMessage"
              class="text-danger"
            >
              {{ row.errorMessage }}
            </span>
            <span v-else>{{ row.message }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="details" label="详情" min-width="300">
          <template #default="{ row }">
            <el-popover
              v-if="row.details"
              placement="left"
              title="详细信息"
              :width="400"
              trigger="hover"
            >
              <template #reference>
                <div class="details-cell">
                  {{ formatDetails(row.details) }}
                </div>
              </template>
              <div class="json-viewer">
                <pre>{{ formatJson(row.details) }}</pre>
              </div>
            </el-popover>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div v-if="syncStore.logsTotal > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="syncStore.logsFilters.pageNum"
          v-model:page-size="syncStore.logsFilters.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="syncStore.logsTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handleLogsPageChange"
          @size-change="handleLogsSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useSyncStore } from '@/stores/sync';
import { getSyncTypeLabel, getSyncTypeTagType } from '@/utils/transform';

const router = useRouter();
const route = useRoute();
const syncStore = useSyncStore();



/**
 * 格式化日期时间
 */
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return dateStr;
  }
};

/**
 * 格式化持续时间
 */
const formatDuration = (ms: number | null | undefined): string => {
  if (ms === null || ms === undefined) return '-';

  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}小时`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes}分`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}秒`);
  if (parts.length === 0) return `${ms}ms`;

  return parts.join('');
};

/**
 * 格式化详情信息
 */
const formatDetails = (details: string | Record<string, any> | undefined): string => {
  if (!details) return '-';

  // 如果是字符串，尝试解析JSON并提取关键信息
  if (typeof details === 'string') {
    try {
      const parsed = JSON.parse(details);
      // 提取关键字段用于表格显示
      const keyFields: string[] = [];
      if (parsed.code) keyFields.push(`code: ${parsed.code}`);
      if (parsed.name) keyFields.push(`name: ${parsed.name}`);
      if (parsed.oId) keyFields.push(`oId: ${parsed.oId}`);

      // 绩效报告相关字段
      if (parsed.employee_name) keyFields.push(`姓名: ${parsed.employee_name}`);
      if (parsed.year) keyFields.push(`年份: ${parsed.year}`);
      if (parsed.performance_rating) keyFields.push(`等级: ${parsed.performance_rating}`);
      if (parsed.organization_full_name) keyFields.push(`部门: ${parsed.organization_full_name}`);

      // 如果有关键字段，显示关键字段；否则显示完整JSON（单行）
      return keyFields.length > 0
        ? keyFields.join(', ')
        : JSON.stringify(parsed);
    } catch {
      return details;
    }
  }

  // 如果是对象，提取关键信息
  const keyFields: string[] = [];
  if (details.code) keyFields.push(`code: ${details.code}`);
  if (details.name) keyFields.push(`name: ${details.name}`);
  if (details.oId) keyFields.push(`oId: ${details.oId}`);

  // 绩效报告相关字段
  if (details.employee_name) keyFields.push(`姓名: ${details.employee_name}`);
  if (details.year) keyFields.push(`年份: ${details.year}`);
  if (details.performance_rating) keyFields.push(`等级: ${details.performance_rating}`);
  if (details.organization_full_name) keyFields.push(`部门: ${details.organization_full_name}`);

  return keyFields.length > 0
    ? keyFields.join(', ')
    : JSON.stringify(details);
};

/**
 * 格式化JSON
 */
const formatJson = (details: string | Record<string, any> | undefined): string => {
  if (!details) return '';
  try {
    const obj = typeof details === 'string' ? JSON.parse(details) : details;
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(details);
  }
};

/**
 * 日志分页切换
 */
const handleLogsPageChange = async (page: number) => {
  const batchId = route.params.id as string;
  syncStore.setLogsPage(page);
  try {
    await syncStore.fetchBatchDetail(batchId, page, syncStore.logsFilters.pageSize);
  } catch (error) {
    ElMessage.error('加载日志失败，请稍后重试');
  }
};

/**
 * 日志每页条数切换
 */
const handleLogsSizeChange = async (size: number) => {
  const batchId = route.params.id as string;
  syncStore.logsFilters.pageSize = size;
  syncStore.logsFilters.pageNum = 1;
  try {
    await syncStore.fetchBatchDetail(batchId, 1, size);
  } catch (error) {
    ElMessage.error('加载日志失败，请稍后重试');
  }
};

/**
 * 返回列表
 */
const handleBack = () => {
  router.push('/sync/batches');
};

/**
 * 加载批次详情（重置分页）
 */
const loadBatchDetail = async (batchId: string) => {
  if (!batchId) {
    ElMessage.error('批次ID不存在');
    router.push('/sync/batches');
    return;
  }

  // 重置日志分页为第1页
  syncStore.logsFilters.pageNum = 1;

  try {
    // 批次详情接口已经包含日志数据，不需要单独调用日志接口
    await syncStore.fetchBatchDetail(batchId, 1, syncStore.logsFilters.pageSize);
  } catch (error) {
    ElMessage.error('加载批次详情失败');
  }
};

/**
 * 初始化：加载批次详情和日志
 */
onMounted(async () => {
  const batchId = route.params.id as string;
  await loadBatchDetail(batchId);
});

/**
 * 监听路由参数变化，当批次ID改变时重新加载并重置分页
 */
watch(
  () => route.params.id,
  async (newBatchId) => {
    if (newBatchId) {
      await loadBatchDetail(newBatchId as string);
    }
  }
);
</script>

<style scoped>
.sync-batch-detail-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
  min-height: 200px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.success-count {
  color: var(--el-color-success);
  font-weight: 500;
}

.failed-count {
  color: var(--el-color-danger);
  font-weight: 500;
}

.error-message {
  color: var(--el-color-danger);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-descriptions__title) {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.text-danger {
  color: var(--el-color-danger);
}

.details-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.json-viewer {
  max-height: 400px;
  overflow-y: auto;
}

.json-viewer pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 12px;
}
</style>
