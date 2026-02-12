<template>
  <el-dialog
    v-model="dialogVisible"
    title="导出数据"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="导出类型">
        <el-radio-group v-model="form.exportType">
          <el-radio value="batch">批量导出（当前页）</el-radio>
          <el-radio value="all">全量导出（所有数据）</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="导出格式">
        <el-tag type="success">Excel (.xlsx)</el-tag>
      </el-form-item>

      <el-alert
        v-if="form.exportType === 'batch'"
        title="提示"
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          将导出当前页的数据，共 {{ currentPageCount }} 条记录
        </template>
      </el-alert>

      <el-alert
        v-if="form.exportType === 'all'"
        title="提示"
        type="warning"
        :closable="false"
        show-icon
      >
        <template #default>
          将导出所有符合条件的数据，共
          {{ totalCount }} 条记录。导出任务将异步处理，完成后可下载文件。
        </template>
      </el-alert>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="exporting" @click="handleExport">
          开始导出
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { captureError, addBreadcrumb } from '@/utils/sentry';

interface Props {
  /** 对话框显示状态 */
  visible: boolean;
  /** 当前页记录数 */
  currentPageCount?: number;
  /** 总记录数 */
  totalCount?: number;
  /** 是否正在导出 */
  exporting?: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'export', type: 'batch' | 'all', format: 'xlsx'): void;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  currentPageCount: 0,
  totalCount: 0,
  exporting: false,
});

const emit = defineEmits<Emits>();

/** 对话框显示状态（内部） */
const dialogVisible = ref(props.visible);

/** 表单数据 */
const form = ref<{
  exportType: 'batch' | 'all';
  format: 'xlsx';
}>({
  exportType: 'batch',
  format: 'xlsx',
});

/** 处理关闭 */
function handleClose() {
  dialogVisible.value = false;
  emit('update:visible', false);
}

/** 处理导出 */
function handleExport() {
  try {
    emit('export', form.value.exportType, form.value.format);

    addBreadcrumb({
      message: '导出操作已触发',
      category: 'performance-report.export',
      level: 'info',
      data: {
        exportType: form.value.exportType,
        format: form.value.format,
      },
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    captureError(err, {
      type: 'Export Dialog Error',
      fingerprint: ['export-dialog-error'],
    });
    ElMessage.error('导出失败，请稍后重试');
  }
}

// 监听 props.visible 变化
watch(
  () => props.visible,
  (value) => {
    dialogVisible.value = value;
  },
);

// 监听 dialogVisible 变化
watch(dialogVisible, (value) => {
  emit('update:visible', value);
});
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
