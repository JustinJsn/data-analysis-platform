/**
 * 组织架构相关类型定义
 */

/**
 * 组织树节点（对应 API 的 OrganizationTreeNodeVO）
 */
export interface Organization {
  /** 组织ID */
  id: string;
  /** 组织名称 */
  name: string;
  /** 组织编码 */
  code: string;
  /** 父组织ID（根节点为null） */
  parentId: string | null;
  /** 组织层级 */
  level: number;
  /** 子组织列表 */
  children: Organization[];
}
