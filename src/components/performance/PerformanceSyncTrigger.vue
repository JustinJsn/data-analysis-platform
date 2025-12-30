<template>
  <div class="performance-sync-trigger">
    <el-dialog
      v-model="visible"
      title="绩效数据同步"
      width="500px"
      :close-on-click-modal="false"
      @close="handleClose"
    >
      <el-form :model="form" label-width="120px">
        <el-form-item label="同步类型" required>
          <el-radio-group v-model="form.sync_type">
            <el-radio value="incremental">增量同步</el-radio>
            <el-radio value="full">全量同步</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="数据源">
          <el-select
            v-model="form.external_system_id"
            placeholder="请选择数据源（不选则同步所有数据源）"
            clearable
            style="width: 100%"
          >
            <!-- 数据源列表可以后续扩展 -->
            <el-option label="全部数据源" value="" />
          </el-select>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="form.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
            :clearable="true"
            style="width: 100%"
          />
        </el-form-item>

        <el-alert title="说明" type="info" :closable="false" show-icon>
          <template #default>
            <div>
              <p>• 增量同步：仅同步自上次同步以来的变更数据</p>
              <p>• 全量同步：同步所有数据，覆盖现有数据</p>
              <p>• 不填写时间范围将同步所有数据</p>
            </div>
          </template>
        </el-alert>

        <!-- 同步进度显示 -->
        <el-form-item v-if="syncing" label="同步进度">
          <div class="sync-progress">
            <el-progress
              :percentage="syncProgress || 0"
              :status="syncStatus === 'failed' ? 'exception' : undefined"
            />
            <div v-if="syncStatus === 'syncing'" class="sync-status-text">
              正在同步中...
            </div>
            <div
              v-else-if="syncStatus === 'success'"
              class="sync-status-text success"
            >
              同步成功
            </div>
            <div
              v-else-if="syncStatus === 'failed'"
              class="sync-status-text error"
            >
              {{ syncError || '同步失败' }}
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button
            type="primary"
            :loading="syncing"
            :disabled="!canSync"
            @click="handleConfirm"
          >
            {{ syncing ? '同步中...' : '开始同步' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { usePerformanceStore } from '@/stores/performance';
import type { PerformanceSyncRequest } from '@/types/performance';

interface Props {
  /** 是否显示对话框 */
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  /** 更新显示状态 */
  'update:modelValue': [value: boolean];
  /** 同步成功 */
  success: [];
  /** 同步失败 */
  error: [error: string];
}>();

const performanceStore = usePerformanceStore();

/** 对话框显示状态 */
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

/** 同步表单 */
const form = ref<{
  sync_type: 'incremental' | 'full';
  external_system_id?: string;
  timeRange: [string, string] | null;
}>({
  sync_type: 'incremental',
  external_system_id: undefined,
  timeRange: null,
});

/** 是否正在同步 */
const syncing = computed(() => performanceStore.syncing);

/** 同步进度 */
const syncProgress = computed(() => performanceStore.syncProgress);

/** 同步状态 */
const syncStatus = computed(() => performanceStore.syncStatus);

/** 同步错误 */
const syncError = computed(() => performanceStore.syncError);

/** 是否可以触发同步 */
const canSync = computed(() => performanceStore.canSync);

/** 监听同步状态变化 */
watch(
  () => performanceStore.syncStatus,
  (status) => {
    if (status === 'success') {
      ElMessage.success('绩效数据同步成功');
      emit('success');
      // 延迟关闭对话框，让用户看到成功提示
      setTimeout(() => {
        handleClose();
      }, 1500);
    } else if (status === 'failed') {
      ElMessage.error(performanceStore.syncError || '绩效数据同步失败');
      emit('error', performanceStore.syncError || '同步失败');
    }
  },
);

/**
 * 确认触发同步
 */
const handleConfirm = async () => {
  try {
    // 构建请求参数
    const params: PerformanceSyncRequest = {
      sync_type: form.value.sync_type,
    };

    // 添加数据源ID（如果有）
    if (form.value.external_system_id) {
      params.external_system_id = form.value.external_system_id;
    }

    // 添加时间范围（如果有）
    if (form.value.timeRange) {
      params.time_range_start = form.value.timeRange[0];
      params.time_range_end = form.value.timeRange[1];
    }

    // 触发同步
    await performanceStore.triggerSync(params);
  } catch (error) {
    // 错误已在 Store 中处理，这里不需要额外处理
    // 错误会通过 ElMessage 显示给用户
  }
};

/**
 * 关闭对话框
 */
const handleClose = () => {
  // 如果正在同步，不允许关闭
  if (syncing.value) {
    ElMessage.warning('同步进行中，请等待同步完成');
    return;
  }

  // 重置表单
  form.value = {
    sync_type: 'incremental',
    external_system_id: undefined,
    timeRange: null,
  };

  // 关闭对话框
  visible.value = false;
};
</script>

<style scoped>
.performance-sync-trigger {
  /* 组件样式 */
}

.sync-progress {
  width: 100%;
  padding: 8px 0;
}

.sync-status-text {
  margin-top: 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.sync-status-text.success {
  color: var(--el-color-success);
  font-weight: 500;
}

.sync-status-text.error {
  color: var(--el-color-danger);
  font-weight: 500;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-alert) {
  margin-top: 8px;
}

:deep(.el-alert__content) {
  padding-left: 8px;
}

:deep(.el-alert__content p) {
  margin: 4px 0;
  line-height: 1.6;
}
</style>
