<template>
  <div class="performance-report-table">
    <el-table
      v-loading="loading"
      :data="tableRows"
      stripe
      style="width: 100%"
      :header-cell-style="getHeaderCellStyle"
      border
    >
      <!-- 员工信息列 -->
      <el-table-column
        prop="employee_number"
        label="工号"
        min-width="100"
        align="center"
        fixed="left"
      />
      <el-table-column
        prop="employee_name"
        label="姓名"
        min-width="100"
        align="center"
        fixed="left"
      />
      <el-table-column
        prop="department_level1"
        label="一级部门"
        min-width="120"
        align="center"
        fixed="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="department_level2"
        label="二级部门"
        min-width="120"
        align="center"
        fixed="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="department_level3"
        label="三级部门"
        min-width="120"
        align="center"
        fixed="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="department_level4"
        label="四级部门"
        min-width="120"
        align="center"
        fixed="left"
        show-overflow-tooltip
      />
      <el-table-column
        prop="employment_date"
        label="入职日期"
        min-width="110"
        align="center"
        fixed="left"
      >
        <template #default="{ row }">
          {{ formatDate(row.employment_date) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="position"
        label="职务"
        min-width="100"
        align="center"
        fixed="left"
        show-overflow-tooltip
      />

      <!-- 年度和季度列（动态生成） -->
      <template v-for="year in yearRange" :key="year">
        <!-- 年度列 -->
        <el-table-column
          :label="`${year}年度`"
          align="center"
          :header-cell-style="{ background: '#E3F2FD' }"
        >
          <!-- 季度列 -->
          <el-table-column
            v-for="quarter in ['Q4', 'Q3', 'Q2', 'Q1']"
            :key="quarter"
            :label="`${year}${quarter}`"
            :prop="`${year}-${quarter}`"
            min-width="80"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.performance_data[`${year}-${quarter}`]"
                :type="getRatingTagType(row.performance_data[`${year}-${quarter}`])"
                size="small"
              >
                {{ row.performance_data[`${year}-${quarter}`] }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table-column>
      </template>

      <!-- 绩效评级计数列 -->
      <el-table-column
        label="获得S次数"
        prop="rating_counts.S"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          {{ row.rating_counts.S || 0 }}
        </template>
      </el-table-column>
      <el-table-column
        label="获得A次数"
        prop="rating_counts.A"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          {{ row.rating_counts.A || 0 }}
        </template>
      </el-table-column>
      <el-table-column
        label="获得B次数"
        prop="rating_counts.B"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          {{ row.rating_counts.B || 0 }}
        </template>
      </el-table-column>
      <el-table-column
        label="获得C次数"
        prop="rating_counts.C"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          {{ row.rating_counts.C || 0 }}
        </template>
      </el-table-column>
      <el-table-column
        label="获得D次数"
        prop="rating_counts.D"
        min-width="100"
        align="center"
      >
        <template #default="{ row }">
          {{ row.rating_counts.D || 0 }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PerformanceRecord, PerformanceReportQueryParams } from '@/types/performance-report';
import { formatDate } from '@/utils/transform';
import {
  transformToTableRows,
  extractYearRange,
} from '@/utils/performance-table';

interface Props {
  /** 数据列表 */
  data: PerformanceRecord[];
  /** 加载状态 */
  loading?: boolean;
  /** 查询参数（用于提取年份范围） */
  queryParams?: PerformanceReportQueryParams;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  queryParams: () => ({}),
});

/**
 * 转换为表格行数据
 */
const tableRows = computed(() => {
  return transformToTableRows(props.data);
});

/**
 * 提取年份范围
 */
const yearRange = computed(() => {
  return extractYearRange(props.queryParams, props.data);
});

/**
 * 获取表头单元格样式
 */
function getHeaderCellStyle({ column }: { column: any }) {
  const baseStyle = {
    background: 'var(--el-fill-color-light)',
    color: 'var(--el-text-color-regular)',
    fontWeight: '600',
    fontSize: '14px',
  };

  // 年度列使用浅蓝色背景
  if (column.label && typeof column.label === 'string' && column.label.includes('年度')) {
    return {
      ...baseStyle,
      background: '#E3F2FD', // 浅蓝色
    };
  }

  return baseStyle;
}

/**
 * 获取绩效评级标签类型
 */
function getRatingTagType(rating: string): string {
  const typeMap: Record<string, string> = {
    S: 'success',
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

/* 年度列背景色（备用样式，如果 header-cell-style 不生效） */
.performance-report-table :deep(.el-table__header th) {
  /* 年度列的背景色通过 header-cell-style 动态设置 */
}
</style>
