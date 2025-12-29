<template>
  <div class="performance-report-query-page">
    <!-- 页面头部 -->
    <PageHeader title="绩效数据报表">
      <template #extra>
        <el-button
          type="primary"
          :loading="reportStore.exporting"
          :disabled="!reportStore.canExport"
          @click="showExportDialog = true"
        >
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </template>
    </PageHeader>

    <!-- 查询条件区域 -->
    <div class="card filter-section">
      <el-form :model="queryForm" label-width="120px">
        <!-- 时间范围选择器 -->
        <TimeRangeSelector
          v-model:mode="timeRangeMode"
          v-model:start-year="queryForm.startYear"
          v-model:end-year="queryForm.endYear"
          v-model:start-quarter="queryForm.startQuarter"
          v-model:end-quarter="queryForm.endQuarter"
          v-model:query-length="queryForm.queryLength"
          @change="handleQueryParamsChange"
        />

        <!-- 部门选择器 -->
        <DepartmentSelector
          v-model:department-id="queryForm.departmentId"
          v-model:include-sub-departments="queryForm.includeSubDepartments"
          @change="handleQueryParamsChange"
        />

        <!-- 人员选择器 -->
        <EmployeeSelector
          v-model:employee-ids="queryForm.employeeIds"
          @change="handleQueryParamsChange"
        />

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 查询结果表格 -->
    <div class="card">
      <PerformanceReportTable
        :business-query-data="reportStore.businessQueryRecords"
        :loading="reportStore.loading"
        :query-params="reportStore.businessQueryParams"
      />

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="reportStore.currentPage"
          v-model:page-size="reportStore.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="reportStore.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 导出对话框 -->
    <ExportDialog
      v-model:visible="showExportDialog"
      :current-page-count="reportStore.businessQueryRecords.length"
      :total-count="reportStore.total"
      :exporting="reportStore.exporting"
      @export="handleExport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, RefreshLeft, Download } from '@element-plus/icons-vue';
import { usePerformanceReportStore } from '@/stores/performance-report';
import type { QuarterTime } from '@/types/performance-report';
import { quarterToString } from '@/utils/quarter-calculator';
import PageHeader from '@/components/common/PageHeader.vue';
import PerformanceReportTable from '@/components/performance/PerformanceReportTable.vue';
import TimeRangeSelector from '@/components/performance/TimeRangeSelector.vue';
import DepartmentSelector from '@/components/performance/DepartmentSelector.vue';
import EmployeeSelector from '@/components/performance/EmployeeSelector.vue';
import ExportDialog from '@/components/performance/ExportDialog.vue';

const reportStore = usePerformanceReportStore();

/** 时间范围模式 */
const timeRangeMode = ref<'year' | 'quarter'>('year');

/** 查询表单 */
const queryForm = ref<{
  startYear?: number;
  endYear?: number;
  startQuarter?: QuarterTime;
  endQuarter?: QuarterTime;
  queryLength?: number;
  departmentId?: string;
  includeSubDepartments?: boolean;
  employeeIds?: string[];
}>({
  startYear: undefined,
  endYear: undefined,
  startQuarter: undefined,
  endQuarter: undefined,
  queryLength: 1,
  departmentId: undefined,
  includeSubDepartments: false,
  employeeIds: [],
});

/** 导出对话框显示状态 */
const showExportDialog = ref(false);

/** 处理查询参数变化 */
function handleQueryParamsChange() {
  // 当查询参数变化时，可以在这里做一些处理
  // 比如验证参数等
}

/**
 * 查询
 */
const handleSearch = async () => {
  try {
    // 构建查询参数
    const params: any = {};

    if (timeRangeMode.value === 'year') {
      if (queryForm.value.startYear) {
        params.start_year = queryForm.value.startYear;
      }
      if (queryForm.value.endYear) {
        params.end_year = queryForm.value.endYear;
      }
    } else {
      // 季度模式：API 需要 start_quarter 和 end_quarter，格式为 'Q1', 'Q2' 等
      if (queryForm.value.startQuarter) {
        params.start_quarter = `Q${queryForm.value.startQuarter.quarter}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
        // 注意：季度查询还需要年份范围，API 可能需要 start_year 和 end_year
        // 从 startQuarter 和 endQuarter 提取年份
        if (queryForm.value.startQuarter) {
          params.start_year = queryForm.value.startQuarter.year;
        }
        if (queryForm.value.endQuarter) {
          params.end_year = queryForm.value.endQuarter.year;
        }
      }
      if (queryForm.value.endQuarter) {
        params.end_quarter = `Q${queryForm.value.endQuarter.quarter}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
      }
    }

    if (queryForm.value.departmentId) {
      params.organization_id = queryForm.value.departmentId;
      params.include_children = queryForm.value.includeSubDepartments;
    }

    if (queryForm.value.employeeIds && queryForm.value.employeeIds.length > 0) {
      params.employee_user_ids = queryForm.value.employeeIds.join(',');
    }

    await reportStore.updateQueryParams(params);
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('查询失败，请稍后重试');
  }
};


/**
 * 重置
 */
const handleReset = async () => {
  // 重置表单
  queryForm.value = {
    startYear: undefined,
    endYear: undefined,
    startQuarter: undefined,
    endQuarter: undefined,
    queryLength: 1,
    departmentId: undefined,
    includeSubDepartments: false,
    employeeIds: [],
  };
  timeRangeMode.value = 'year';

  // 重置 Store
  reportStore.resetQueryParams();
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
  }
};

/**
 * 处理导出
 */
const handleExport = async (
  type: 'batch' | 'all',
  format: 'xlsx' | 'csv',
) => {
  try {
    if (type === 'batch') {
      await reportStore.exportBatch(format);
      ElMessage.success('导出成功');
    } else {
      await reportStore.exportAll(format);
      ElMessage.success('导出任务已提交，请等待处理完成');
      // TODO: 实现导出任务状态轮询
    }
    showExportDialog.value = false;
  } catch (error) {
    ElMessage.error('导出失败，请稍后重试');
  }
};

/**
 * 分页切换
 */
const handlePageChange = async (page: number) => {
  reportStore.updatePagination(page, reportStore.pageSize);
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 每页条数切换
 */
const handleSizeChange = async (size: number) => {
  reportStore.updatePagination(1, size);
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

// 初始化
onMounted(async () => {
  // 页面加载时自动查询数据
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    // 静默失败，不显示错误提示（用户可以通过点击查询按钮重试）
  }
});
</script>

<style scoped>
.performance-report-query-page {
  padding: 24px;
}

.filter-section {
  margin-bottom: 24px;
}

.pagination-container {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}
</style>
