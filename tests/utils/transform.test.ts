/**
 * 数据转换函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatDateTime,
  getSyncTypeLabel,
  getSyncStatusLabel,
} from '@/utils/transform';

describe('transform utils', () => {
  describe('formatDateTime', () => {
    it('应该正确格式化日期时间', () => {
      const date = '2024-01-15T10:30:45';
      const result = formatDateTime(date);
      expect(result).toContain('2024');
      expect(result).toContain('01');
      expect(result).toContain('15');
    });

    it('应该处理 null 值', () => {
      expect(formatDateTime(null)).toBe('-');
    });

    it('应该处理 undefined 值', () => {
      expect(formatDateTime(undefined)).toBe('-');
    });

    it('应该处理空字符串', () => {
      expect(formatDateTime('')).toBe('-');
    });

    it('应该处理无效日期', () => {
      const result = formatDateTime('invalid-date');
      expect(result).toBe('invalid-date');
    });
  });

  describe('getSyncTypeLabel', () => {
    it('应该返回员工标签', () => {
      expect(getSyncTypeLabel('employee')).toBe('员工');
    });

    it('应该返回组织标签', () => {
      expect(getSyncTypeLabel('organization')).toBe('组织');
    });

    it('应该返回职务标签', () => {
      expect(getSyncTypeLabel('jobpost')).toBe('职务');
    });

    it('应该处理未知类型', () => {
      expect(getSyncTypeLabel('unknown' as any)).toBe('unknown');
    });
  });

  describe('getSyncStatusLabel', () => {
    it('应该返回运行中标签', () => {
      expect(getSyncStatusLabel('running')).toBe('运行中');
    });

    it('应该返回成功标签', () => {
      expect(getSyncStatusLabel('success')).toBe('成功');
    });

    it('应该返回部分成功标签', () => {
      expect(getSyncStatusLabel('partial_success')).toBe('部分成功');
    });

    it('应该返回失败标签', () => {
      expect(getSyncStatusLabel('failed')).toBe('失败');
    });

    it('应该处理未知状态', () => {
      expect(getSyncStatusLabel('unknown' as any)).toBe('unknown');
    });
  });
});
