/**
 * 数据转换函数测试
 */

import { describe, it, expect } from 'vitest';
import {
  formatDateTime,
  getSyncTypeLabel,
  getStatusLabel,
  transformPerformanceReport,
  transformPerformanceQueryParams,
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
      expect(result).toBe('-');
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

    it('应该返回北森绩效标签', () => {
      expect(getSyncTypeLabel('performance_report')).toBe('北森绩效');
    });

    it('应该处理未知类型', () => {
      expect(getSyncTypeLabel('unknown' as any)).toBe('unknown');
    });

    it('应该处理 null/undefined 返回未知', () => {
      expect(getSyncTypeLabel(null as any)).toBe('未知');
      expect(getSyncTypeLabel(undefined)).toBe('未知');
    });
  });

  describe('getStatusLabel', () => {
    it('应该返回运行中标签', () => {
      expect(getStatusLabel('running')).toBe('运行中');
    });

    it('应该返回成功标签', () => {
      expect(getStatusLabel('success')).toBe('成功');
    });

    it('应该返回部分成功标签', () => {
      expect(getStatusLabel('partial_success')).toBe('部分成功');
    });

    it('应该返回失败标签', () => {
      expect(getStatusLabel('failed')).toBe('失败');
    });

    it('应该处理未知状态', () => {
      expect(getStatusLabel('unknown' as any)).toBe('unknown');
    });
  });

  describe('transformPerformanceReport', () => {
    it('应该正确转换绩效数据', () => {
      const input = {
        id: '1',
        batch_id: 'batch1',
        external_system_id: 'sys1',
        year: 2024,
        quarter: 'Q1',
        employee_name: '张三',
        employee_user_id: 'user1',
        organization_full_name: '技术部',
        organization_path_ids: '1/2',
        performance_rating: 'A',
        last_synced_at: '2024-01-01T00:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      const result = transformPerformanceReport(input);

      expect(result).toEqual(input);
    });
  });

  describe('transformPerformanceQueryParams', () => {
    it('应该正确转换查询参数', () => {
      const input = {
        pageNum: 1,
        pageSize: 10,
        year: 2024,
        quarter: 'Q1',
        employee_name: '张三',
        employee_user_id: 'user1',
        organization_path_ids: '1/2',
        performance_rating: 'A',
      };

      const result = transformPerformanceQueryParams(input);

      expect(result).toEqual({
        page: 1,
        page_size: 10,
        year: 2024,
        quarter: 'Q1',
        employee_name: '张三',
        employee_user_id: 'user1',
        organization_path_ids: '1/2',
        performance_rating: 'A',
      });
    });

    it('应该只转换存在的参数', () => {
      const input = {
        pageNum: 1,
        pageSize: 10,
      };

      const result = transformPerformanceQueryParams(input);

      expect(result).toEqual({
        page: 1,
        page_size: 10,
      });
    });

    it('应该处理空对象', () => {
      const result = transformPerformanceQueryParams({});
      expect(result).toEqual({});
    });
  });
});
