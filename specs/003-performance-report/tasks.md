# Tasks: 绩效数据报表

**Specification:** [spec.md](./spec.md)  
**Plan:** [plan.md](./plan.md)

---

## Task Breakdown

### Phase 1: Setup & Dependencies

**目标:** 安装依赖和初始化项目结构

- [x] T001 安装 xlsx 库用于 Excel 导出功能
- [x] T002 创建绩效报表类型定义文件 `src/types/performance-report.ts`
- [x] T003 创建绩效报表 API 客户端文件 `src/api/performance-report.ts`
- [x] T004 创建绩效报表路由配置在 `src/router/routes.ts`
- [x] T005 创建绩效报表 Store 文件 `src/stores/performance-report.ts`

### Phase 2: Foundational Components & Utilities

**目标:** 创建基础组件和工具函数，为所有用户故事提供支持

- [x] T006 [P] 创建季度时间工具函数 `src/utils/quarter-calculator.ts` 包含季度智能推算算法
- [x] T007 [P] 创建时间范围转换工具函数 `src/utils/date-range.ts` 包含年份段和季度到日期范围的转换
- [x] T008 [P] 创建查询参数验证函数 `src/utils/validation.ts` 扩展验证规则支持绩效报表查询参数
- [x] T009 [P] 创建导出工具函数 `src/utils/export.ts` 包含批量导出和文件下载功能
- [x] T010 创建绩效数据表格组件 `src/components/performance/PerformanceReportTable.vue` 支持分页展示
- [x] T011 创建主查询页面组件 `src/views/performance/PerformanceReportQueryPage.vue` 整合所有查询条件

### Phase 3: User Story 1 - 年份段查询

**作为** 人力资源管理人员  
**我想要** 查询2025年全年的绩效数据  
**以便于** 进行年度绩效评估和总结

**独立测试标准:**

- 可以选择开始年份和结束年份
- 系统返回指定年份范围内的所有绩效数据
- 查询响应时间不超过3秒（数据量在1万条以内）

- [ ] T012 [US1] 实现年份段选择器组件 `src/components/performance/YearRangeSelector.vue` 支持开始年份和结束年份选择
- [ ] T013 [US1] 扩展 TimeRangeSelector 组件 `src/components/performance/TimeRangeSelector.vue` 支持年份段模式
- [ ] T014 [US1] 实现年份段到日期范围的转换函数在 `src/utils/date-range.ts` 中
- [ ] T015 [US1] 扩展 PerformanceReportStore `src/stores/performance-report.ts` 添加年份段查询参数管理
- [ ] T016 [US1] 扩展 performance-report API `src/api/performance-report.ts` 支持 start_year 和 end_year 参数
- [ ] T017 [US1] 在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中集成年份段选择器
- [ ] T018 [US1] 实现年份段查询结果展示在 PerformanceReportTable `src/components/performance/PerformanceReportTable.vue` 中

### Phase 4: User Story 2 - 季度查询与智能推算

**作为** 数据分析师  
**我想要** 查询2025年Q1到Q4的绩效数据  
**以便于** 分析季度绩效趋势

**独立测试标准:**

- 可以选择开始季度和结束季度
- 支持查询长度自动推算结束时间
- 季度推算准确率达到100%
- 支持跨年季度查询

- [ ] T019 [US2] 实现季度选择器组件 `src/components/performance/QuarterSelector.vue` 支持年份和季度选择
- [ ] T020 [US2] 实现查询长度选择器组件 `src/components/performance/QueryLengthSelector.vue` 支持1-10年选择
- [ ] T021 [US2] 实现季度智能推算函数 `calculateEndQuarter` 在 `src/utils/quarter-calculator.ts` 中
- [ ] T022 [US2] 扩展 TimeRangeSelector 组件 `src/components/performance/TimeRangeSelector.vue` 支持季度模式和智能推算
- [ ] T023 [US2] 实现季度到日期范围的转换函数在 `src/utils/date-range.ts` 中
- [ ] T024 [US2] 扩展 PerformanceReportStore `src/stores/performance-report.ts` 添加季度查询参数和查询长度管理
- [ ] T025 [US2] 扩展 performance-report API `src/api/performance-report.ts` 支持 start_year_quarter、end_year_quarter 和 query_length 参数
- [ ] T026 [US2] 在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中集成季度选择器和查询长度选择器
- [ ] T027 [US2] 实现季度查询结果按季度分组展示在 PerformanceReportTable `src/components/performance/PerformanceReportTable.vue` 中

