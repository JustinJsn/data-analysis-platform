/**
 * API 统一导出
 */

// 导出各模块 API
export { authApi } from './auth';
export { employeeApi } from './employee';
export { organizationApi } from './organization';
export { positionApi } from './position';
export { syncApi } from './sync';
export { performanceApi } from './performance';
export { performanceReportApi } from './performance-report';

// 默认导出（保持向后兼容）
import { authApi } from './auth';
import { employeeApi } from './employee';
import { organizationApi } from './organization';
import { positionApi } from './position';
import { syncApi } from './sync';
import { performanceApi } from './performance';
import { performanceReportApi } from './performance-report';

export default {
  auth: authApi,
  employee: employeeApi,
  organization: organizationApi,
  position: positionApi,
  sync: syncApi,
  performance: performanceApi,
  performanceReport: performanceReportApi,
};
