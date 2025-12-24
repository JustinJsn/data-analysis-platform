<template>
  <div class="page-header">
    <div v-if="showBack" class="header-back">
      <el-button @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        {{ backText }}
      </el-button>
    </div>

    <div class="header-content">
      <div class="header-main">
        <h2 class="header-title">{{ title }}</h2>
        <div v-if="subtitle" class="header-subtitle">{{ subtitle }}</div>
      </div>

      <div v-if="$slots.extra" class="header-extra">
        <slot name="extra"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';

interface Props {
  /** 页面标题 */
  title: string;
  /** 副标题（可选） */
  subtitle?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 返回按钮文字 */
  backText?: string;
  /** 自定义返回路径 */
  backPath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  showBack: false,
  backText: '返回',
  backPath: '',
});

const router = useRouter();

/**
 * 返回按钮点击事件
 */
const handleBack = () => {
  if (props.backPath) {
    router.push(props.backPath);
  } else {
    router.back();
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.header-back {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.header-main {
  flex: 1;
  min-width: 0;
}

.header-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.header-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

.header-extra {
  flex-shrink: 0;
}
</style>
