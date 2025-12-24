<template>
  <div class="filter-panel">
    <div v-if="title" class="filter-panel-header">
      <div class="filter-panel-title">{{ title }}</div>
      <div v-if="$slots.actions" class="filter-panel-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="filter-panel-content">
      <slot></slot>
    </div>

    <div v-if="showButtons" class="filter-panel-footer">
      <el-button type="primary" :loading="loading" @click="handleSearch">
        <el-icon><Search /></el-icon>
        {{ searchText }}
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshLeft /></el-icon>
        {{ resetText }}
      </el-button>
      <slot name="buttons"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, RefreshLeft } from '@element-plus/icons-vue';

interface Props {
  /** 面板标题（可选） */
  title?: string;
  /** 是否显示操作按钮 */
  showButtons?: boolean;
  /** 搜索按钮文字 */
  searchText?: string;
  /** 重置按钮文字 */
  resetText?: string;
  /** 加载状态 */
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  title: '',
  showButtons: true,
  searchText: '搜索',
  resetText: '重置',
  loading: false,
});

const emit = defineEmits<{
  /** 搜索事件 */
  search: [];
  /** 重置事件 */
  reset: [];
}>();

/**
 * 搜索按钮点击事件
 */
const handleSearch = () => {
  emit('search');
};

/**
 * 重置按钮点击事件
 */
const handleReset = () => {
  emit('reset');
};
</script>

<style scoped>
.filter-panel {
  background: var(--el-bg-color);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.filter-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.filter-panel-actions {
  flex-shrink: 0;
}

.filter-panel-content {
  margin-bottom: 16px;
}

.filter-panel-footer {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
