/**
 * 表单验证工具
 */
import type { FormItemRule } from 'element-plus';

/**
 * 用户名验证规则
 */
export const usernameRules: FormItemRule[] = [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  {
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '只允许字母、数字和下划线',
    trigger: 'blur',
  },
];

/**
 * 密码验证规则
 */
export const passwordRules: FormItemRule[] = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' },
];

/**
 * 邮箱验证规则
 */
export const emailRules: FormItemRule[] = [
  { required: true, message: '请输入邮箱', trigger: 'blur' },
  { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
];

/**
 * 手机号验证规则
 */
export const phoneRules: FormItemRule[] = [
  { required: true, message: '请输入手机号', trigger: 'blur' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
];

/**
 * 关键词验证规则
 */
export const keywordRules: FormItemRule[] = [
  { max: 50, message: '关键词长度不能超过 50 个字符', trigger: 'blur' },
];

/**
 * 页码验证
 */
export function validatePageNum(value: number): boolean {
  return Number.isInteger(value) && value >= 1;
}

/**
 * 每页数量验证
 */
export function validatePageSize(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 100;
}

/**
 * 必填验证
 */
export function requiredRule(message: string): FormItemRule {
  return { required: true, message, trigger: 'blur' };
}

/**
 * 长度验证
 */
export function lengthRule(
  min: number,
  max: number,
  message?: string,
): FormItemRule {
  return {
    min,
    max,
    message: message || `长度在 ${min} 到 ${max} 个字符`,
    trigger: 'blur',
  };
}

/**
 * 正则验证
 */
export function patternRule(pattern: RegExp, message: string): FormItemRule {
  return { pattern, message, trigger: 'blur' };
}

/* ==================== 绩效报表查询参数验证 ==================== */

import type { PerformanceReportQueryParams } from '@/types/performance-report';

/**
 * 验证查询参数
 *
 * @param params 查询参数
 * @returns 错误消息数组，如果验证通过则返回空数组
 */
export function validatePerformanceReportQueryParams(
  params: PerformanceReportQueryParams,
): string[] {
  const errors: string[] = [];

  // 年份验证
  if (params.start_year !== undefined) {
    if (
      !Number.isInteger(params.start_year) ||
      params.start_year < 2015 ||
      params.start_year > 2030
    ) {
      errors.push('开始年份必须在 2015-2030 之间');
    }
  }

  if (params.end_year !== undefined) {
    if (
      !Number.isInteger(params.end_year) ||
      params.end_year < 2015 ||
      params.end_year > 2030
    ) {
      errors.push('结束年份必须在 2015-2030 之间');
    }
  }

  if (params.start_year !== undefined && params.end_year !== undefined) {
    if (params.end_year < params.start_year) {
      errors.push('结束年份不能早于开始年份');
    }
  }

  // 季度验证
  if (params.start_year_quarter) {
    if (!/^\d{4}-Q[1-4]$/.test(params.start_year_quarter)) {
      errors.push('开始季度格式错误，应为 "YYYY-Q[1-4]"');
    }
  }

  if (params.end_year_quarter) {
    if (!/^\d{4}-Q[1-4]$/.test(params.end_year_quarter)) {
      errors.push('结束季度格式错误，应为 "YYYY-Q[1-4]"');
    }
  }

  // 查询长度验证
  if (params.query_length !== undefined) {
    if (
      !Number.isInteger(params.query_length) ||
      params.query_length < 1 ||
      params.query_length > 10
    ) {
      errors.push('查询长度必须在 1-10 年之间');
    }
  }

  // 人员ID验证
  if (params.user_ids !== undefined) {
    if (!Array.isArray(params.user_ids)) {
      errors.push('人员ID必须是数组');
    } else if (params.user_ids.length > 100) {
      errors.push('人员ID数量不能超过 100 个');
    }
  }

  // 分页验证
  if (params.pageNum !== undefined) {
    if (!Number.isInteger(params.pageNum) || params.pageNum < 1) {
      errors.push('页码必须大于 0');
    }
  }

  if (params.pageSize !== undefined) {
    const validSizes = [10, 20, 50, 100];
    if (!validSizes.includes(params.pageSize)) {
      errors.push('每页条数必须是 10, 20, 50, 100 之一');
    }
  }

  return errors;
}

/**
 * 年份验证规则
 */
export const yearRules: FormItemRule[] = [
  { required: true, message: '请选择年份', trigger: 'change' },
  {
    validator: (_rule, value, callback) => {
      if (!Number.isInteger(value) || value < 2015 || value > 2030) {
        callback(new Error('年份必须在 2015-2030 之间'));
      } else {
        callback();
      }
    },
    trigger: 'change',
  },
];

/**
 * 季度验证规则
 */
export const quarterRules: FormItemRule[] = [
  { required: true, message: '请选择季度', trigger: 'change' },
  {
    pattern: /^\d{4}-Q[1-4]$/,
    message: '季度格式错误，应为 "YYYY-Q[1-4]"',
    trigger: 'change',
  },
];

/**
 * 查询长度验证规则
 */
export const queryLengthRules: FormItemRule[] = [
  { required: true, message: '请选择查询长度', trigger: 'change' },
  {
    validator: (_rule, value, callback) => {
      if (!Number.isInteger(value) || value < 1 || value > 10) {
        callback(new Error('查询长度必须在 1-10 年之间'));
      } else {
        callback();
      }
    },
    trigger: 'change',
  },
];
