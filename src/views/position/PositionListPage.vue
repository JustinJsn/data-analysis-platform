<template>
  <div class="position-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">职务管理</h2>
      <div class="page-subtitle">查询和管理职务信息</div>
    </div>

    <!-- 搜索筛选区域 -->
    <div class="filter-section">
      <el-form :inline="true">
        <el-form-item label="搜索职务">
          <el-input
            v-model="searchKeyword"
            placeholder="输入职务名称进行搜索"
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

    <!-- 职务表格 -->
    <div class="card">
      <el-table
        v-loading="positionStore.loading"
        :data="positionStore.list"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="code" label="职务编码" min-width="200" />
        <el-table-column prop="name" label="职务名称" min-width="300" />
        <el-table-column prop="id" label="职务ID" min-width="280" />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="positionStore.filters.pageNum"
          v-model:page-size="positionStore.filters.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="positionStore.total"
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
import { ElMessage } from 'element-plus';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
import { usePositionStore } from '@/stores/position';

const positionStore = usePositionStore();

// 搜索关键词（本地临时变量）
const searchKeyword = ref('');

/**
 * 搜索职务
 */
const handleSearch = async () => {
  try {
    positionStore.setKeyword(searchKeyword.value);
    await positionStore.fetchList();
  } catch (error) {
    ElMessage.error('搜索失败，请稍后重试');
  }
};

/**
 * 重置筛选条件
 */
const handleReset = async () => {
  searchKeyword.value = '';
  positionStore.resetFilters();
  try {
    await positionStore.fetchList();
  } catch (error) {
    ElMessage.error('重置失败，请稍后重试');
  }
};

/**
 * 分页切换
 */
const handlePageChange = async (page: number) => {
  positionStore.setPage(page);
  try {
    await positionStore.fetchList();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 每页条数切换
 */
const handleSizeChange = async (size: number) => {
  positionStore.filters.pageSize = size;
  positionStore.filters.pageNum = 1; // 重置到第一页
  try {
    await positionStore.fetchList();
  } catch (error) {
    ElMessage.error('加载数据失败，请稍后重试');
  }
};

/**
 * 初始化：加载职务列表
 */
onMounted(async () => {
  try {
    await positionStore.fetchList();
  } catch (error) {
    ElMessage.error('加载职务列表失败');
  }
});
</script>

<style scoped>
.position-list-page {
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
