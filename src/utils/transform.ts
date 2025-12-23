/**
 * 数据转换工具
 */

/**
 * 格式化日期时间
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return new Date(isoString).toLocaleString('zh-CN', {
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
    employee: '员工同步',
    organization: '组织同步',
    jobpost: '职务同步',
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
): 'info' | 'success' | 'danger' | 'warning' {
  const types: Record<string, 'info' | 'success' | 'danger' | 'warning'> = {
    running: 'info',
    success: 'success',
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
  const [username, domain] = email.split('@');
  if (username.length <= 3) return email;
  return `${username.slice(0, 3)}***@${domain}`;
}
