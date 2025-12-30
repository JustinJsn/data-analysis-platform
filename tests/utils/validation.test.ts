/**
 * 表单验证规则测试
 */

import { describe, it, expect } from 'vitest';
import {
  usernameRules,
  passwordRules,
  emailRules,
  phoneRules,
  validatePerformanceReportQueryParams,
  yearRules,
  quarterRules,
  queryLengthRules,
} from '@/utils/validation';

describe('validation rules', () => {
  describe('usernameRules', () => {
    it('应该要求用户名不为空', () => {
      const rule = usernameRules[0];
      expect(rule.required).toBe(true);
      expect(rule.message).toContain('用户名');
    });

    it('应该验证用户名长度', () => {
      const rule = usernameRules[1];
      if ('validator' in rule && rule.validator) {
        const callback = (error?: Error) => {
          if (error) throw error;
        };

        // 测试短用户名
        expect(() => {
          rule.validator({}, 'ab', callback);
        }).toThrow();

        // 测试长用户名
        expect(() => {
          rule.validator({}, 'a'.repeat(51), callback);
        }).toThrow();

        // 测试有效用户名
        expect(() => {
          rule.validator({}, 'admin', callback);
        }).not.toThrow();
      }
    });
  });

  describe('passwordRules', () => {
    it('应该要求密码不为空', () => {
      const rule = passwordRules[0];
      expect(rule.required).toBe(true);
      expect(rule.message).toContain('密码');
    });

    it('应该验证密码长度', () => {
      const rule = passwordRules[1];
      if ('validator' in rule && rule.validator) {
        const callback = (error?: Error) => {
          if (error) throw error;
        };

        // 测试短密码
        expect(() => {
          rule.validator({}, '12345', callback);
        }).toThrow();

        // 测试有效密码
        expect(() => {
          rule.validator({}, 'admin123', callback);
        }).not.toThrow();
      }
    });
  });

  describe('emailRules', () => {
    it('应该验证邮箱格式', () => {
      const rule = emailRules.find((r) => 'type' in r && r.type === 'email');
      expect(rule).toBeDefined();
      expect(rule?.message).toContain('邮箱');
    });
  });

  describe('phoneRules', () => {
    it('应该验证手机号格式', () => {
      const rule = phoneRules.find((r) => 'pattern' in r);
      expect(rule).toBeDefined();
      if (rule && 'pattern' in rule) {
        expect(rule.pattern).toBeInstanceOf(RegExp);
      }
    });
  });

  describe('validatePerformanceReportQueryParams', () => {
    it('应该通过有效的查询参数', () => {
      const params = {
        start_year: 2025,
        end_year: 2025,
        pageNum: 1,
        pageSize: 10,
      };
      const errors = validatePerformanceReportQueryParams(params);
      expect(errors).toHaveLength(0);
    });

    it('应该验证开始年份范围', () => {
      const params1 = { start_year: 2014 };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '开始年份必须在 2015-2030 之间',
      );

      const params2 = { start_year: 2031 };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '开始年份必须在 2015-2030 之间',
      );

      const params3 = { start_year: 2025.5 };
      expect(validatePerformanceReportQueryParams(params3)).toContain(
        '开始年份必须在 2015-2030 之间',
      );
    });

    it('应该验证结束年份范围', () => {
      const params1 = { end_year: 2014 };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '结束年份必须在 2015-2030 之间',
      );

      const params2 = { end_year: 2031 };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '结束年份必须在 2015-2030 之间',
      );
    });

    it('应该验证结束年份不能早于开始年份', () => {
      const params = { start_year: 2025, end_year: 2024 };
      expect(validatePerformanceReportQueryParams(params)).toContain(
        '结束年份不能早于开始年份',
      );
    });

    it('应该验证季度格式', () => {
      const params1 = { start_year_quarter: '2025-Q5' };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '开始季度格式错误，应为 "YYYY-Q[1-4]"',
      );

      const params2 = { start_year_quarter: '2025Q1' };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '开始季度格式错误，应为 "YYYY-Q[1-4]"',
      );

      const params3 = { start_year_quarter: '2025-Q1' };
      expect(validatePerformanceReportQueryParams(params3)).toHaveLength(0);
    });

    it('应该验证查询长度范围', () => {
      const params1 = { query_length: 0 };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '查询长度必须在 1-10 年之间',
      );

      const params2 = { query_length: 11 };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '查询长度必须在 1-10 年之间',
      );

      const params3 = { query_length: 5.5 };
      expect(validatePerformanceReportQueryParams(params3)).toContain(
        '查询长度必须在 1-10 年之间',
      );

      const params4 = { query_length: 5 };
      expect(validatePerformanceReportQueryParams(params4)).toHaveLength(0);
    });

    it('应该验证人员ID数组', () => {
      const params1 = { user_ids: 'not-array' as any };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '人员ID必须是数组',
      );

      const params2 = { user_ids: Array(101).fill('user1') };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '人员ID数量不能超过 100 个',
      );

      const params3 = { user_ids: ['user1', 'user2'] };
      expect(validatePerformanceReportQueryParams(params3)).toHaveLength(0);
    });

    it('应该验证分页参数', () => {
      const params1 = { pageNum: 0 };
      expect(validatePerformanceReportQueryParams(params1)).toContain(
        '页码必须大于 0',
      );

      const params2 = { pageNum: 1.5 };
      expect(validatePerformanceReportQueryParams(params2)).toContain(
        '页码必须大于 0',
      );

      const params3 = { pageSize: 15 };
      expect(validatePerformanceReportQueryParams(params3)).toContain(
        '每页条数必须是 10, 20, 50, 100 之一',
      );

      const params4 = { pageSize: 20 };
      expect(validatePerformanceReportQueryParams(params4)).toHaveLength(0);
    });

    it('应该处理空参数', () => {
      const errors = validatePerformanceReportQueryParams({});
      expect(errors).toHaveLength(0);
    });

    it('应该处理多个错误', () => {
      const params = {
        start_year: 2014,
        end_year: 2031,
        query_length: 0,
        pageNum: 0,
      };
      const errors = validatePerformanceReportQueryParams(params);
      expect(errors.length).toBeGreaterThan(1);
    });
  });

  describe('yearRules', () => {
    it('应该要求年份不为空', () => {
      const rule = yearRules[0];
      expect(rule.required).toBe(true);
      expect(rule.message).toContain('年份');
    });

    it('应该验证年份范围', () => {
      const rule = yearRules[1];
      if ('validator' in rule && rule.validator) {
        const callback = (error?: Error) => {
          if (error) throw error;
        };

        expect(() => {
          rule.validator({}, 2014, callback);
        }).toThrow();

        expect(() => {
          rule.validator({}, 2031, callback);
        }).toThrow();

        expect(() => {
          rule.validator({}, 2025, callback);
        }).not.toThrow();
      }
    });
  });

  describe('quarterRules', () => {
    it('应该要求季度不为空', () => {
      const rule = quarterRules[0];
      expect(rule.required).toBe(true);
      expect(rule.message).toContain('季度');
    });

    it('应该验证季度格式', () => {
      const rule = quarterRules[1];
      if ('pattern' in rule) {
        expect(rule.pattern).toBeInstanceOf(RegExp);
        expect(rule.message).toContain('季度格式');
      }
    });
  });

  describe('queryLengthRules', () => {
    it('应该要求查询长度不为空', () => {
      const rule = queryLengthRules[0];
      expect(rule.required).toBe(true);
      expect(rule.message).toContain('查询长度');
    });

    it('应该验证查询长度范围', () => {
      const rule = queryLengthRules[1];
      if ('validator' in rule && rule.validator) {
        const callback = (error?: Error) => {
          if (error) throw error;
        };

        expect(() => {
          rule.validator({}, 0, callback);
        }).toThrow();

        expect(() => {
          rule.validator({}, 11, callback);
        }).toThrow();

        expect(() => {
          rule.validator({}, 5, callback);
        }).not.toThrow();
      }
    });
  });
});