### Phase 5: User Story 3 - 部门查询

**作为** 部门经理  
**我想要** 查询本部门所有人员的绩效数据  
**以便于** 了解部门整体绩效情况

**独立测试标准:**

- 可以通过部门ID查询对应部门下所有人员的绩效数据
- 可以选择是否包含下级部门
- 查询结果按部门和人员分组展示

- [ ] T028 [US3] 创建部门选择器组件 `src/components/performance/DepartmentSelector.vue` 使用 el-tree-v2 展示组织树
- [ ] T029 [US3] 实现部门搜索功能在 DepartmentSelector `src/components/performance/DepartmentSelector.vue` 中
- [ ] T030 [US3] 实现"包含下级组织"复选框在 DepartmentSelector `src/components/performance/DepartmentSelector.vue` 中
- [ ] T031 [US3] 扩展 PerformanceReportStore `src/stores/performance-report.ts` 添加部门查询参数和包含下级标志管理
- [ ] T032 [US3] 扩展 performance-report API `src/api/performance-report.ts` 支持 department_id 和 include_sub_departments 参数
- [ ] T033 [US3] 在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中集成部门选择器
- [ ] T034 [US3] 实现部门查询结果按部门层级分组展示在 PerformanceReportTable `src/components/performance/PerformanceReportTable.vue` 中

### Phase 6: User Story 4 - 人员查询

**作为** 人力资源管理人员  
**我想要** 查询多个特定人员的绩效数据  
**以便于** 进行人员绩效对比分析

**独立测试标准:**

- 可以通过人员UserId搜索，支持多人员查询
- 人员选择器使用虚拟列表，支持1000+条记录流畅渲染
- 人员列表中显示部门路径标识

- [ ] T035 [US4] 扩展 EmployeeStore `src/stores/employee.ts` 添加虚拟列表数据管理和部门路径计算
- [ ] T036 [US4] 创建人员选择器组件 `src/components/performance/EmployeeSelector.vue` 使用 el-table-v2 实现虚拟列表
- [ ] T037 [US4] 实现人员搜索功能在 EmployeeSelector `src/components/performance/EmployeeSelector.vue` 中支持姓名和工号搜索
- [ ] T038 [US4] 实现部门路径显示在 EmployeeSelector `src/components/performance/EmployeeSelector.vue` 中展示人员所属部门层级
- [ ] T039 [US4] 实现多选功能在 EmployeeSelector `src/components/performance/EmployeeSelector.vue` 中支持选择多个人员
- [ ] T040 [US4] 扩展 performance API `src/api/employee.ts` 添加 getListForSelector 方法支持人员选择器查询
- [ ] T041 [US4] 扩展 PerformanceReportStore `src/stores/performance-report.ts` 添加人员查询参数管理（user_ids数组）
- [ ] T042 [US4] 扩展 performance-report API `src/api/performance-report.ts` 支持 user_ids 数组参数
- [ ] T043 [US4] 在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中集成人员选择器
- [ ] T044 [US4] 实现人员查询结果按人员分组展示在 PerformanceReportTable `src/components/performance/PerformanceReportTable.vue` 中

### Phase 7: User Story 5 - 组合查询与导出

**作为** 数据分析师  
**我想要** 查询2025年Q1到Q3期间，A部门（包含下级部门）所有人员的绩效数据，并支持导出  
**以便于** 进行部门绩效深度分析

**独立测试标准:**

- 可以同时选择时间范围、部门、人员等多条件组合查询
- 系统返回满足所有条件的绩效数据
- 支持批量导出（当前页）和全量导出（所有数据）
- 支持Excel和CSV格式导出

