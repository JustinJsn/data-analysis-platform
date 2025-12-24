<template>
  <div class="dashboard-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">监控中心</h2>
      <div class="page-subtitle">数据同步状态监控和管理</div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-grid">
      <DataCard
        title="员工总数"
        :value="stats.employeeCount"
        :icon="User"
        icon-bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      />
      <DataCard
        title="组织总数"
        :value="stats.organizationCount"
        :icon="OfficeBuilding"
        icon-bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
      />
      <DataCard
        title="职务总数"
        :value="stats.positionCount"
        :icon="Suitcase"
        icon-bg="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
      />
      <DataCard
        title="今日同步次数"
        :value="stats.todaySyncCount"
        :icon="Refresh"
        icon-bg="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
      />
    </div>

    <!-- 同步操作区域 -->
    <div class="card">
      <div class="card-title">快速同步</div>
      <div class="sync-actions">
        <el-button
          type="primary"
          :loading="syncingType === 'employee'"
          :disabled="isSyncing"
          @click="handleTriggerSync('employee')"
        >
          <el-icon><User /></el-icon>
          同步员工数据
        </el-button>
        <el-button
          type="primary"
          :loading="syncingType === 'organization'"
          :disabled="isSyncing"
          @click="handleTriggerSync('organization')"
        >
          <el-icon><OfficeBuilding /></el-icon>
          同步组织数据
        </el-button>
        <el-button
          type="primary"
          :loading="syncingType === 'jobpost'"
          :disabled="isSyncing"
          @click="handleTriggerSync('jobpost')"
        >
          <el-icon><Suitcase /></el-icon>
          同步职务数据
        </el-button>
        <el-button
          type="success"
          :loading="syncingType === 'full'"
          :disabled="isSyncing"
          @click="handleTriggerFullSync"
        >
          <el-icon><Refresh /></el-icon>
          完整同步
        </el-button>
      </div>
    </div>

    <!-- 最近批次列表 -->
    <div class="card batch-list-card">
      <div class="card-header-row">
        <div class="card-title">最近同步批次</div>
        <el-button link type="primary" @click="handleViewAllBatches">
          查看全部
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>

      <div class="batch-table-wrapper">
        <SyncBatchTable
          :loading="syncStore.batchesLoading"
          :data="recentBatches"
          compact
          @view-detail="handleViewBatchDetail"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  User,
  OfficeBuilding,
  Suitcase,
  Refresh,
  ArrowRight
} from '@element-plus/icons-vue';
import DataCard from '@/components/business/DataCard.vue';
import { useSyncStore } from '@/stores/sync';
import type { SyncType } from '@/types/api';
import SyncBatchTable from '@/components/sync/SyncBatchTable.vue';
import { getSyncTypeLabel } from '@/utils/transform';

const router = useRouter();
const syncStore = useSyncStore();

// 统计数据
const stats = ref({
  employeeCount: 0,
  organizationCount: 0,
  positionCount: 0,
  todaySyncCount: 0
});

// 当前正在同步的类型
const syncingType = ref<SyncType | 'full' | null>(null);

// 是否正在同步
const isSyncing = computed(() => syncingType.value !== null);

// 最近的批次（取前5条）
const recentBatches = computed(() => {
  return syncStore.batches.slice(0, 5);
});

// (Helper functions removed as they are now handled by SyncBatchTable and transform.ts)

/**
 * 触发同步任务
 */
const handleTriggerSync = async (type: SyncType) => {
  try {
    syncingType.value = type;
    await syncStore.triggerSync(type);
    ElMessage.success(`${getSyncTypeLabel(type)}同步已触发`);
    // 刷新批次列表
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('触发同步失败，请稍后重试');
  } finally {
    syncingType.value = null;
  }
};

/**
 * 触发完整同步
 */
const handleTriggerFullSync = async () => {
  try {
    syncingType.value = 'full';
    await syncStore.triggerFullSync();
    ElMessage.success('完整同步已触发');
    // 刷新批次列表
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('触发完整同步失败，请稍后重试');
  } finally {
    syncingType.value = null;
  }
};

/**
 * 查看批次详情
 */
const handleViewBatchDetail = (id: string) => {
  router.push(`/sync/batches/${id}`);
};

/**
 * 查看全部批次
 */
const handleViewAllBatches = () => {
  router.push('/sync/batches');
};

/**
 * 加载统计数据
 * 注意：这里使用模拟数据，实际应该从 API 获取
 */
const loadStats = async () => {
  // TODO: 从 API 获取统计数据
  // 这里使用模拟数据
  stats.value = {
    employeeCount: 0,
    organizationCount: 0,
    positionCount: 0,
    todaySyncCount: 0
  };
};

/**
 * 初始化
 */
onMounted(async () => {
  try {
    await Promise.all([
      syncStore.fetchBatches(),
      loadStats()
    ]);
  } catch (error) {
    ElMessage.error('加载监控数据失败');
  }
});
</script>

<style scoped>
.dashboard-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.card {
  background: var(--el-bg-color);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.batch-list-card {
  padding: 28px;
}

.batch-table-wrapper {
  margin-top: 4px;
}

.sync-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
