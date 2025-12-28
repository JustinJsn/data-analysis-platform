# 实现计划：绩效数据报表

**Feature Name:** 绩效数据报表  
**Specification Version:** 1.0  
**Target Release:** [待定]

**Summary:**  
绩效数据报表功能提供灵活的时间范围查询（年份段、季度）、人员筛选、部门筛选和层级查询能力，支持批量导出和全量导出。该功能帮助管理层、人力资源管理人员和数据分析师快速获取所需的绩效数据，支持绩效分析和决策制定。

---

## Constitution Alignment Check

This feature MUST comply with all principles in `.specify/memory/constitution.md`:

- [x] **TypeScript Strict Mode:** All code uses strict typing with no implicit any
- [x] **Code Quality Gate:** Passes oxlint, oxfmt, and vue-tsc checks
- [x] **State Management:** Uses Pinia for shared state, Vue Router for navigation
- [x] **Testing Discipline:** Includes unit tests (80%+ coverage) and E2E tests for workflows
- [x] **Production Observability:** Integrates Sentry error tracking with context

**Constitution Compliance Notes:**

- 所有组件和Store使用TypeScript严格模式
- 使用Pinia管理查询状态和筛选条件
- 所有API调用和错误处理集成Sentry
- 单元测试覆盖Store actions和工具函数
- E2E测试覆盖主要查询流程

---

## Scope

### In Scope

- ✅ 年份段滚动查询（单年、多年）
- ✅ 年份+季度滚动查询（支持跨年）
- ✅ 季度智能推算功能
- ✅ 人员搜索和查询（支持多人员，使用虚拟列表）
- ✅ 部门搜索和查询（使用组织树组件）
- ✅ 部门下级部门查询（支持层级查询，可勾选包含下级）
- ✅ 查询条件组合查询
- ✅ 查询结果展示和分页（服务端分页）
- ✅ 查询结果导出（Excel/CSV）
- ✅ 批量导出功能（导出当前分页数据）
- ✅ 全量导出功能（导出所有符合条件的数据）

### Out of Scope

- ❌ 绩效数据的可视化图表展示（由其他功能模块提供）
- ❌ 绩效数据的统计分析计算（仅负责数据查询和展示）
- ❌ 绩效数据的编辑和修改（数据以源系统为准）
- ❌ 查询模板保存功能（当前版本不支持）
- ❌ 查询结果的二次计算和聚合（仅展示原始数据）

---

## Architecture

### Components

1. **PerformanceReportQueryPage.vue** - 主查询页面
   - 整合所有查询条件（时间范围、人员、部门）
   - 展示查询结果表格
   - 处理分页和导出操作

2. **TimeRangeSelector.vue** - 时间范围选择器
   - 支持年份段选择（开始年份、结束年份）
   - 支持季度选择（开始时间、结束时间、查询长度）
   - 实现季度智能推算逻辑

3. **EmployeeSelector.vue** - 人员选择器
   - 使用虚拟列表（Virtual List）展示人员数据
   - 支持搜索查询（姓名、工号）
   - 显示部门路径标识
   - 支持多选

4. **DepartmentSelector.vue** - 部门选择器
   - 使用组织树（Organization Tree）组件
   - 支持搜索和筛选
   - 支持勾选"包含下级组织"选项
   - 支持多部门选择

5. **PerformanceReportTable.vue** - 绩效数据表格
   - 展示查询结果
   - 支持排序和筛选
   - 支持分页

6. **ExportDialog.vue** - 导出对话框
   - 支持批量导出（当前页）
   - 支持全量导出（所有数据）
   - 支持Excel和CSV格式

### State (Pinia Stores)

1. **usePerformanceReportStore** - 绩效报表查询状态管理
   - 查询参数（时间范围、人员、部门等）
   - 查询结果列表
   - 分页信息（当前页、每页条数、总数）
   - 加载状态
   - 导出状态

2. **useEmployeeStore** (已存在，扩展)
   - 人员列表（用于人员选择器）
   - 人员搜索功能
   - 虚拟列表数据管理

3. **useOrganizationStore** (已存在，复用)
   - 组织树数据
   - 组织搜索功能

### Routes

- **Route:** `/performance/reports`
  - **Component:** `PerformanceReportQueryPage.vue`
  - **Purpose:** 绩效数据报表查询页面
  - **Meta:**
    - `title: '绩效数据报表'`
    - `requiresAuth: true`

---

## Technical Context

### 技术栈

- **前端框架:** Vue 3 (Composition API + `<script setup>`)
- **UI组件库:** Element Plus
- **虚拟列表:** Element Plus Virtual Table 或 vue-virtual-scroller
- **组织树:** Element Plus Tree (el-tree-v2)
- **状态管理:** Pinia
- **路由:** Vue Router 4.x
- **HTTP客户端:** Axios (通过 @/utils/request)
- **错误监控:** Sentry
- **测试框架:** Vitest (单元测试) + Playwright (E2E测试)

