<template>
  <div class="performance-report-list-page">
    <!-- 页面头部 -->
    <PageHeader title="绩效数据列表">
      <template #extra>
        <el-button
          type="primary"
          :loading="performanceStore.syncing"
          @click="showSyncDialog = true"
        >
          <el-icon><Refresh /></el-icon>
          同步数据
        </el-button>
      </template>
    </PageHeader>

    <!-- 筛选区域 -->
    <FilterPanel @search="handleSearch" @reset="handleReset">
      <el-form :model="filters" inline class="filter-form">
        <el-form-item label="年份">
          <el-input-number
            v-model="filters.year"
            :min="2000"
            :max="2100"
            placeholder="年份"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="季度">
          <el-select
            v-model="filters.quarter"
            placeholder="季度"
            clearable
            style="width: 120px"
          >
            <el-option label="Q1" value="Q1" />
            <el-option label="Q2" value="Q2" />
            <el-option label="Q3" value="Q3" />
            <el-option label="Q4" value="Q4" />
          </el-select>
        </el-form-item>

        <el-form-item label="员工姓名">
          <el-input
            v-model="filters.employee_name"
            placeholder="员工姓名"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="员工ID">
          <el-input
            v-model="filters.employee_user_id"
            placeholder="员工用户ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="组织路径ID">
          <el-input
            v-model="filters.organization_path_ids"
            placeholder="组织路径ID（用/分隔）"
            clearable
            style="width: 250px"
          />
        </el-form-item>

        <el-form-item label="绩效评级">
          <el-select
            v-model="filters.performance_rating"
            placeholder="绩效评级"
            clearable
            style="width: 120px"
          >
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
            <el-option label="D" value="D" />
          </el-select>
        </el-form-item>
      </el-form>
    </FilterPanel>

    <!-- 绩效数据表格 -->
    <div class="card">
      <el-table
        v-loading="performanceStore.loading"
        :data="performanceStore.reports"
        stripe
        style="width: 100%"
        :header-cell-style="{
          background: 'var(--el-fill-color-light)',
          color: 'var(--el-text-color-regular)',
          fontWeight: '600',
          fontSize: '14px',
        }"
        :row-style="{ height: '60px' }"
      >
        <el-table-column
          prop="employee_name"
          label="员工姓名"
          min-width="120"
          align="left"
        />
        <el-table-column
          prop="employee_user_id"
          label="员工ID"
          min-width="120"
          align="left"
        />
        <el-table-column
          prop="year"
          label="年份"
          min-width="80"
          align="center"
        />
        <el-table-column
          prop="quarter"
          label="季度"
          min-width="80"
          align="center"
        />
        <el-table-column
          prop="organization_full_name"
          label="组织"
          min-width="250"
          align="left"
          show-overflow-tooltip
        />
        <el-table-column
          prop="performance_rating"
          label="绩效评级"
          min-width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getRatingTagType(row.performance_rating) as 'success' | 'primary' | 'warning' | 'danger' | 'info'"
              size="small"
            >
              {{ row.performance_rating }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="last_synced_at"
          label="最后同步时间"
          min-width="180"
          align="center"
        >
          <template #default="{ row }">
            {{ formatDateTime(row.last_synced_at) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="batch_id"
          label="批次ID"
          min-width="280"
          align="left"
          show-overflow-tooltip
        />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="performanceStore.currentPage"
          v-model:page-size="performanceStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="performanceStore.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 同步触发对话框 -->
    <PerformanceSyncTrigger
      v-model="showSyncDialog"
      @success="handleSyncSuccess"
      @error="handleSyncError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Refresh } from '@element-plus/icons-vue';
import { usePerformanceStore } from '@/stores/performance';
import type { PerformanceReportFilters } from '@/types/performance';
import PageHeader from '@/components/common/PageHeader.vue';
import FilterPanel from '@/components/common/FilterPanel.vue';
import PerformanceSyncTrigger from '@/components/performance/PerformanceSyncTrigger.vue';
import { formatDateTime } from '@/utils/transform';
import { captureError } from '@/utils/sentry';

const performanceStore = usePerformanceStore();

/** 筛选条件（本地临时变量） */
const filters = ref<PerformanceReportFilters>({
  year: undefined,
  quarter: undefined,
  employee_name: undefined,
  employee_user_id: undefined,
  organization_path_ids: undefined,
  performance_rating: undefined,
});

/** 同步对话框显示状态 */
const showSyncDialog = ref(false);

/** 防抖定时器 */
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * 获取绩效评级标签类型
 */
function getRatingTagType(rating: string): string {
  const typeMap: Record<string, string> = {
    A: 'success',
    B: 'primary',
    C: 'warning',
    D: 'danger',
  };
  return typeMap[rating] || 'info';
}

/**
 * 搜索（带防抖）
 */
const handleSearch = async () => {
  // 清除之前的定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer);
  }

  // 设置防抖定时器（500ms）
  searchDebounceTimer = setTimeout(async () => {
    try {
      performanceStore.updateFilters(filters.value);
      await performanceStore.fetchReports();
    } catch (error) {
      ElMessage.error('搜索失败，请稍后重试');
      // 上报错误到 Sentry
      const err = error instanceof Error ? error : new Error(String(error));
      captureError(err, {
        type: 'Performance Search Error',
        filters: filters.value,
        fingerprint: ['performance-search-error'],
      });
    } finally {
      searchDebounceTimer = null;
    }
  }, 500);
};

/**
 * 重置筛选条件
 */
const handleReset = async () => {
  filters.value = {
    year: undefined,
    quarter: undefined,
    employee_name: undefined,
    employee_user_id: undefined,
    organization_path_ids: undefined,
    performance_rating: undefined,
  };
  performanceStore.resetFilters();
  try {
    await performanceStore.fetchReports();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
  }
};

/**
 * 分页切换
 */
const handlePageChange = async (page: number) => {
  performanceStore.updatePagination(page, performanceStore.pageSize);
  try {
    await performanceStore.fetchReports();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 每页条数切换
 */
const handleSizeChange = async (size: number) => {
  performanceStore.updatePagination(1, size);
  try {
    await performanceStore.fetchReports();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 同步成功回调
 */
const handleSyncSuccess = () => {
  // 刷新列表
  performanceStore.fetchReports();
};

/**
 * 同步失败回调
 */
const handleSyncError = (error: string) => {
  // 错误已通过 ElMessage 显示，这里记录到 Sentry
  captureError(new Error(error), {
    type: 'Performance Sync UI Error',
    fingerprint: ['performance-sync-ui-error'],
  });
};

/**
 * 初始化：加载绩效数据列表
 */
onMounted(async () => {
  try {
    await performanceStore.fetchReports();
  } catch (error) {
    ElMessage.error('加载绩效数据列表失败');
  }
});
</script>

<style scoped>
.performance-report-list-page {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.card {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.filter-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--el-text-color-regular);
}
</style>
