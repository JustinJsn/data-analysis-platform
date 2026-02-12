<template>
  <div class="department-selector">
    <el-form-item label="部门">
      <el-popover
        v-model:visible="visible"
        placement="bottom-start"
        :width="400"
        trigger="click"
      >
        <template #reference>
          <el-input
            :model-value="selectedDepartmentName"
            placeholder="请选择部门"
            readonly
            style="width: 100%"
          >
            <template #suffix>
              <el-icon><ArrowDown /></el-icon>
            </template>
          </el-input>
        </template>

        <div class="department-tree-container">
          <!-- 搜索框 -->
          <div class="search-wrapper">
            <el-input v-model="searchKeyword" placeholder="搜索部门" clearable>
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 组织树 -->
          <div v-loading="organizationStore.loading" class="tree-wrapper">
            <el-tree-v2
              v-if="filteredTree.length > 0"
              :data="filteredTree"
              :props="treeProps"
              node-key="id"
              :height="300"
              :default-expand-all="false"
              :expand-on-click-node="false"
              :highlight-current="true"
              :current-node-key="selectedDepartmentId"
              @node-click="handleNodeClick"
            >
              <template #default="{ node, data }">
                <div class="tree-node">
                  <el-icon class="node-icon">
                    <OfficeBuilding />
                  </el-icon>
                  <span class="node-label">{{ node.label }}</span>
                  <span
                    v-if="data.code"
                    class="node-code"
                    >{{ data.code }}</span
                  >
                </div>
              </template>
            </el-tree-v2>
            <el-empty v-else description="暂无部门数据" />
          </div>

          <!-- 包含下级部门选项 -->
          <div class="include-children-option">
            <el-checkbox v-model="includeChildren"> 包含下级部门 </el-checkbox>
          </div>

          <!-- 操作按钮 -->
          <div class="popover-footer">
            <el-button size="small" @click="handleClear">清空</el-button>
            <el-button type="primary" size="small" @click="handleConfirm">
              确定
            </el-button>
          </div>
        </div>
      </el-popover>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, ArrowDown, OfficeBuilding } from '@element-plus/icons-vue';
import { useOrganizationStore } from '@/stores/organization';
import type { Organization } from '@/types/api';

interface Props {
  /** 选中的部门ID */
  departmentId?: string;
  /** 是否包含下级部门 */
  includeSubDepartments?: boolean;
}

interface Emits {
  (e: 'update:departmentId', value: string | undefined): void;
  (e: 'update:includeSubDepartments', value: boolean): void;
  (e: 'change', departmentId: string | undefined, includeSub: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  departmentId: undefined,
  includeSubDepartments: false,
});

const emit = defineEmits<Emits>();

const organizationStore = useOrganizationStore();

/** 弹窗显示状态 */
const visible = ref(false);

/** 搜索关键词 */
const searchKeyword = ref('');

/** 当前选中的部门ID */
const selectedDepartmentId = ref<string | undefined>(props.departmentId);

/** 是否包含下级部门 */
const includeChildren = ref(props.includeSubDepartments);

/** 树形组件配置 */
const treeProps = {
  children: 'children',
  label: 'name',
};

/** 选中的部门名称 */
const selectedDepartmentName = computed(() => {
  if (!selectedDepartmentId.value) {
    return '';
  }
  const org = organizationStore.getOrganizationById(selectedDepartmentId.value);
  return org?.name || '';
});

/** 过滤后的组织树 */
const filteredTree = computed(() => {
  if (!searchKeyword.value.trim()) {
    return organizationStore.tree;
  }

  const keyword = searchKeyword.value.toLowerCase();
  const filterTree = (nodes: Organization[]): Organization[] => {
    return nodes
      .filter((node) => {
        const match =
          node.name.toLowerCase().includes(keyword) ||
          node.code?.toLowerCase().includes(keyword);
        return match;
      })
      .map((node) => {
        const filteredChildren = node.children
          ? filterTree(node.children)
          : [];
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : [],
        };
      });
  };

  return filterTree(organizationStore.tree);
});

/** 处理节点点击 */
function handleNodeClick(data: unknown, _node: unknown, _e: MouseEvent) {
  const org = data as Organization;
  selectedDepartmentId.value = org.id;
}

/** 处理确认 */
function handleConfirm() {
  emit('update:departmentId', selectedDepartmentId.value);
  emit('update:includeSubDepartments', includeChildren.value);
  emit('change', selectedDepartmentId.value, includeChildren.value);
  visible.value = false;
}

/** 处理清空 */
function handleClear() {
  selectedDepartmentId.value = undefined;
  includeChildren.value = false;
  emit('update:departmentId', undefined);
  emit('update:includeSubDepartments', false);
  emit('change', undefined, false);
  visible.value = false;
}

// 监听 props 变化
watch(
  () => props.departmentId,
  (value) => {
    selectedDepartmentId.value = value;
  },
);

watch(
  () => props.includeSubDepartments,
  (value) => {
    includeChildren.value = value;
  },
);

// 初始化：加载组织树
onMounted(async () => {
  if (organizationStore.tree.length === 0) {
    try {
      await organizationStore.fetchTree();
    } catch (error) {
      ElMessage.error('加载组织架构失败');
    }
  }
});
</script>

<style scoped>
.department-selector {
  width: 100%;
}

.department-tree-container {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}

.search-wrapper {
  margin-bottom: 12px;
}

.tree-wrapper {
  min-height: 300px;
  max-height: 400px;
  overflow: hidden;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  box-sizing: border-box;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 4px 0;
  min-width: 0;
}

.node-icon {
  color: var(--el-color-primary);
  font-size: 16px;
  flex-shrink: 0;
}

.node-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-code {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  margin-left: auto;
}

.include-children-option {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}

.popover-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}

:deep(.el-tree-v2) {
  width: 100%;
}

:deep(.el-tree-v2__node) {
  height: 36px;
  padding: 4px 8px;
  box-sizing: border-box;
}

:deep(.el-tree-v2__node:hover) {
  background: var(--el-fill-color-light);
}

:deep(.el-tree-v2__node.is-current) {
  background: var(--el-color-primary-light-9);
}

:deep(.el-tree-v2__node.is-current .node-label) {
  color: var(--el-color-primary);
  font-weight: 600;
}

:deep(.el-tree-v2__body) {
  overflow-y: auto;
}

/* 确保弹出框内容正确显示 */
:deep(.el-popover__content) {
  padding: 12px;
  box-sizing: border-box;
}
</style>
