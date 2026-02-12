/**
 * 数据转换工具
 */

/**
 * 格式化日期时间
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    const date = new Date(isoString);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
}

/**
 * 格式化日期
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '-';
  }
}

/**
 * 格式化时间
 */
export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '-';
  }
}

/**
 * 格式化持续时间
 */
export function formatDuration(ms: number | null | undefined): string {
  if (ms == null) return '-';
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(2)}min`;
  return `${(ms / 3600000).toFixed(2)}h`;
}

/**
 * 同步类型显示名称
 */
export function getSyncTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    employee: '员工',
    organization: '组织',
    jobpost: '职务',
    performance_report: '北森绩效',
  };
  return labels[type] || type;
}

/**
 * 状态显示名称
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    running: '运行中',
    success: '成功',
    partial_success: '部分成功',
    failed: '失败',
    pending: '等待中',
    canceled: '已取消',
  };
  return labels[status] || status;
}

/**
 * 状态标签类型（Element Plus Tag）
 */
export function getStatusType(
  status: string,
): 'info' | 'success' | 'danger' | 'warning' | 'primary' {
  const types: Record<
    string,
    'info' | 'success' | 'danger' | 'warning' | 'primary'
  > = {
    running: 'primary',
    success: 'success',
    partial_success: 'warning',
    failed: 'danger',
    pending: 'warning',
    canceled: 'info',
  };
  return types[status] || 'info';
}

/**
 * 触发模式显示名称
 */
export function getTriggerModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    manual: '手动触发',
    scheduled: '定时触发',
    auto: '自动触发',
  };
  return labels[mode] || mode;
}

/**
 * 操作类型显示名称
 */
export function getOperationLabel(operation: string): string {
  const labels: Record<string, string> = {
    insert: '新增',
    update: '更新',
    delete: '删除',
  };
  return labels[operation] || operation;
}

/**
 * 文件大小格式化
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 数字格式化（千分位）
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 百分比格式化
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(2)}%`;
}

/**
 * 隐藏手机号中间4位
 */
export function hideMobile(mobile: string): string {
  if (!mobile || mobile.length !== 11) return mobile;
  return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 隐藏邮箱部分字符
 */
export function hideEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const parts = email.split('@');
  if (parts.length < 2 || !parts[0] || !parts[1]) return email;
  const username = parts[0];
  const domain = parts[1];
  if (username.length <= 3) return email;
  return `${username.slice(0, 3)}***@${domain}`;
}

/**
 * 获取同步类型标签颜色
 */
export function getSyncTypeTagType(
  type: string,
): 'info' | 'success' | 'warning' | 'primary' | '' {
  const types: Record<string, 'info' | 'success' | 'warning' | 'primary' | ''> =
    {
      employee: 'primary',
      organization: 'warning',
      jobpost: 'success',
      performance_report: 'info',
    };
  return types[type] || '';
}

/**
 * 计算耗时（秒）
 */
export function calculateDurationSeconds(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): number | null {
  if (!startTime || !endTime) return null;
  try {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.floor((end - start) / 1000);
  } catch {
    return null;
  }
}

/**
 * 格式化耗时描述
 */
export function formatDurationDesc(seconds: number | null): string {
  if (seconds === null) return '-';
  if (seconds < 0) return '-';

  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}分${remainingSeconds}秒`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}时${minutes}分`;
  }
}

/**
 * 转换后端响应到前端模型（绩效数据）
 * 后端返回 snake_case，前端使用 snake_case（与后端保持一致）
 */
export function transformPerformanceReport(
  data: Record<string, any>,
): Record<string, any> {
  // 后端返回的字段已经是 snake_case，直接返回
  // 如果需要转换为 camelCase，可以在这里进行转换
  return {
    id: data.id,
    batch_id: data.batch_id,
    external_system_id: data.external_system_id,
    year: data.year,
    quarter: data.quarter,
    employee_name: data.employee_name,
    employee_user_id: data.employee_user_id,
    organization_full_name: data.organization_full_name,
    organization_path_ids: data.organization_path_ids,
    performance_rating: data.performance_rating,
    last_synced_at: data.last_synced_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

/**
 * 转换前端请求参数到后端格式（绩效数据查询参数）
 * 前端使用 camelCase，后端需要 snake_case
 */
export function transformPerformanceQueryParams(
  params: Record<string, any>,
): Record<string, any> {
  const result: Record<string, any> = {};

  if (params.pageNum !== undefined) {
    result.page = params.pageNum;
  }
  if (params.pageSize !== undefined) {
    result.page_size = params.pageSize;
  }
  if (params.year !== undefined) {
    result.year = params.year;
  }
  if (params.quarter !== undefined) {
    result.quarter = params.quarter;
  }
  if (params.employee_name !== undefined) {
    result.employee_name = params.employee_name;
  }
  if (params.employee_user_id !== undefined) {
    result.employee_user_id = params.employee_user_id;
  }
  if (params.organization_path_ids !== undefined) {
    result.organization_path_ids = params.organization_path_ids;
  }
  if (params.performance_rating !== undefined) {
    result.performance_rating = params.performance_rating;
  }

  return result;
}

/**
 * 解析部门路径，提取一级到四级部门
 * @param departmentPath 部门路径，如："A部门/B部门/C部门/D部门"
 * @returns 包含一级到四级部门的对象
 */
export function parseDepartmentPath(
  departmentPath: string | null | undefined,
): {
  level1: string;
  level2: string;
  level3: string;
  level4: string;
} {
  const defaultResult = {
    level1: '',
    level2: '',
    level3: '',
    level4: '',
  };

  if (!departmentPath) {
    return defaultResult;
  }

  const parts = departmentPath.split('/').filter((part) => part.trim());
  return {
    level1: parts[0] || '',
    level2: parts[1] || '',
    level3: parts[2] || '',
    level4: parts[3] || '',
  };
}
