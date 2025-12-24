<template>
  <div class="sync-batch-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">同步批次管理</h2>
      <div class="page-subtitle">查看和管理数据同步批次</div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="同步类型">
          <el-select
            v-model="localFilters.type"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option label="员工" value="employee" />
            <el-option label="组织" value="organization" />
            <el-option label="职务" value="jobpost" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="localFilters.status"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option label="运行中" value="running" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>

        <el-form-item label="触发方式">
          <el-select
            v-model="localFilters.triggerMode"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option label="手动触发" value="manual" />
            <el-option label="定时触发" value="scheduled" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 380px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 批次表格 -->
    <div class="card">
      <el-table
        v-loading="syncStore.batchesLoading"
        :data="syncStore.batches"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="id" label="批次ID" width="280" />
        <el-table-column prop="type" label="同步类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getSyncTypeTagType(row.type)">
              {{ getSyncTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'success'" type="success">成功</el-tag>
            <el-tag v-else-if="row.status === 'failed'" type="danger"
              >失败</el-tag
            >
            <el-tag v-else type="warning">运行中</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="triggerMode" label="触发方式" width="120">
          <template #default="{ row }">
            <span v-if="row.triggerMode === 'manual'">手动触发</span>
            <span v-else>定时触发</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="总数" width="100" />
        <el-table-column prop="successCount" label="成功" width="100" />
        <el-table-column prop="failedCount" label="失败" width="100" />
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="耗时" width="100">
          <template #default="{ row }">
            {{ calculateDuration(row.startTime, row.endTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewDetail(row.id)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="syncStore.filters.pageNum"
          v-model:page-size="syncStore.filters.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="syncStore.batchesTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import { useSyncStore } from '@/stores/sync';
import type { SyncType, SyncBatchQueryParams } from '@/types/api';

const router = useRouter();
const syncStore = useSyncStore();

// 本地筛选条件
const localFilters = ref<Partial<SyncBatchQueryParams>>({});

// 日期范围
const dateRange = ref<[string, string] | null>(null);

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
 * 计算耗时
 */
const calculateDuration = (
  startTime: string | null,
  endTime: string | null
): string => {
  if (!startTime) return '-';
  if (!endTime) return '进行中';

  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.floor((end - start) / 1000); // 秒

    if (duration < 60) {
      return `${duration}秒`;
    } else if (duration < 3600) {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      return `${minutes}分${seconds}秒`;
    } else {
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      return `${hours}时${minutes}分`;
    }
  } catch {
    return '-';
  }
};

/**
 * 搜索
 */
const handleSearch = async () => {
  try {
    // 构建筛选参数
    const filters: Partial<SyncBatchQueryParams> = { ...localFilters.value };

    // 处理时间范围
    if (dateRange.value && dateRange.value.length === 2) {
      filters.startTimeFrom = dateRange.value[0];
      filters.startTimeTo = dateRange.value[1];
    }

    syncStore.setBatchesFilters(filters);
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
  }
};

/**
 * 重置筛选条件
 */
const handleReset = async () => {
  localFilters.value = {};
  dateRange.value = null;
  syncStore.resetBatchesFilters();
  try {
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
  }
};

/**
 * 分页切换
 */
const handlePageChange = async (page: number) => {
  syncStore.setBatchesPage(page);
  try {
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 每页条数切换
 */
const handleSizeChange = async (size: number) => {
  syncStore.filters.pageSize = size;
  syncStore.filters.pageNum = 1;
  try {
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 查看批次详情
 */
const handleViewDetail = (id: string) => {
  router.push(`/sync/batches/${id}`);
};

/**
 * 初始化：加载批次列表
 */
onMounted(async () => {
  try {
    await syncStore.fetchBatches();
  } catch (error) {
    ElMessage.error('加载批次列表失败');
  }
});
</script>

<style scoped>
.sync-batch-list-page {
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

.filter-section {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.card {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
