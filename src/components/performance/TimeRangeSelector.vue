<template>
  <div class="time-range-selector">
    <el-form-item label="时间范围">
      <el-radio-group v-model="mode" @change="handleModeChange">
        <el-radio-button value="year">年份段</el-radio-button>
        <el-radio-button value="quarter">季度</el-radio-button>
      </el-radio-group>
    </el-form-item>

    <!-- 年份段模式 -->
    <template v-if="mode === 'year'">
      <YearRangeSelector
        v-model:start-year="yearRange.start"
        v-model:end-year="yearRange.end"
        @change="handleYearRangeChange"
      />
    </template>

    <!-- 季度模式 -->
    <template v-if="mode === 'quarter'">
      <div class="quarter-selector">
        <el-form-item label="开始时间">
          <div class="quarter-inputs">
            <el-select
              v-model="quarterRange.start.year"
              placeholder="年份"
              style="width: 120px"
              @change="handleQuarterChange"
            >
              <el-option
                v-for="year in yearOptions"
                :key="year"
                :label="year"
                :value="year"
              />
            </el-select>
            <el-select
              v-model="quarterRange.start.quarter"
              placeholder="季度"
              style="width: 100px"
              @change="handleQuarterChange"
            >
              <el-option label="Q1" :value="1" />
              <el-option label="Q2" :value="2" />
              <el-option label="Q3" :value="3" />
              <el-option label="Q4" :value="4" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item label="结束时间">
          <div class="quarter-inputs">
            <el-select
              v-model="quarterRange.end.year"
              placeholder="年份"
              style="width: 120px"
              :disabled="autoCalculateEnd"
              @change="handleQuarterChange"
            >
              <el-option
                v-for="year in yearOptions"
                :key="year"
                :label="year"
                :value="year"
              />
            </el-select>
            <el-select
              v-model="quarterRange.end.quarter"
              placeholder="季度"
              style="width: 100px"
              :disabled="autoCalculateEnd"
              @change="handleQuarterChange"
            >
              <el-option label="Q1" :value="1" />
              <el-option label="Q2" :value="2" />
              <el-option label="Q3" :value="3" />
              <el-option label="Q4" :value="4" />
            </el-select>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox
            v-model="autoCalculateEnd"
            @change="handleAutoCalculateChange"
          >
            自动推算结束时间
          </el-checkbox>
        </el-form-item>

        <el-form-item v-if="autoCalculateEnd" label="查询长度">
          <el-select
            v-model="queryLength"
            placeholder="选择年数"
            style="width: 150px"
            @change="handleQueryLengthChange"
          >
            <el-option
              v-for="length in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
              :key="length"
              :label="`${length}年`"
              :value="length"
            />
          </el-select>
        </el-form-item>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { QuarterTime } from '@/types/performance-report';
import { calculateEndQuarter } from '@/utils/quarter-calculator';
import YearRangeSelector from './YearRangeSelector.vue';

interface Props {
  /** 模式：year（年份段）或 quarter（季度） */
  mode?: 'year' | 'quarter';
  /** 开始年份 */
  startYear?: number;
  /** 结束年份 */
  endYear?: number;
  /** 开始季度 */
  startQuarter?: QuarterTime;
  /** 结束季度 */
  endQuarter?: QuarterTime;
  /** 查询长度（年数） */
  queryLength?: number;
}

interface Emits {
  (e: 'update:mode', value: 'year' | 'quarter'): void;
  (e: 'update:startYear', value: number | undefined): void;
  (e: 'update:endYear', value: number | undefined): void;
  (e: 'update:startQuarter', value: QuarterTime | undefined): void;
  (e: 'update:endQuarter', value: QuarterTime | undefined): void;
  (e: 'update:queryLength', value: number | undefined): void;
  (e: 'change'): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'year',
  startYear: undefined,
  endYear: undefined,
  startQuarter: undefined,
  endQuarter: undefined,
  queryLength: 1,
});

