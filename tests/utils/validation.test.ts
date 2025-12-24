/**
 * 表单验证规则测试
 */

import { describe, it, expect } from 'vitest';
import {
  usernameRules,
  passwordRules,
  emailRules,
  phoneRules,
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
});
