/**
 * 季度推算算法单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  calculateEndQuarter,
  quarterToString,
  stringToQuarter,
  isValidQuarter,
  getCurrentQuarter,
  getConsecutiveQuarters,
} from '@/utils/quarter-calculator';
import type { QuarterTime } from '@/types/performance-report';

describe('quarter-calculator', () => {
  describe('calculateEndQuarter', () => {
    it('应该正确计算结束季度（1年）', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 3 };
      const queryLength = 1;
      const result = calculateEndQuarter(startQuarter, queryLength);
      expect(result).toEqual({ year: 2025, quarter: 3 });
    });

    it('应该正确计算结束季度（3年）', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 3 };
      const queryLength = 3;
      const result = calculateEndQuarter(startQuarter, queryLength);
      expect(result).toEqual({ year: 2023, quarter: 3 });
    });

    it('应该正确计算结束季度（10年）', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 1 };
      const queryLength = 10;
      const result = calculateEndQuarter(startQuarter, queryLength);
      expect(result).toEqual({ year: 2016, quarter: 1 });
    });

    it('应该处理跨年边界情况', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 1 };
      const queryLength = 2;
      const result = calculateEndQuarter(startQuarter, queryLength);
      expect(result).toEqual({ year: 2024, quarter: 1 });
    });

    it('应该处理所有季度（Q1-Q4）', () => {
      const quarters: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
      quarters.forEach((quarter) => {
        const startQuarter: QuarterTime = { year: 2025, quarter };
        const result = calculateEndQuarter(startQuarter, 2);
        expect(result.quarter).toBe(quarter);
        expect(result.year).toBe(2024);
      });
    });

    it('应该抛出错误当查询长度小于1', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 1 };
      expect(() => calculateEndQuarter(startQuarter, 0)).toThrow(
        '查询长度必须在 1-10 年之间',
      );
    });

    it('应该抛出错误当查询长度大于10', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 1 };
      expect(() => calculateEndQuarter(startQuarter, 11)).toThrow(
        '查询长度必须在 1-10 年之间',
      );
    });

    it('应该抛出错误当季度无效（小于1）', () => {
      const startQuarter = { year: 2025, quarter: 0 } as QuarterTime;
      expect(() => calculateEndQuarter(startQuarter, 1)).toThrow(
        '季度必须在 1-4 之间',
      );
    });

    it('应该抛出错误当季度无效（大于4）', () => {
      const startQuarter = { year: 2025, quarter: 5 } as QuarterTime;
      expect(() => calculateEndQuarter(startQuarter, 1)).toThrow(
        '季度必须在 1-4 之间',
      );
    });

    it('应该抛出错误当年份超出范围（小于2000）', () => {
      const startQuarter: QuarterTime = { year: 1999, quarter: 1 };
      expect(() => calculateEndQuarter(startQuarter, 1)).toThrow(
        '计算出的结束年份超出合理范围（2000-2100）',
      );
    });

    it('应该处理边界情况：结束年份等于开始年份', () => {
      const startQuarter: QuarterTime = { year: 2025, quarter: 2 };
      const result = calculateEndQuarter(startQuarter, 1);
      expect(result.year).toBe(2025);
      expect(result.quarter).toBe(2);
    });
  });

  describe('quarterToString', () => {
    it('应该正确转换季度为字符串', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 1 };
      expect(quarterToString(quarter)).toBe('2025-Q1');
    });

    it('应该处理所有季度', () => {
      expect(quarterToString({ year: 2025, quarter: 1 })).toBe('2025-Q1');
      expect(quarterToString({ year: 2025, quarter: 2 })).toBe('2025-Q2');
      expect(quarterToString({ year: 2025, quarter: 3 })).toBe('2025-Q3');
      expect(quarterToString({ year: 2025, quarter: 4 })).toBe('2025-Q4');
    });
  });

  describe('stringToQuarter', () => {
    it('应该正确解析有效字符串', () => {
      expect(stringToQuarter('2025-Q1')).toEqual({ year: 2025, quarter: 1 });
      expect(stringToQuarter('2025-Q2')).toEqual({ year: 2025, quarter: 2 });
      expect(stringToQuarter('2025-Q3')).toEqual({ year: 2025, quarter: 3 });
      expect(stringToQuarter('2025-Q4')).toEqual({ year: 2025, quarter: 4 });
    });

    it('应该返回 null 当格式不正确', () => {
      expect(stringToQuarter('2025-Q5')).toBeNull();
      expect(stringToQuarter('2025-Q0')).toBeNull();
      expect(stringToQuarter('2025Q1')).toBeNull();
      expect(stringToQuarter('2025-1')).toBeNull();
      expect(stringToQuarter('invalid')).toBeNull();
      expect(stringToQuarter('')).toBeNull();
    });

    it('应该返回 null 当年份超出范围', () => {
      expect(stringToQuarter('1999-Q1')).toBeNull();
      expect(stringToQuarter('2101-Q1')).toBeNull();
    });

    it('应该处理边界年份', () => {
      expect(stringToQuarter('2000-Q1')).toEqual({ year: 2000, quarter: 1 });
      expect(stringToQuarter('2100-Q4')).toEqual({ year: 2100, quarter: 4 });
    });
  });

  describe('isValidQuarter', () => {
    it('应该验证有效季度', () => {
      expect(isValidQuarter({ year: 2025, quarter: 1 })).toBe(true);
      expect(isValidQuarter({ year: 2025, quarter: 4 })).toBe(true);
      expect(isValidQuarter({ year: 2000, quarter: 1 })).toBe(true);
      expect(isValidQuarter({ year: 2100, quarter: 4 })).toBe(true);
    });

    it('应该拒绝无效年份', () => {
      expect(isValidQuarter({ year: 1999, quarter: 1 })).toBe(false);
      expect(isValidQuarter({ year: 2101, quarter: 1 })).toBe(false);
    });

    it('应该拒绝无效季度', () => {
      expect(isValidQuarter({ year: 2025, quarter: 0 } as QuarterTime)).toBe(
        false,
      );
      expect(isValidQuarter({ year: 2025, quarter: 5 } as QuarterTime)).toBe(
        false,
      );
    });

    it('应该拒绝非整数年份', () => {
      expect(isValidQuarter({ year: 2025.5, quarter: 1 } as QuarterTime)).toBe(
        false,
      );
    });

    it('应该拒绝非整数季度', () => {
      expect(isValidQuarter({ year: 2025, quarter: 1.5 } as QuarterTime)).toBe(
        false,
      );
    });
  });

  describe('getCurrentQuarter', () => {
    it('应该返回当前季度', () => {
      const result = getCurrentQuarter();
      expect(result.year).toBeGreaterThanOrEqual(2020);
      expect(result.year).toBeLessThanOrEqual(2100);
      expect([1, 2, 3, 4]).toContain(result.quarter);
    });

    it('应该返回有效的季度时间', () => {
      const result = getCurrentQuarter();
      expect(isValidQuarter(result)).toBe(true);
    });
  });

  describe('getConsecutiveQuarters', () => {
    it('应该返回连续的季度列表', () => {
      const endQuarter: QuarterTime = { year: 2025, quarter: 2 };
      const result = getConsecutiveQuarters(endQuarter, 4);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ year: 2025, quarter: 2 });
      expect(result[1]).toEqual({ year: 2025, quarter: 1 });
      expect(result[2]).toEqual({ year: 2024, quarter: 4 });
      expect(result[3]).toEqual({ year: 2024, quarter: 3 });
    });

    it('应该处理跨年情况', () => {
      const endQuarter: QuarterTime = { year: 2025, quarter: 1 };
      const result = getConsecutiveQuarters(endQuarter, 4);
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({ year: 2025, quarter: 1 });
      expect(result[1]).toEqual({ year: 2024, quarter: 4 });
      expect(result[2]).toEqual({ year: 2024, quarter: 3 });
      expect(result[3]).toEqual({ year: 2024, quarter: 2 });
    });

    it('应该处理单季度', () => {
      const endQuarter: QuarterTime = { year: 2025, quarter: 3 };
      const result = getConsecutiveQuarters(endQuarter, 1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ year: 2025, quarter: 3 });
    });

    it('应该处理多年季度', () => {
      const endQuarter: QuarterTime = { year: 2025, quarter: 4 };
      const result = getConsecutiveQuarters(endQuarter, 8);
      expect(result).toHaveLength(8);
      expect(result[0]).toEqual({ year: 2025, quarter: 4 });
      expect(result[7]).toEqual({ year: 2023, quarter: 4 });
    });

    it('应该返回降序列表', () => {
      const endQuarter: QuarterTime = { year: 2025, quarter: 2 };
      const result = getConsecutiveQuarters(endQuarter, 3);
      // 验证是降序（从结束季度开始往前）
      for (let i = 0; i < result.length - 1; i++) {
        const current = result[i]!;
        const next = result[i + 1]!;
        // 当前季度应该比下一个季度更晚
        const currentValue = current.year * 10 + current.quarter;
        const nextValue = next.year * 10 + next.quarter;
        expect(currentValue).toBeGreaterThan(nextValue);
      }
    });
  });
});
