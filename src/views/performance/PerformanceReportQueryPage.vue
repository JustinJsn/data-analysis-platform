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
        <!-- TODO: 添加时间范围选择器、部门选择器、人员选择器等 -->
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

    <!-- TODO: 导出对话框 -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, RefreshLeft, Download } from '@element-plus/icons-vue';
import { usePerformanceReportStore } from '@/stores/performance-report';
import PageHeader from '@/components/common/PageHeader.vue';
import PerformanceReportTable from '@/components/performance/PerformanceReportTable.vue';

const reportStore = usePerformanceReportStore();

/** 查询表单 */
const queryForm = ref({});

/** 导出对话框显示状态 */
const showExportDialog = ref(false);

/**
 * 查询
 */
const handleSearch = async () => {
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('查询失败，请稍后重试');
  }
};

/**
 * 重置
 */
const handleReset = async () => {
  reportStore.resetQueryParams();
  try {
    await reportStore.fetchRecords();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
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
