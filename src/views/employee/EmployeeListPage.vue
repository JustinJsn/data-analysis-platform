<template>
  <div class="employee-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">员工管理</h2>
      <div class="page-subtitle">查询和管理员工信息</div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="搜索员工">
          <el-input
            v-model="searchKeyword"
            placeholder="输入姓名进行搜索"
            clearable
            style="width: 300px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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

    <!-- 员工表格 -->
    <div class="card">
      <el-table
        v-loading="employeeStore.loading"
        :data="employeeStore.list"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="employeeNumber"
          label="员工编号"
          min-width="120"
        />
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column
          prop="organizationName"
          label="所属组织"
          min-width="180"
        />
        <el-table-column prop="positionName" label="职务" min-width="150" />
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'active'" type="success">在职</el-tag>
            <el-tag v-else-if="row.status === 'inactive'" type="info"
              >离职</el-tag
            >
            <el-tag v-else-if="row.status === 'suspended'" type="warning"
              >停用</el-tag
            >
            <el-tag v-else type="info">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="100" fixed="right">
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
          v-model:current-page="employeeStore.filters.pageNum"
          v-model:page-size="employeeStore.filters.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="employeeStore.total"
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
import { useEmployeeStore } from '@/stores/employee';

const router = useRouter();
const employeeStore = useEmployeeStore();

// 搜索关键词（本地临时变量）
const searchKeyword = ref('');

/**
 * 搜索员工
 */
const handleSearch = async () => {
  try {
    employeeStore.setKeyword(searchKeyword.value);
    await employeeStore.fetchList();
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
  }
};

/**
 * 重置筛选条件
 */
const handleReset = async () => {
  searchKeyword.value = '';
  employeeStore.resetFilters();
  try {
    await employeeStore.fetchList();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
  }
};

/**
 * 分页切换
 */
const handlePageChange = async (page: number) => {
  employeeStore.setPage(page);
  try {
    await employeeStore.fetchList();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 每页条数切换
 */
const handleSizeChange = async (size: number) => {
  employeeStore.filters.pageSize = size;
  employeeStore.filters.pageNum = 1; // 重置到第一页
  try {
    await employeeStore.fetchList();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 查看员工详情
 */
const handleViewDetail = (id: string) => {
  router.push(`/employees/${id}`);
};

/**
 * 初始化：加载员工列表
 */
onMounted(async () => {
  try {
    await employeeStore.fetchList();
  } catch (error) {
    ElMessage.error('加载员工列表失败');
  }
});
</script>

<style scoped>
.employee-list-page {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
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
}
</style>
