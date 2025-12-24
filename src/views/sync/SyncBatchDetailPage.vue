<template>
  <div class="sync-batch-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
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
        <el-table-column prop="recordId" label="记录ID" width="280" />
        <el-table-column prop="operation" label="操作" width="100">
          <template #default="{ row }">
            <el-tag
              v-if="row.operation === 'create'"
              type="success"
              size="small"
            >
              新增
            </el-tag>
            <el-tag
              v-else-if="row.operation === 'update'"
              type="primary"
              size="small"
            >
              更新
            </el-tag>
            <el-tag
              v-else-if="row.operation === 'skip'"
              type="info"
              size="small"
            >
              跳过
            </el-tag>
            <el-tag v-else size="small">{{ row.operation }}</el-tag>
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
        <el-table-column
          prop="message"
          label="消息"
          min-width="300"
          show-overflow-tooltip
        />
        <el-table-column prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.timestamp) }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
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
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useSyncStore } from '@/stores/sync';
import type { SyncType } from '@/types/api';

const router = useRouter();
const route = useRoute();
const syncStore = useSyncStore();

/**
 * 获取同步类型标签
 */
const getSyncTypeLabel = (type: SyncType): string => {
  const labels: Record<SyncType, string> = {
    employee: '员工',
    organization: '组织',
    jobpost: '职务'
  };
  return labels[type] || type;
};

/**
 * 获取同步类型标签颜色
 */
const getSyncTypeTagType = (type: SyncType) => {
  const types: Record<SyncType, any> = {
    employee: 'primary',
    organization: 'warning',
    jobpost: 'success'
  };
  return types[type] || '';
};

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
 * 日志分页切换
 */
const handleLogsPageChange = async (page: number) => {
  const batchId = route.params.id as string;
  syncStore.setLogsPage(page);
  try {
    await syncStore.fetchBatchLogs(batchId);
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
    await syncStore.fetchBatchLogs(batchId);
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
 * 初始化：加载批次详情和日志
 */
onMounted(async () => {
  const batchId = route.params.id as string;
  if (!batchId) {
    ElMessage.error('批次ID不存在');
    router.push('/sync/batches');
    return;
  }

  try {
    await Promise.all([
      syncStore.fetchBatchDetail(batchId),
      syncStore.fetchBatchLogs(batchId)
    ]);
  } catch (error) {
    ElMessage.error('加载批次详情失败');
  }
});
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
</style>
