<template>
  <div class="sync-batch-table">
    <el-table
      v-loading="loading"
      :data="data"
      stripe
      style="width: 100%"
      :size="compact ? 'small' : 'default'"
    >
      <el-table-column
        prop="batch_id"
        label="批次ID"
        :width="compact ? 180 : 280"
        show-overflow-tooltip
      />

      <el-table-column prop="sync_type" label="同步类型" width="100">
        <template #default="{ row }">
          <el-tag :type="getSyncTypeTagType(row.sync_type) as any" size="small">
            {{ getSyncTypeLabel(row.sync_type) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status) as any" size="small">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        v-if="!compact"
        prop="trigger_mode"
        label="触发方式"
        width="100"
      >
        <template #default="{ row }">
          {{ getTriggerModeLabel(row.trigger_mode) }}
        </template>
      </el-table-column>

      <el-table-column
        prop="total_records"
        label="总数"
        width="80"
        align="center"
      />
      <el-table-column
        prop="success_records"
        label="成功"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <span class="text-success">{{ row.success_records }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="failed_records"
        label="失败"
        width="80"
        align="center"
      >
        <template #default="{ row }">
          <span
            :class="{ 'text-danger': row.failed_records > 0 }"
            >{{ row.failed_records }}</span
          >
        </template>
      </el-table-column>

      <el-table-column
        prop="started_at"
        label="开始时间"
        :width="compact ? 160 : 180"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.started_at) }}
        </template>
      </el-table-column>

      <el-table-column
        v-if="!compact"
        prop="completed_at"
        label="结束时间"
        width="180"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.completed_at) }}
        </template>
      </el-table-column>

      <el-table-column label="耗时" width="100">
        <template #default="{ row }">
          {{ formatDurationDesc(calculateDurationSeconds(row.started_at, row.completed_at)) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" :width="compact ? 80 : 100" fixed="right">
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="$emit('view-detail', row.batch_id)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import {
  formatDateTime,
  getSyncTypeLabel,
  getSyncTypeTagType,
  getStatusLabel,
  getStatusType,
  getTriggerModeLabel,
  calculateDurationSeconds,
  formatDurationDesc
} from '@/utils/transform';
import type { SyncBatch } from '@/types/api';

// TagType moved to inline as any to simplify for now

interface Props {
  data: SyncBatch[];
  loading?: boolean;
  compact?: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'view-detail', id: string): void;
}>();
</script>

<style scoped>
.text-success {
  color: var(--el-color-success);
}
.text-danger {
  color: var(--el-color-danger);
  font-weight: bold;
}
</style>