const emit = defineEmits<Emits>();

/** 当前模式 */
const mode = ref<'year' | 'quarter'>(props.mode || 'year');

/** 年份范围 */
const yearRange = ref({
  start: props.startYear,
  end: props.endYear,
});

/** 季度范围 */
const quarterRange = ref<{
  start: QuarterTime;
  end: QuarterTime;
}>({
  start: props.startQuarter || { year: new Date().getFullYear(), quarter: 1 },
  end: props.endQuarter || { year: new Date().getFullYear(), quarter: 1 },
});

/** 是否自动计算结束时间 */
const autoCalculateEnd = ref(true);

/** 查询长度 */
const queryLength = ref(props.queryLength || 1);

/** 年份选项（2015-2030） */
const yearOptions = computed(() => {
  const years: number[] = [];
  for (let year = 2030; year >= 2015; year--) {
    years.push(year);
  }
  return years;
});

/** 处理模式变化 */
function handleModeChange() {
  emit('update:mode', mode.value);
  emit('change');
}

/** 处理年份范围变化 */
function handleYearRangeChange(start: number | undefined, end: number | undefined) {
  yearRange.value.start = start;
  yearRange.value.end = end;
  emit('update:startYear', start);
  emit('update:endYear', end);
  emit('change');
}

/** 处理季度变化 */
function handleQuarterChange() {
  emit('update:startQuarter', quarterRange.value.start);
  if (!autoCalculateEnd.value) {
    emit('update:endQuarter', quarterRange.value.end);
  } else {
    // 自动计算结束时间
    try {
      const endQuarter = calculateEndQuarter(quarterRange.value.start, queryLength.value);
      quarterRange.value.end = endQuarter;
      emit('update:endQuarter', endQuarter);
    } catch (error) {
      // 计算失败，使用默认值
      const err = error instanceof Error ? error : new Error(String(error));
      // 可以在这里添加 Sentry 错误上报
    }
  }
  emit('change');
}

/** 处理查询长度变化 */
function handleQueryLengthChange() {
  emit('update:queryLength', queryLength.value);
  if (autoCalculateEnd.value) {
    // 重新计算结束时间
    try {
      const endQuarter = calculateEndQuarter(quarterRange.value.start, queryLength.value);
      quarterRange.value.end = endQuarter;
      emit('update:endQuarter', endQuarter);
    } catch (error) {
      // 计算失败，使用默认值
      const err = error instanceof Error ? error : new Error(String(error));
      // 可以在这里添加 Sentry 错误上报
    }
  }
  emit('change');
}

/** 处理自动计算变化 */
function handleAutoCalculateChange() {
  if (autoCalculateEnd.value) {
    // 启用自动计算，重新计算结束时间
    try {
      const endQuarter = calculateEndQuarter(quarterRange.value.start, queryLength.value);
      quarterRange.value.end = endQuarter;
      emit('update:endQuarter', endQuarter);
    } catch (error) {
      // 计算失败，使用默认值
      const err = error instanceof Error ? error : new Error(String(error));
      // 可以在这里添加 Sentry 错误上报
    }
  }
  emit('change');
}

// 监听 props 变化
watch(
  () => props.mode,
  (value) => {
    if (value) {
      mode.value = value;
    }
  },
);

watch(
  () => props.startYear,
  (value) => {
    yearRange.value.start = value;
  },
);

watch(
  () => props.endYear,
  (value) => {
    yearRange.value.end = value;
  },
);

watch(
  () => props.startQuarter,
  (value) => {
    if (value) {
      quarterRange.value.start = value;
    }
  },
);

watch(
  () => props.endQuarter,
  (value) => {
    if (value) {
      quarterRange.value.end = value;
    }
  },
);
</script>

<style scoped>
.time-range-selector {
  width: 100%;
}

.quarter-selector {
  margin-top: 16px;
}

.quarter-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
