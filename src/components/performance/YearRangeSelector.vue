<template>
  <div class="year-range-selector">
    <el-form-item label="年份范围">
      <div class="year-range-inputs">
        <el-select
          v-model="startYear"
          placeholder="开始年份"
          style="width: 150px"
          @change="handleYearChange"
        >
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="year"
            :value="year"
          />
        </el-select>
        <span class="range-separator">至</span>
        <el-select
          v-model="endYear"
          placeholder="结束年份"
          style="width: 150px"
          @change="handleYearChange"
        >
          <el-option
            v-for="year in yearOptions"
            :key="year"
            :label="year"
            :value="year"
          />
        </el-select>
      </div>
    </el-form-item>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
  /** 开始年份 */
  startYear?: number;
  /** 结束年份 */
  endYear?: number;
}

interface Emits {
  (e: 'update:startYear', value: number | undefined): void;
  (e: 'update:endYear', value: number | undefined): void;
  (e: 'change', startYear: number | undefined, endYear: number | undefined): void;
}

const props = withDefaults(defineProps<Props>(), {
  startYear: undefined,
  endYear: undefined,
});

const emit = defineEmits<Emits>();

/** 当前开始年份 */
const startYear = ref<number | undefined>(props.startYear);

/** 当前结束年份 */
const endYear = ref<number | undefined>(props.endYear);

/** 年份选项（2015-2030） */
const yearOptions = computed(() => {
  const years: number[] = [];
  for (let year = 2030; year >= 2015; year--) {
    years.push(year);
  }
  return years;
});

/** 处理年份变化 */
function handleYearChange() {
  emit('update:startYear', startYear.value);
  emit('update:endYear', endYear.value);
  emit('change', startYear.value, endYear.value);
}

/** 监听 props 变化 */
watch(
  () => props.startYear,
  (value) => {
    startYear.value = value;
  },
);

watch(
  () => props.endYear,
  (value) => {
    endYear.value = value;
  },
);
</script>

<style scoped>
.year-range-selector {
  width: 100%;
}

.year-range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-separator {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
