/**
 * 认证相关类型定义
 */

/**
 * 用户信息
 */
export interface User {
  /** 用户ID */
  id: string;
  /** 用户名 */
  username: string;
  /** 姓名 */
  name: string;
  /** 邮箱 */
  email: string;
  /** 手机号 */
  phone?: string;
  /** 角色列表 */
  roles: string[];
  /** 权限码列表 */
  permissions: string[];
  /** 头像URL */
  avatar?: string;
  /** 创建时间 */
  createdAt: string;
}

/**
 * 认证令牌
 */
export interface AuthToken {
  /** 访问令牌 */
  accessToken: string;
  /** 刷新令牌 */
  refreshToken: string;
  /** 过期时间（秒） */
  expiresIn: number;
  /** 令牌类型 */
  tokenType: 'Bearer';
}

/**
 * 登录请求
 */
export interface LoginRequest {
  /** 用户名 */
  username: string;
  /** 密码 */
  password: string;
  /** 验证码（可选） */
  captcha?: string;
}

/**
 * 登录响应
 */
export interface LoginResponse {
  /** 令牌信息 */
  token: AuthToken;
  /** 用户信息 */
  user: User;
}