### 关键技术决策

1. **虚拟列表实现**
   - **选择:** Element Plus Virtual Table (el-table-v2) 或 vue-virtual-scroller
   - **理由:**
     - Element Plus Virtual Table 与现有UI库一致，集成简单
     - 支持大量数据渲染（1000+条记录）
     - 性能优化，减少DOM节点
   - **替代方案:** vue-virtual-scroller（如果Element Plus Virtual Table不满足需求）

2. **组织树组件**
   - **选择:** Element Plus Tree (el-tree-v2)
   - **理由:**
     - 已存在组织树实现（OrganizationTreePage.vue）
     - 支持虚拟滚动，适合大数据量
     - 支持搜索和筛选
   - **复用:** 参考 `src/views/organization/OrganizationTreePage.vue`

3. **季度智能推算算法**
   - **实现:** 前端计算，基于开始时间和查询长度
   - **公式:**
     - 结束季度 = 开始季度
     - 结束年份 = 开始年份 - 查询长度 + 1
   - **边界处理:** 确保结束年份不早于开始年份

4. **部门层级查询**
   - **实现:** 后端递归查询，前端传递"包含下级"标志
   - **优化:** 后端缓存部门层级关系，减少查询时间

5. **导出功能**
   - **批量导出:** 导出当前分页数据（前端处理）
   - **全量导出:** 后端生成文件，前端下载（异步处理）
   - **格式:** Excel (xlsx) 和 CSV
   - **库:** xlsx (SheetJS) 或 exceljs

### 依赖项

1. **现有API**
   - `GET /api/v1/performance-reports` - 查询绩效数据（需扩展支持新的查询参数）
   - `GET /api/v1/employees` - 获取人员列表（用于人员选择器）
   - `GET /api/v1/organizations/tree` - 获取组织树（已存在）

2. **新增API需求**
   - `POST /api/v1/performance-reports/export` - 导出绩效数据（全量导出）
   - 查询API需支持以下参数：
     - `start_year`, `end_year` - 年份段
     - `start_quarter`, `end_quarter`, `start_year_quarter`, `end_year_quarter` - 季度
     - `query_length` - 查询长度（年数）
     - `user_ids[]` - 人员ID数组
     - `department_id` - 部门ID
     - `include_sub_departments` - 是否包含下级部门
     - `page`, `page_size` - 分页参数

3. **外部库**
   - `xlsx` 或 `exceljs` - Excel导出
   - Element Plus Virtual Table (已包含在Element Plus中)

---

## Testing Strategy

### Unit Tests

1. **Store Tests** (`tests/stores/performance-report.test.ts`)
   - **Coverage Target:** 80%+
   - **Test Cases:**
     - 查询参数更新
     - 分页状态管理
     - 筛选条件重置
     - 导出状态管理

2. **Utils Tests** (`tests/utils/quarter-calculator.test.ts`)
   - **Coverage Target:** 90%+
   - **Test Cases:**
     - 季度智能推算算法
     - 时间范围计算
     - 边界情况处理（跨年、单季度等）

3. **Component Tests** (`tests/components/TimeRangeSelector.test.ts`, etc.)
   - **Coverage Target:** 70%+
   - **Test Cases:**
     - 时间选择器交互
     - 季度推算UI逻辑
     - 人员选择器搜索
     - 部门选择器树形展示

### E2E Tests

1. **查询流程测试** (`tests/e2e/performance-report-query.spec.ts`)
   - **Scenarios:**
     - 年份段查询（单年、多年）
     - 季度查询（跨年）
     - 人员查询（多人员）
     - 部门查询（包含下级）
     - 组合查询（时间+人员+部门）

2. **导出功能测试** (`tests/e2e/performance-report-export.spec.ts`)
   - **Scenarios:**
     - 批量导出（当前页）
     - 全量导出（所有数据）
     - 导出格式验证（Excel、CSV）

3. **分页测试** (`tests/e2e/performance-report-pagination.spec.ts`)
   - **Scenarios:**
     - 分页切换
     - 每页条数调整
     - 分页与查询条件组合

---

## Observability

### Sentry Integration

**Error boundaries:**

- API调用错误（查询、导出）
- 季度推算算法错误
- 虚拟列表渲染错误
- 导出文件生成错误

**Context metadata:**

- 查询参数（时间范围、人员、部门）
- 用户ID
- 操作类型（查询、导出）
- 分页信息
- 错误发生时的筛选条件

**Error tracking points:**