- [ ] T045 [US5] 实现组合查询逻辑在 PerformanceReportStore `src/stores/performance-report.ts` 中支持多条件组合
- [ ] T046 [US5] 实现查询参数合并和验证在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中
- [ ] T047 [US5] 创建导出对话框组件 `src/components/performance/ExportDialog.vue` 支持批量导出和全量导出选择
- [ ] T048 [US5] 实现批量导出功能在 `src/utils/export.ts` 中使用 xlsx 库导出当前页数据
- [ ] T049 [US5] 扩展 performance-report API `src/api/performance-report.ts` 添加 exportReports 方法支持导出请求
- [ ] T050 [US5] 实现全量导出任务提交在 PerformanceReportStore `src/stores/performance-report.ts` 中
- [ ] T051 [US5] 实现导出任务状态轮询在 PerformanceReportStore `src/stores/performance-report.ts` 中检查任务完成状态
- [ ] T052 [US5] 扩展 performance-report API `src/api/performance-report.ts` 添加 getExportTaskStatus 方法
- [ ] T053 [US5] 实现文件下载功能在 `src/utils/export.ts` 中支持从URL下载文件
- [ ] T054 [US5] 在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中集成导出对话框
- [ ] T055 [US5] 实现查询结果排序和分组功能在 PerformanceReportTable `src/components/performance/PerformanceReportTable.vue` 中

### Phase 8: Testing & Quality Assurance

**目标:** 编写测试、优化性能和确保代码质量

- [ ] T056 [P] 编写季度推算算法单元测试 `tests/utils/quarter-calculator.test.ts` 覆盖所有边界情况
- [ ] T057 [P] 编写时间范围转换单元测试 `tests/utils/date-range.test.ts` 验证年份段和季度转换
- [ ] T058 [P] 编写查询参数验证单元测试 `tests/utils/validation.test.ts` 验证所有验证规则
- [ ] T059 [P] 编写 PerformanceReportStore 单元测试 `tests/stores/performance-report.test.ts` 达到80%+覆盖率
- [ ] T060 [P] 编写 TimeRangeSelector 组件测试 `tests/components/TimeRangeSelector.test.ts` 验证季度推算UI逻辑
- [ ] T061 [P] 编写 EmployeeSelector 组件测试 `tests/components/EmployeeSelector.test.ts` 验证虚拟列表和搜索功能
- [ ] T062 [P] 编写 DepartmentSelector 组件测试 `tests/components/DepartmentSelector.test.ts` 验证组织树和包含下级选项
- [ ] T063 编写年份段查询 E2E 测试 `tests/e2e/performance-report-year-query.spec.ts` 覆盖场景1
- [ ] T064 编写季度查询 E2E 测试 `tests/e2e/performance-report-quarter-query.spec.ts` 覆盖场景2和智能推算
- [ ] T065 编写部门查询 E2E 测试 `tests/e2e/performance-report-department-query.spec.ts` 覆盖场景3
- [ ] T066 编写人员查询 E2E 测试 `tests/e2e/performance-report-employee-query.spec.ts` 覆盖场景4
- [ ] T067 编写组合查询和导出 E2E 测试 `tests/e2e/performance-report-combined-query.spec.ts` 覆盖场景5
- [ ] T068 实现 Sentry 错误监控集成在 PerformanceReportQueryPage `src/views/performance/PerformanceReportQueryPage.vue` 中
- [ ] T069 实现 Sentry 错误监控集成在 PerformanceReportStore `src/stores/performance-report.ts` 中
- [ ] T070 实现 Sentry 错误监控集成在 ExportDialog `src/components/performance/ExportDialog.vue` 中
- [ ] T071 优化虚拟列表性能确保1000+条记录流畅渲染
- [ ] T072 实现查询结果缓存机制在 PerformanceReportStore `src/stores/performance-report.ts` 中（5分钟TTL）
- [ ] T073 运行 oxlint 检查确保代码质量
- [ ] T074 运行 oxfmt 格式化代码
- [ ] T075 运行 vue-tsc 类型检查确保零错误

### Phase 9: Polish & Documentation

**目标:** 完善文档、UI优化和最终检查

- [ ] T076 优化 UI/UX 确保所有组件符合设计规范
- [ ] T077 添加 JSDoc 注释到所有公共 API 和工具函数
- [ ] T078 更新 README 文档说明绩效报表功能使用方法
- [ ] T079 验证所有 Constitution 原则合规性
- [ ] T080 进行代码审查和最终测试

