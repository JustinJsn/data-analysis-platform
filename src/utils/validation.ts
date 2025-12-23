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
