<template>
  <div class="data-card" :class="{ 'has-trend': trend !== undefined }">
    <div class="card-header">
      <div class="card-icon" :style="{ background: iconBg }">
        <component :is="icon" class="icon" />
      </div>
      <div class="card-info">
        <div class="card-label">{{ title }}</div>
        <div class="card-value">{{ formattedValue }}</div>
      </div>
    </div>

    <div v-if="trend !== undefined" class="card-footer">
      <div class="trend" :class="trendClass">
        <el-icon>
          <component :is="trendIcon" />
        </el-icon>
        <span>{{ trendText }}</span>
      </div>
      <div class="trend-label">较上次</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue';
import type { Component } from 'vue';

interface Props {
  /** 标题 */
  title: string;
  /** 数值 */
  value: number | string;
  /** 图标组件 */
  icon: Component;
  /** 图标背景色 */
  iconBg?: string;
  /** 趋势（可选，正数表示上升，负数表示下降） */
  trend?: number;
}

const props = withDefaults(defineProps<Props>(), {
  iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  trend: undefined
});

/** 格式化数值 */
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});

/** 趋势图标 */
const trendIcon = computed(() => {
  if (props.trend === undefined) return Minus;
  if (props.trend > 0) return ArrowUp;
  if (props.trend < 0) return ArrowDown;
  return Minus;
});

/** 趋势文本 */
const trendText = computed(() => {
  if (props.trend === undefined) return '-';
  const absValue = Math.abs(props.trend);
  return `${absValue}%`;
});

/** 趋势样式类 */
const trendClass = computed(() => {
  if (props.trend === undefined) return 'neutral';
  if (props.trend > 0) return 'up';
  if (props.trend < 0) return 'down';
  return 'neutral';
});
</script>

<style scoped>
.data-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.data-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon .icon {
  font-size: 28px;
  color: white;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
}

.trend.up {
  color: var(--el-color-success);
}

.trend.down {
  color: var(--el-color-danger);
}

.trend.neutral {
  color: var(--el-text-color-secondary);
}

.trend-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