---

## Dependencies

### User Story Completion Order

1. **Phase 1 (Setup)** → 必须先完成，所有后续任务依赖
2. **Phase 2 (Foundational)** → 必须先完成，所有用户故事依赖基础组件和工具
3. **Phase 3 (US1: 年份段查询)** → 可以独立完成和测试
4. **Phase 4 (US2: 季度查询)** → 可以独立完成和测试，但复用US1的基础组件
5. **Phase 5 (US3: 部门查询)** → 可以独立完成和测试
6. **Phase 6 (US4: 人员查询)** → 可以独立完成和测试
7. **Phase 7 (US5: 组合查询)** → 依赖US1-US4完成，需要组合所有查询条件
8. **Phase 8 (Testing)** → 依赖所有功能实现完成
9. **Phase 9 (Polish)** → 依赖所有功能实现和测试完成

### Parallel Execution Opportunities

**Phase 2 (Foundational):**

- T006, T007, T008, T009 可以并行执行（不同文件，无依赖）

**Phase 3-6 (User Stories):**

- US1, US2, US3, US4 可以并行开发（不同功能模块）
- 但建议按优先级顺序完成以确保基础功能先可用

**Phase 8 (Testing):**

- T056-T062 单元测试可以并行执行
- T063-T067 E2E测试可以并行执行

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**建议MVP包含:**

- Phase 1: Setup
- Phase 2: Foundational (部分)
- Phase 3: User Story 1 (年份段查询) - **核心功能**
- Phase 8: 基础测试
- Phase 9: 基础文档

**MVP目标:**

- 用户可以按年份段查询绩效数据
- 查询结果可以分页展示
- 基本错误处理

### Incremental Delivery

1. **Sprint 1:** Setup + Foundational + US1 (年份段查询)
2. **Sprint 2:** US2 (季度查询) + US3 (部门查询)
3. **Sprint 3:** US4 (人员查询) + US5 (组合查询和导出)
4. **Sprint 4:** Testing + Polish

---

## Task Summary

- **Total Tasks:** 80
- **Setup Tasks:** 5 (Phase 1)
- **Foundational Tasks:** 6 (Phase 2)
- **User Story 1 Tasks:** 7 (Phase 3)
- **User Story 2 Tasks:** 9 (Phase 4)
- **User Story 3 Tasks:** 7 (Phase 5)
- **User Story 4 Tasks:** 10 (Phase 6)
- **User Story 5 Tasks:** 11 (Phase 7)
- **Testing Tasks:** 20 (Phase 8)
- **Polish Tasks:** 5 (Phase 9)

### Parallel Opportunities

- **Phase 2:** 4 tasks (T006-T009)
- **Phase 8:** 7 tasks (T056-T062, T063-T067)
- **User Stories:** US1-US4 可以并行开发（不同开发者）

### Independent Test Criteria per Story

- **US1 (年份段查询):** 可以选择年份范围，返回正确数据，响应时间<3秒
- **US2 (季度查询):** 可以选择季度范围，智能推算准确，支持跨年查询
- **US3 (部门查询):** 可以选择部门，支持包含下级选项，结果按部门分组
- **US4 (人员查询):** 可以多选人员，虚拟列表流畅，显示部门路径
- **US5 (组合查询):** 可以组合多条件，支持批量/全量导出，格式正确

---

## Definition of Done

每个任务完成的标准：

1. ✅ 代码实现指定功能
2. ✅ TypeScript 严格模式合规（无隐式 any）
3. ✅ 通过 oxlint、oxfmt 和 vue-tsc 检查
4. ✅ 相关单元测试已编写（如适用）
5. ✅ Sentry 错误处理已实现（如适用）
6. ✅ 代码已审查和批准

**注意:** 所有任务必须遵循项目 Constitution 的5个核心原则。

---

## Notes

- 任务可以基于依赖关系重新排序
- 被阻塞的任务应立即标记
- 所有提交必须通过 pre-commit hooks（Principle 2）
- 虚拟列表性能目标：1000+条记录流畅渲染（60fps）
- 导出性能目标：批量导出<2秒，全量导出异步处理
- 查询性能目标：单年查询<3秒，多年查询<10秒
