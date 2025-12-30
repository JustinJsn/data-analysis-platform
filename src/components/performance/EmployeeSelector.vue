<template>
  <div class="employee-selector">
    <el-form-item label="人员">
      <el-popover
        v-model:visible="visible"
        placement="bottom-start"
        :width="600"
        trigger="click"
      >
        <template #reference>
          <el-input
            :model-value="selectedEmployeesText"
            placeholder="请选择人员（支持多选）"
            readonly
            style="width: 100%"
          >
            <template #suffix>
              <el-icon><ArrowDown /></el-icon>
            </template>
          </el-input>
        </template>

        <div class="employee-selector-container">
          <!-- 搜索框 -->
          <el-input
            v-model="searchKeyword"
            placeholder="搜索姓名或工号"
            clearable
            class="search-input"
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <!-- 虚拟表格 -->
          <div v-loading="employeeStore.loading" class="table-wrapper">
            <el-table-v2
              :columns="columns"
              :data="employeeStore.list"
              :width="576"
              :height="400"
              row-key="id"
              :row-class="getRowClass"
              @row-click="handleRowClick"
            />
          </div>

          <!-- 已选人员提示 -->
          <div v-if="selectedEmployeeIds.length > 0" class="selected-info">
            已选择 {{ selectedEmployeeIds.length }} 人
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
import { ref, computed, h, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Search, ArrowDown } from '@element-plus/icons-vue';
import { ElCheckbox } from 'element-plus';
import { useEmployeeStore } from '@/stores/employee';
import type { Employee } from '@/types/api';

interface Props {
  /** 选中的人员ID数组 */
  employeeIds?: string[];
}

interface Emits {
  (e: 'update:employeeIds', value: string[]): void;
  (e: 'change', employeeIds: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  employeeIds: () => [],
});

const emit = defineEmits<Emits>();

const employeeStore = useEmployeeStore();

/** 弹窗显示状态 */
const visible = ref(false);

/** 搜索关键词 */
const searchKeyword = ref('');

/** 当前选中的人员ID数组 */
const selectedEmployeeIds = ref<string[]>(props.employeeIds || []);

/** 选中的员工文本 */
const selectedEmployeesText = computed(() => {
  if (selectedEmployeeIds.value.length === 0) {
    return '';
  }
  if (selectedEmployeeIds.value.length === 1) {
    const employee = employeeStore.list.find(
      (e) => e.id === selectedEmployeeIds.value[0],
    );
    return employee?.name || '';
  }
  return `已选择 ${selectedEmployeeIds.value.length} 人`;
});

/** 表格列定义 */
const columns = computed(() => {
  return [
    {
      key: 'checkbox',
      title: '',
      dataKey: 'checkbox',
      width: 50,
      cellRenderer: ({ rowData }: { rowData: Employee }) => {
        const checked = selectedEmployeeIds.value.includes(rowData.id);
        return h(ElCheckbox, {
          modelValue: checked,
          onClick: (e: Event) => {
            e.stopPropagation();
            handleToggleSelect(rowData.id);
          },
        });
      },
    },
    {
      key: 'employeeNo',
      title: '工号',
      dataKey: 'employeeNo',
      width: 130,
    },
    {
      key: 'name',
      title: '姓名',
      dataKey: 'name',
      width: 130,
    },
    {
      key: 'organizationName',
      title: '部门',
      dataKey: 'organizationName',
      width: 266,
    },
  ];
});

/** 获取行样式类 */
function getRowClass({ rowData }: { rowData: Employee }) {
  return selectedEmployeeIds.value.includes(rowData.id) ? 'selected-row' : '';
}

/** 处理行点击 */
function handleRowClick({ rowData }: { rowData: Employee }) {
  handleToggleSelect(rowData.id);
}

/** 切换选择状态 */
function handleToggleSelect(employeeId: string) {
  const index = selectedEmployeeIds.value.indexOf(employeeId);
  if (index > -1) {
    selectedEmployeeIds.value.splice(index, 1);
  } else {
    selectedEmployeeIds.value.push(employeeId);
  }
}

/** 处理搜索 */
function handleSearch() {
  employeeStore.setKeyword(searchKeyword.value);
  employeeStore.fetchList();
}

/** 处理确认 */
function handleConfirm() {
  emit('update:employeeIds', [...selectedEmployeeIds.value]);
  emit('change', [...selectedEmployeeIds.value]);
  visible.value = false;
}

/** 处理清空 */
function handleClear() {
  selectedEmployeeIds.value = [];
  emit('update:employeeIds', []);
  emit('change', []);
  visible.value = false;
}

// 监听 props 变化
watch(
  () => props.employeeIds,
  (value) => {
    selectedEmployeeIds.value = value ? [...value] : [];
  },
  { deep: true },
);

// 初始化：加载员工列表
onMounted(async () => {
  if (employeeStore.list.length === 0) {
    try {
      await employeeStore.fetchList();
    } catch (error) {
      ElMessage.error('加载员工列表失败');
    }
  }
});
</script>

<style scoped>
.employee-selector {
  width: 100%;
}

.employee-selector-container {
  width: 100%;
  box-sizing: border-box;
}

.search-input {
  margin-bottom: 12px;
}

.table-wrapper {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  overflow: hidden;
  width: 100%;
}

.selected-info {
  margin-top: 12px;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.popover-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}

:deep(.selected-row) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-table-v2__row:hover) {
  background-color: var(--el-fill-color-lighter);
  cursor: pointer;
}

:deep(.el-table-v2) {
  width: 100%;
}

:deep(.el-table-v2__header) {
  background-color: var(--el-fill-color-lighter);
}

:deep(.el-table-v2__header-cell) {
  padding: 8px 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

:deep(.el-table-v2__cell) {
  padding: 8px 12px;
}

/* 确保弹出框内容正确显示 */
:deep(.el-popover__content) {
  padding: 12px;
  box-sizing: border-box;
}
</style>
