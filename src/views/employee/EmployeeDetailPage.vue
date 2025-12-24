<template>
  <div class="employee-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回列表
      </el-button>
      <h2 class="page-title">员工详情</h2>
    </div>

    <!-- 加载状态 -->
    <div v-loading="employeeStore.loading" class="card">
      <template v-if="employeeStore.currentEmployee">
        <el-descriptions
          :title="employeeStore.currentEmployee.name"
          :column="2"
          border
        >
          <el-descriptions-item label="员工编号">
            {{ employeeStore.currentEmployee.employeeNo }}
          </el-descriptions-item>

          <el-descriptions-item label="姓名">
            {{ employeeStore.currentEmployee.name }}
          </el-descriptions-item>

          <el-descriptions-item label="手机号">
            {{ employeeStore.currentEmployee.phone || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="邮箱">
            {{ employeeStore.currentEmployee.email || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="所属组织" :span="2">
            {{ employeeStore.currentEmployee.organizationName || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="岗位职务" :span="2">
            {{ employeeStore.currentEmployee.jobPostName || '-' }}
          </el-descriptions-item>

          <el-descriptions-item label="入职日期">
            {{ formatDate(employeeStore.currentEmployee.employmentDate) }}
          </el-descriptions-item>

          <el-descriptions-item label="在职状态">
            <el-tag
              v-if="employeeStore.currentEmployee.employmentStatus === 'active'"
              type="success"
            >
              在职
            </el-tag>
            <el-tag
              v-else-if="employeeStore.currentEmployee.employmentStatus === 'inactive'"
              type="info"
            >
              离职
            </el-tag>
            <el-tag
              v-else-if="employeeStore.currentEmployee.employmentStatus === 'suspended'"
              type="warning"
            >
              停用
            </el-tag>
            <el-tag v-else type="info">
              {{ employeeStore.currentEmployee.employmentStatus }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </template>

      <!-- 空状态 -->
      <el-empty v-else description="员工信息不存在" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import { ArrowLeft } from '@element-plus/icons-vue';
import { useEmployeeStore } from '@/stores/employee';

const router = useRouter();
const route = useRoute();
const employeeStore = useEmployeeStore();

/**
 * 格式化日期（YYYY-MM-DD）
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

/**
 * 格式化日期时间（YYYY-MM-DD HH:mm:ss）
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
 * 返回列表
 */
const handleBack = () => {
  router.push('/employees');
};

/**
 * 初始化：加载员工详情
 */
onMounted(async () => {
  const employeeId = route.params.id as string;
  if (!employeeId) {
    ElMessage.error('员工ID不存在');
    router.push('/employees');
    return;
  }

  try {
    await employeeStore.fetchDetail(employeeId);
  } catch (error) {
    ElMessage.error('加载员工详情失败');
    // 可以选择返回列表页
    // router.push('/employees');
  }
});
</script>

<style scoped>
.employee-detail-page {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.card {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  min-height: 400px;
}

:deep(.el-descriptions__title) {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
</style>
