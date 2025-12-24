<template>
  <div class="empty-state" :class="sizeClass">
    <div class="empty-state-icon">
      <component :is="icon" v-if="icon" class="icon" />
      <el-icon v-else class="icon"><Document /></el-icon>
    </div>

    <div class="empty-state-content">
      <div class="empty-state-title">{{ title }}</div>
      <div v-if="description" class="empty-state-description">
        {{ description }}
      </div>
    </div>

    <div v-if="$slots.actions || actionText" class="empty-state-actions">
      <slot name="actions">
        <el-button v-if="actionText" :type="actionType" @click="handleAction">
          {{ actionText }}
        </el-button>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Document } from '@element-plus/icons-vue';
import type { Component } from 'vue';

interface Props {
  /** 标题 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 自定义图标 */
  icon?: Component;
  /** 操作按钮文字 */
  actionText?: string;
  /** 操作按钮类型 */
  actionType?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text';
  /** 尺寸 */
  size?: 'small' | 'default' | 'large';
}

const props = withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '',
  icon: undefined,
  actionText: '',
  actionType: 'primary',
  size: 'default',
});

const emit = defineEmits<{
  /** 操作按钮点击事件 */
  action: [];
}>();

const sizeClass = computed(() => {
  return `empty-state-${props.size}`;
});

/**
 * 操作按钮点击事件
 */
const handleAction = () => {
  emit('action');
};
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}

.empty-state-small {
  padding: 24px 16px;
}

.empty-state-large {
  padding: 60px 20px;
}

.empty-state-icon {
  margin-bottom: 16px;
}

.empty-state-icon .icon {
  font-size: 64px;
  color: var(--el-text-color-placeholder);
}

.empty-state-small .empty-state-icon .icon {
  font-size: 48px;
}

.empty-state-large .empty-state-icon .icon {
  font-size: 80px;
}

.empty-state-content {
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.empty-state-small .empty-state-title {
  font-size: 14px;
}

.empty-state-large .empty-state-title {
  font-size: 18px;
}

.empty-state-description {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  max-width: 400px;
  line-height: 1.6;
}

.empty-state-small .empty-state-description {
  font-size: 12px;
}

.empty-state-actions {
  margin-top: 8px;
}
</style>
