<template>
  <div class="organization-tree-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2 class="page-title">组织架构</h2>
      <div class="page-subtitle">查看组织树形结构</div>
    </div>

    <!-- 组织树卡片 -->
    <div class="card">
      <div v-loading="organizationStore.loading" class="tree-container">
        <el-tree
          v-if="organizationStore.tree.length > 0"
          :data="organizationStore.tree"
          :props="treeProps"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <el-icon class="node-icon">
                <OfficeBuilding />
              </el-icon>
              <span class="node-label">{{ node.label }}</span>
              <span class="node-code">{{ data.code }}</span>
            </div>
          </template>
        </el-tree>

        <!-- 空状态 -->
        <el-empty v-else description="暂无组织数据" />
      </div>

      <!-- 组织详情抽屉 -->
      <el-drawer
        v-model="drawerVisible"
        title="组织详情"
        direction="rtl"
        size="40%"
      >
        <template v-if="selectedOrganization">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="组织名称">
              {{ selectedOrganization.name }}
            </el-descriptions-item>

            <el-descriptions-item label="组织编码">
              {{ selectedOrganization.code }}
            </el-descriptions-item>

            <el-descriptions-item label="组织层级">
              {{ selectedOrganization.level }}
            </el-descriptions-item>

            <el-descriptions-item label="父组织ID">
              {{ selectedOrganization.parentId || '无（根组织）' }}
            </el-descriptions-item>

            <el-descriptions-item label="子组织数量">
              {{ selectedOrganization.children?.length || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { OfficeBuilding } from '@element-plus/icons-vue';
import { useOrganizationStore } from '@/stores/organization';
import type { Organization } from '@/types/api';

const organizationStore = useOrganizationStore();

// 树形组件配置
const treeProps = {
  children: 'children',
  label: 'name',
};

// 抽屉显示状态
const drawerVisible = ref(false);

// 当前选中的组织
const selectedOrganization = ref<Organization | null>(null);

/**
 * 节点点击事件
 */
const handleNodeClick = (data: Organization) => {
  selectedOrganization.value = data;
  drawerVisible.value = true;
};

/**
 * 初始化：加载组织树
 */
onMounted(async () => {
  try {
    await organizationStore.fetchTree();
  } catch (error) {
    ElMessage.error('加载组织架构失败');
  }
});
</script>

<style scoped>
.organization-tree-page {
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

.card {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  min-height: 600px;
}

.tree-container {
  min-height: 500px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 4px 0;
}

.node-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.node-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
}

:deep(.el-tree) {
  background: transparent;
}

:deep(.el-tree-node__content) {
  height: 36px;
  padding: 4px 0;
}

:deep(.el-tree-node__content:hover) {
  background: var(--el-fill-color-light);
}
</style>
