<template>
  <div class="performance-report-table">
    <el-table
      v-loading="loading"
      :data="data"
      stripe
      style="width: 100%"
      :header-cell-style="{
        background: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-regular)',
        fontWeight: '600',
        fontSize: '14px',
      }"
    >
      <el-table-column prop="year" label="年份" min-width="80" align="center" />
      <el-table-column
        prop="quarter"
        label="季度"
        min-width="80"
        align="center"
      />
      <el-table-column
        prop="employee_name"
        label="员工姓名"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="employee_number"
        label="员工工号"
        min-width="120"
        show-overflow-tooltip
      />
      <el-table-column
        prop="department_name"
        label="部门名称"
        min-width="150"
        show-overflow-tooltip
      />
      <el-table-column
        prop="department_path"
        label="部门路径"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column
        prop="performance_rating"
        label="绩效评级"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="getRatingTagType(row.performance_rating)" size="small">
            {{ row.performance_rating }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="last_synced_at"
        label="最后同步时间"
        min-width="180"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.last_synced_at) }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import type { PerformanceRecord } from '@/types/performance-report';
import { formatDateTime } from '@/utils/transform';

interface Props {
  /** 数据列表 */
  data: PerformanceRecord[];
  /** 加载状态 */
  loading?: boolean;
}

defineProps<Props>();

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
</script>

<style scoped>
.performance-report-table {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.performance-report-table :deep(.el-table) {
  border-radius: 8px;
  width: 100%;
}

.performance-report-table :deep(.el-table__header-wrapper) {
  border-radius: 8px 8px 0 0;
}

.performance-report-table :deep(.el-table th.el-table__cell) {
  padding: 14px 0;
}

.performance-report-table :deep(.el-table td.el-table__cell) {
  padding: 16px 0;
}

.performance-report-table :deep(.el-table__body tr:hover > td) {
  background-color: var(--el-fill-color-lighter) !important;
}
</style>