1. `PerformanceReportQueryPage.vue` - 查询操作错误
2. `usePerformanceReportStore` - Store actions错误
3. `ExportDialog.vue` - 导出操作错误
4. `TimeRangeSelector.vue` - 季度推算错误

---

## Dependencies

### 内部依赖

- `@/stores/employee` - 人员数据（需扩展支持虚拟列表）
- `@/stores/organization` - 组织树数据（已存在）
- `@/api/performance` - 绩效数据API（需扩展）
- `@/api/employee` - 人员API（已存在）
- `@/api/organization` - 组织API（已存在）
- `@/utils/request` - HTTP请求工具
- `@/utils/sentry` - Sentry错误监控

### 外部依赖

- `element-plus` - UI组件库（已安装）
- `xlsx` 或 `exceljs` - Excel导出库（需安装）
- `vue-virtual-scroller` (可选) - 虚拟列表（如果Element Plus Virtual Table不满足需求）

---

## Success Criteria

- [ ] All constitution checks passed
- [ ] All tests pass with coverage targets met
  - [ ] Store tests: 80%+ coverage
  - [ ] Utils tests: 90%+ coverage
  - [ ] Component tests: 70%+ coverage
  - [ ] E2E tests: 覆盖所有主要查询流程
- [ ] No linter/type errors (oxlint, oxfmt, vue-tsc)
- [ ] Sentry configured and tested
- [ ] 年份段查询功能正常工作
- [ ] 季度查询和智能推算功能正常工作
- [ ] 人员选择器使用虚拟列表，性能良好（1000+条记录）
- [ ] 部门选择器使用组织树，支持包含下级选项
- [ ] 分页功能正常工作（服务端分页）
- [ ] 批量导出和全量导出功能正常工作
- [ ] 查询响应时间符合规格要求（单年3秒，多年10秒）

---

## Implementation Phases

### Phase 0: Research & Design

**目标:** 解决技术决策和设计问题

**任务:**

1. 研究虚拟列表实现方案（Element Plus Virtual Table vs vue-virtual-scroller）
2. 研究Excel导出库选择（xlsx vs exceljs）
3. 设计季度智能推算算法
4. 设计API接口规范
5. 设计数据模型

**输出:**

- `research.md` - 技术研究和决策文档
- `data-model.md` - 数据模型定义
- `contracts/api-client.ts` - API接口定义

### Phase 1: Core Implementation

**目标:** 实现核心查询功能

**任务:**

1. 实现时间范围选择器（年份段、季度）
2. 实现季度智能推算功能
3. 实现人员选择器（虚拟列表）
4. 实现部门选择器（组织树）
5. 实现查询Store和API集成
6. 实现查询结果表格和分页

**输出:**

- 核心组件实现
- Store实现
- API集成

### Phase 2: Advanced Features

**目标:** 实现高级功能

**任务:**

1. 实现导出功能（批量、全量）
2. 实现组合查询（多条件）
3. 性能优化（虚拟列表、查询缓存）
4. 错误处理和Sentry集成

**输出:**

- 导出功能
- 完整的查询功能
- 错误监控

### Phase 3: Testing & Polish

**目标:** 测试和完善

**任务:**

1. 编写单元测试
2. 编写E2E测试
3. 性能测试和优化
4. UI/UX优化
5. 文档完善

**输出:**

- 测试套件
- 完善的文档
- 生产就绪的代码

---

## Risks & Mitigation

### 风险1: 虚拟列表性能问题

**影响:** 大量人员数据（1000+）可能导致渲染性能问题

**缓解措施:**

- 使用Element Plus Virtual Table，支持虚拟滚动
- 实现搜索过滤，减少显示数据量
- 实现懒加载，按需加载数据
- 性能测试，确保1000+条记录流畅

### 风险2: 季度推算算法边界情况

**影响:** 跨年、单季度等边界情况可能导致计算错误

**缓解措施:**

- 详细设计算法，覆盖所有边界情况
- 编写全面的单元测试
- 允许用户手动调整推算结果
- 提供算法说明文档

### 风险3: 全量导出大数据量问题

**影响:** 导出大量数据（10万+条）可能导致超时或内存问题

**缓解措施:**

- 后端异步处理，生成文件后通知前端下载
- 实现导出进度提示
- 限制单次导出最大数据量（如10万条）
- 使用流式导出，减少内存占用

### 风险4: 部门层级查询性能问题

**影响:** 深层级部门树（10级+）查询可能较慢

**缓解措施:**

- 后端优化查询算法，使用递归或迭代方式
- 缓存部门层级关系
- 限制查询深度（如10级）
- 实现查询超时机制

---

## Notes

- 本计划基于现有代码库结构和技术栈
- 复用现有的Store和API结构
- 遵循项目Constitution的所有原则
- 重点关注性能和用户体验
- 所有功能需通过测试验证
