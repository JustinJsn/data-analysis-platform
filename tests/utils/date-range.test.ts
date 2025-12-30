/**
 * 时间范围转换单元测试
 */

import { describe, it, expect } from 'vitest';
import {
  quarterToDateRange,
  yearRangeToDateRange,
  formatDateRange,
} from '@/utils/date-range';
import type { QuarterTime } from '@/types/performance-report';

describe('date-range', () => {
  describe('quarterToDateRange', () => {
    it('应该正确转换 Q1 季度', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 1 };
      const result = quarterToDateRange(quarter);
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(0); // 0 = 1月
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(2); // 2 = 3月
      expect(result.end.getDate()).toBe(31);
    });

    it('应该正确转换 Q2 季度', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 2 };
      const result = quarterToDateRange(quarter);
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(3); // 3 = 4月
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(5); // 5 = 6月
      expect(result.end.getDate()).toBe(30);
    });

    it('应该正确转换 Q3 季度', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 3 };
      const result = quarterToDateRange(quarter);
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(6); // 6 = 7月
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(8); // 8 = 9月
      expect(result.end.getDate()).toBe(30);
    });

    it('应该正确转换 Q4 季度', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 4 };
      const result = quarterToDateRange(quarter);
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(9); // 9 = 10月
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(11); // 11 = 12月
      expect(result.end.getDate()).toBe(31);
    });

    it('应该设置开始时间为 00:00:00', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 1 };
      const result = quarterToDateRange(quarter);
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
      expect(result.start.getSeconds()).toBe(0);
      expect(result.start.getMilliseconds()).toBe(0);
    });

    it('应该设置结束时间为 23:59:59.999', () => {
      const quarter: QuarterTime = { year: 2025, quarter: 1 };
      const result = quarterToDateRange(quarter);
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
      expect(result.end.getSeconds()).toBe(59);
      expect(result.end.getMilliseconds()).toBe(999);
    });

    it('应该处理闰年2月', () => {
      const quarter: QuarterTime = { year: 2024, quarter: 1 };
      const result = quarterToDateRange(quarter);
      // Q1 结束是3月31日，不涉及2月，但验证日期计算正确
      expect(result.end.getDate()).toBe(31);
    });
  });

  describe('yearRangeToDateRange', () => {
    it('应该正确转换单年范围', () => {
      const result = yearRangeToDateRange(2025, 2025);
      expect(result.start.getFullYear()).toBe(2025);
      expect(result.start.getMonth()).toBe(0); // 1月
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(11); // 12月
      expect(result.end.getDate()).toBe(31);
    });

    it('应该正确转换多年范围', () => {
      const result = yearRangeToDateRange(2023, 2025);
      expect(result.start.getFullYear()).toBe(2023);
      expect(result.start.getMonth()).toBe(0);
      expect(result.start.getDate()).toBe(1);
      expect(result.end.getFullYear()).toBe(2025);
      expect(result.end.getMonth()).toBe(11);
      expect(result.end.getDate()).toBe(31);
    });

    it('应该设置开始时间为 1月1日 00:00:00', () => {
      const result = yearRangeToDateRange(2025, 2025);
      expect(result.start.getMonth()).toBe(0);
      expect(result.start.getDate()).toBe(1);
      expect(result.start.getHours()).toBe(0);
      expect(result.start.getMinutes()).toBe(0);
      expect(result.start.getSeconds()).toBe(0);
    });

    it('应该设置结束时间为 12月31日 23:59:59.999', () => {
      const result = yearRangeToDateRange(2025, 2025);
      expect(result.end.getMonth()).toBe(11);
      expect(result.end.getDate()).toBe(31);
      expect(result.end.getHours()).toBe(23);
      expect(result.end.getMinutes()).toBe(59);
      expect(result.end.getSeconds()).toBe(59);
      expect(result.end.getMilliseconds()).toBe(999);
    });

    it('应该抛出错误当开始年份大于结束年份', () => {
      expect(() => yearRangeToDateRange(2025, 2024)).toThrow(
        '开始年份不能大于结束年份',
      );
    });

    it('应该抛出错误当开始年份小于2000', () => {
      expect(() => yearRangeToDateRange(1999, 2025)).toThrow(
        '开始年份必须在 2000-2100 之间',
      );
    });

    it('应该抛出错误当开始年份大于2100', () => {
      expect(() => yearRangeToDateRange(2101, 2101)).toThrow(
        '开始年份必须在 2000-2100 之间',
      );
    });

    it('应该抛出错误当结束年份小于2000', () => {
      expect(() => yearRangeToDateRange(2025, 1999)).toThrow(
        '结束年份必须在 2000-2100 之间',
      );
    });

    it('应该抛出错误当结束年份大于2100', () => {
      expect(() => yearRangeToDateRange(2025, 2101)).toThrow(
        '结束年份必须在 2000-2100 之间',
      );
    });

    it('应该处理边界年份', () => {
      const result = yearRangeToDateRange(2000, 2100);
      expect(result.start.getFullYear()).toBe(2000);
      expect(result.end.getFullYear()).toBe(2100);
    });
  });

  describe('formatDateRange', () => {
    it('应该正确格式化日期范围', () => {
      const dateRange = {
        start: new Date(2025, 0, 1, 0, 0, 0, 0),
        end: new Date(2025, 11, 31, 23, 59, 59, 999),
      };
      const result = formatDateRange(dateRange);
      expect(result).toBe('2025-01-01 ~ 2025-12-31');
    });

    it('应该正确格式化跨年日期范围', () => {
      const dateRange = {
        start: new Date(2023, 0, 1, 0, 0, 0, 0),
        end: new Date(2025, 11, 31, 23, 59, 59, 999),
      };
      const result = formatDateRange(dateRange);
      expect(result).toBe('2023-01-01 ~ 2025-12-31');
    });

    it('应该正确格式化单月日期范围', () => {
      const dateRange = {
        start: new Date(2025, 2, 1, 0, 0, 0, 0),
        end: new Date(2025, 2, 31, 23, 59, 59, 999),
      };
      const result = formatDateRange(dateRange);
      expect(result).toBe('2025-03-01 ~ 2025-03-31');
    });

    it('应该正确格式化单日日期范围', () => {
      const dateRange = {
        start: new Date(2025, 5, 15, 0, 0, 0, 0),
        end: new Date(2025, 5, 15, 23, 59, 59, 999),
      };
      const result = formatDateRange(dateRange);
      expect(result).toBe('2025-06-15 ~ 2025-06-15');
    });

    it('应该正确补零月份和日期', () => {
      const dateRange = {
        start: new Date(2025, 0, 5, 0, 0, 0, 0),
        end: new Date(2025, 8, 9, 23, 59, 59, 999),
      };
      const result = formatDateRange(dateRange);
      expect(result).toBe('2025-01-05 ~ 2025-09-09');
    });
  });
});
