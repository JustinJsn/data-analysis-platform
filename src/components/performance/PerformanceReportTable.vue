<template>
  <div class="performance-report-table" v-loading="loading">
    <el-table-v2
      :columns="columns"
      :data="tableRows"
      :width="tableWidth"
      :height="tableHeight"
      fixed
      :row-height="56"
      :header-height="48"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, onMounted, onUnmounted } from 'vue';
import { ElTag } from 'element-plus';
import type {
  PerformanceRecord,
  BusinessQueryRecord,
  PerformanceReportQueryParams,
  PerformanceReportBusinessQueryParams,
} from '@/types/performance-report';
import { formatDate } from '@/utils/transform';
import {
  transformToTableRows,
  transformBusinessQueryToTableRows,
  extractQuarterRange,
} from '@/utils/performance-table';

// el-table-v2 的列类型
interface TableColumn {
  key: string;
  title: string;
  dataKey: string;
  width: number;
  fixed?: any; // el-table-v2 的 fixed 类型
  align?: 'left' | 'center' | 'right';
  headerClass?: string;
  headerRenderer?: (props: { column: any }) => any;
  cellRenderer?: (props: { rowData: any; cellData: any }) => any;
}

interface Props {
  /** 数据列表（旧格式） */
  data?: PerformanceRecord[];
  /** Business Query 数据列表（新格式） */
  businessQueryData?: BusinessQueryRecord[];
  /** 加载状态 */
  loading?: boolean;
  /** 查询参数（用于提取年份范围） */
  queryParams?: PerformanceReportQueryParams | PerformanceReportBusinessQueryParams;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  queryParams: () => ({}),
});

/**
 * 转换为表格行数据
 */
const tableRows = computed(() => {
  // 优先使用 Business Query 数据
  if (props.businessQueryData && props.businessQueryData.length > 0) {
    return transformBusinessQueryToTableRows(props.businessQueryData);
  }
  // 兼容旧格式
  if (props.data && props.data.length > 0) {
    return transformToTableRows(props.data);
  }
  return [];
});

/**
 * 提取年份范围
 * 优先从查询参数中提取，确保即使没有数据也显示所有年份
 */
/**
 * 提取季度范围
 * 确保即使没有数据也根据查询参数或默认逻辑显示所有季度
 */
const displayQuarters = computed(() => {
  return extractQuarterRange(props.queryParams as any);
});

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

/**
 * 表格宽度（响应式）
 */
const tableWidth = ref(1200);

/**
 * 表格高度（固定表头）
 */
const tableHeight = ref(600);

/**
 * 更新表格尺寸
 */
function updateTableSize() {
  const container = document.querySelector('.performance-report-table');
  if (container) {
    const rect = container.getBoundingClientRect();
    tableWidth.value = rect.width || 1200;
    // 高度设置为容器高度，如果容器没有高度则使用视口高度减去其他元素的高度
    if (rect.height > 0) {
      tableHeight.value = rect.height;
    } else {
      // 高度设置为视口高度减去其他元素的高度，留出空间
      tableHeight.value = Math.max(400, window.innerHeight - 300);
    }
  } else {
    // 如果找不到容器，使用默认值
    tableWidth.value = 1200;
    tableHeight.value = Math.max(400, window.innerHeight - 300);
  }
}

onMounted(() => {
  updateTableSize();
  window.addEventListener('resize', updateTableSize);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateTableSize);
});

/**
 * 生成列定义
 */
const columns = computed<TableColumn[]>(() => {
  const cols: TableColumn[] = [];

  // 固定列：员工信息
  cols.push(
    {
      key: 'employee_number',
      title: '工号',
      dataKey: 'employee_number',
      width: 100,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.employee_number || '',
    },
    {
      key: 'employee_name',
      title: '姓名',
      dataKey: 'employee_name',
      width: 100,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.employee_name || '',
    },
    {
      key: 'department_level1',
      title: '一级部门',
      dataKey: 'department_level1',
      width: 120,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.department_level1 || '',
    },
    {
      key: 'department_level2',
      title: '二级部门',
      dataKey: 'department_level2',
      width: 120,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.department_level2 || '',
    },
    {
      key: 'department_level3',
      title: '三级部门',
      dataKey: 'department_level3',
      width: 120,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.department_level3 || '',
    },
    {
      key: 'department_level4',
      title: '四级部门',
      dataKey: 'department_level4',
      width: 120,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.department_level4 || '',
    },
    {
      key: 'employment_date',
      title: '入职日期',
      dataKey: 'employment_date',
      width: 110,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => formatDate(rowData.employment_date),
    },
    {
      key: 'position',
      title: '职务',
      dataKey: 'position',
      width: 100,
      fixed: 'left',
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.position || '',
    }
  );

  // 动态生成年度和季度列
  displayQuarters.value.forEach(({ year, quarter }) => {
    const key = `${year}-${quarter}`;
    cols.push({
      key,
      title: `${year}${quarter}`,
      dataKey: key,
      width: 80,
      align: 'center',
      headerClass: 'year-header',
      headerRenderer: ({ column }) => {
        return h('div', {
          class: 'year-header-cell',
          style: {
            backgroundColor: '#E3F2FD',
            color: 'var(--el-text-color-regular)',
            fontWeight: '600',
            fontSize: '14px',
            padding: '14px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }
        }, column.title);
      },
      cellRenderer: ({ rowData }) => {
        const rating = rowData.performance_data?.[key];
        if (rating) {
          return h(ElTag, {
            type: getRatingTagType(rating) as 'success' | 'primary' | 'warning' | 'danger' | 'info',
            size: 'small',
          }, () => rating);
        }
        return h('span', '-');
      },
    });
  });

  // 绩效评级计数列
  cols.push(
    {
      key: 'rating_counts.S',
      title: '获得S次数',
      dataKey: 'rating_counts.S',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.rating_counts?.S || 0,
    },
    {
      key: 'rating_counts.A',
      title: '获得A次数',
      dataKey: 'rating_counts.A',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.rating_counts?.A || 0,
    },
    {
      key: 'rating_counts.B',
      title: '获得B次数',
      dataKey: 'rating_counts.B',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.rating_counts?.B || 0,
    },
    {
      key: 'rating_counts.C',
      title: '获得C次数',
      dataKey: 'rating_counts.C',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.rating_counts?.C || 0,
    },
    {
      key: 'rating_counts.D',
      title: '获得D次数',
      dataKey: 'rating_counts.D',
      width: 100,
      align: 'center',
      cellRenderer: ({ rowData }) => rowData.rating_counts?.D || 0,
    }
  );

  return cols;
});
</script>

<style scoped>
.performance-report-table {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

/* 虚拟表格样式 */
.performance-report-table :deep(.el-table-v2) {
  border-radius: 8px;
}

.performance-report-table :deep(.el-table-v2__header) {
  background-color: var(--el-fill-color-light);
}

.performance-report-table :deep(.el-table-v2__header-cell) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-weight: 600;
  font-size: 14px;
  padding: 14px 0;
}

/* 年度列表头背景色 */
.performance-report-table :deep(.el-table-v2__header-cell.year-header) {
  background-color: #E3F2FD;
}

.performance-report-table :deep(.el-table-v2__row) {
  border-bottom: 1px solid var(--el-border-color);
}

.performance-report-table :deep(.el-table-v2__row:hover) {
  background-color: var(--el-fill-color-lighter);
}

.performance-report-table :deep(.el-table-v2__cell) {
  padding: 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 固定列样式 */
.performance-report-table :deep(.el-table-v2__fixed-left) {
  background-color: var(--el-bg-color);
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}
</style>
