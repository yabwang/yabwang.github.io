---
order: 2
---

# GSD (Get Shit Done) - Claude Code 工作流系统

## 📖 项目概述

GSD (Get Shit Done) 是一个专为 Claude Code 设计的完整工作流管理系统,旨在通过结构化的流程和专用 Agent 来提升 AI 辅助开发效率和项目交付质量。

**当前版本**: 1.30.0 (最新版本: 1.34.2)
**安装位置**: `~/.claude/` 目录
**核心理念**: 通过分布式 Agent 协作,实现从需求到交付的全生命周期管理

## 🏗️ 系统架构

### 1. 核心组件

#### 🤖 专用 Agent 系统 (18 个)
GSD 包含 18 个专业化的 Subagent,每个负责特定的工作流阶段:

**规划阶段**:
- `gsd-roadmapper` - 创建项目路线图,分解里程碑
- `gsd-planner` - 制定详细的阶段执行计划
- `gsd-phase-researcher` - 研究阶段实现方案
- `gsd-plan-checker` - 验证计划可行性

**研究阶段**:
- `gsd-project-researcher` - 项目生态研究
- `gsd-advisor-researcher` - 决策建议研究
- `gsd-research-synthesizer` - 研究成果整合
- `gsd-codebase-mapper` - 代码库结构分析

**执行阶段**:
- `gsd-executor` - 执行计划并提交原子化 commit
- `gsd-debugger` - 系统化调试与问题诊断

**验证阶段**:
- `gsd-verifier` - 验证阶段目标达成情况
- `gsd-integration-checker` - 跨阶段集成验证
- `gsd-nyquist-auditor` - 测试覆盖度审计

**UI 专项**:
- `gsd-ui-researcher` - UI 设计契约研究
- `gsd-ui-checker` - UI 规范验证
- `gsd-ui-auditor` - UI 实现质量审计

**辅助系统**:
- `gsd-user-profiler` - 用户行为分析
- `gsd-assumptions-analyzer` - 前置条件分析

#### 📋 工作流命令 (57+ 个)
通过 `/gsd:xxx` 格式调用的工作流命令,覆盖项目全生命周期:

**项目初始化**:
- `/gsd:new-project` - 初始化新项目
- `/gsd:new-milestone` - 创建新里程碑周期
- `/gsd:new-workspace` - 创建隔离工作空间

**计划管理**:
- `/gsd:plan-phase` - 创建详细阶段计划
- `/gsd:discuss-phase` - 阶段讨论与需求确认
- `/gsd:list-phase-assumptions` - 列出阶段假设条件
- `/gsd:add-phase` - 添加新阶段到路线图

**执行控制**:
- `/gsd:execute-phase` - 执行阶段计划
- `/gsd:execute-plan` - 执行独立计划文件
- `/gsd:autonomous` - 自动化执行剩余阶段
- `/gsd:fast` - 快速执行简单任务

**验证审计**:
- `/gsd:verify-work` - 验证构建功能
- `/gsd:audit-milestone` - 审计里程碑完成度
- `/gsd:audit-uat` - 跨阶段 UAT 审计
- `/gsd:validate-phase` - 填充验证缺口

**进度管理**:
- `/gsd:progress` - 检查项目进度
- `/gsd:next` - 自动推进下一步
- `/gsd:stats` - 显示项目统计数据
- `/gsd:resume-work` - 恢复中断的工作

**问题处理**:
- `/gsd:debug` - 系统化调试
- `/gsd:forensics` - 失败工作流事后分析
- `/gsd:health` - 诊断计划目录健康度

**协作支持**:
- `/gsd:thread` - 管理持久上下文线程
- `/gsd:workstreams` - 管理并行工作流
- `/gsd:manager` - 多阶段管理中心

**辅助功能**:
- `/gsd:note` - 零摩擦想法捕获
- `/gsd:add-todo` - 添加待办事项
- `/gsd:check-todos` - 检查待办列表
- `/gsd:plant-seed` - 播种前瞻性想法

#### 📁 模板系统 (41 个文件)
完整的文档模板库,标准化各阶段输出:

**项目模板**:
- `PROJECT.md` - 项目定义模板
- `ROADMAP.md` - 路线图模板
- `MILESTONE.md` - 里程碑模板
- `PHASE.md` - 阶段定义模板

**规划模板**:
- `PLAN.md` - 执行计划模板
- `RESEARCH.md` - 研究报告模板
- `UI-SPEC.md` - UI 设计契约模板
- `DISCUSSION.md` - 讨论记录模板

**验证模板**:
- `UAT.md` - 用户验收测试模板
- `VALIDATION.md` - 验证报告模板
- `VERIFICATION.md` - 目标验证模板

**状态模板**:
- `STATE.md` - 状态管理模板
- `CONTEXT.md` - 上下文模板
- `DEBUG.md` - 调试记录模板

**代码库分析模板**:
- `ARCHITECTURE.md` - 架构分析
- `STACK.md` - 技术栈分析
- `CONVENTIONS.md` - 编码规范
- `TESTING.md` - 测试策略

#### 📚 参考文档 (15 个文件)
详细的技术规范和最佳实践:

- `checkpoints.md` - 检查点协议
- `continuation-format.md` - 继续工作格式
- `decimal-phase-calculation.md` - 小数阶段计算
- `git-integration.md` - Git 集成策略
- `model-profiles.md` - 模型配置方案
- `phase-argument-parsing.md` - 阶段参数解析
- `planning-config.md` - 规划配置
- `questioning.md` - 提问策略
- `tdd.md` - 测试驱动开发
- `verification-patterns.md` - 验证模式
- 等等...

### 2. 工作流系统

#### 🎯 项目初始化流程
```mermaid
graph LR
    A[/gsd:new-project] --> B[gsd-roadmapper]
    B --> C[PROJECT.md]
    C --> D[/gsd:new-milestone]
    D --> E[ROADMAP.md]
```

#### 🔄 阶段执行流程
```mermaid
graph TD
    A[/gsd:plan-phase] --> B[gsd-phase-researcher]
    B --> C[gsd-planner]
    C --> D[PLAN.md]
    D --> E[/gsd:execute-phase]
    E --> F[gsd-executor]
    F --> G[原子化提交]
    G --> H[/gsd:verify-work]
    H --> I[gsd-verifier]
    I --> J[VERIFICATION.md]
```

#### ✅ 验证审计流程
```mermaid
graph TD
    A[/gsd:audit-milestone] --> B[gsd-integration-checker]
    B --> C{集成检查}
    C -->|通过| D[/gsd:ship]
    C -->|失败| E[/gsd:debug]
    D --> F[创建 PR]
    E --> G[gsd-debugger]
    G --> H[问题修复]
    H --> A
```

## 🎨 核心特性

### 1. Goal-Backward 验证机制
GSD 采用独特的"目标向后验证"策略:
- 从阶段目标出发,验证实际交付
- 确保交付成果符合承诺,而非仅完成任务清单
- 通过 `VERIFICATION.md` 文档化验证结果

### 2. 原子化提交策略
每个任务完成后立即创建原子化 commit:
- 每个任务一个 commit,便于回滚和审查
- 自动处理偏离情况,更新计划
- 支持检查点暂停和恢复

### 3. 分布式 Agent 协作
通过专用 Agent 实现关注点分离:
- 规划 Agent 专注于战略层面
- 执行 Agent 专注于战术实现
- 验证 Agent 专注于质量保证
- 避免单个 AI 的认知负担过重

### 4. Worktree 隔离开发
支持 Git Worktree 工作模式:
- 每个阶段在独立 worktree 中开发
- 保持主分支干净
- 支持并行阶段开发

### 5. 状态持久化
通过 STATE.md 实现跨会话状态管理:
- 记录当前进度、待办事项、检查点
- 支持会话中断后恢复
- 上下文传递与工作继续

### 6. UI 开发专项支持
为前端开发提供专门的工作流:
- UI-SPEC.md 设计契约文档
- 6 维度 UI 质量验证
- UI 审计与改进建议

## 🛠️ 使用场景

### 1. 新项目启动
```bash
/gsd:new-project
# 系统会:
# 1. 启动 gsd-project-researcher 研究项目生态
# 2. 启动 gsd-roadmapper 创建路线图
# 3. 生成 PROJECT.md 和 ROADMAP.md
# 4. 建立完整的阶段规划
```

### 2. 阶段规划与执行
```bash
/gsd:plan-phase <phase_number>
# 系统会:
# 1. 启动 gsd-phase-researcher 研究实现方案
# 2. 启动 gsd-planner 制定详细计划
# 3. 启动 gsd-plan-checker 验证计划质量
# 4. 生成 PLAN.md,等待用户批准
```

```bash
/gsd:execute-phase <phase_number>
# 系统会:
# 1. 启动 gsd-executor 执行计划
# 2. 创建原子化 commit
# 3. 处理偏离情况
# 4. 生成 SUMMARY.md
```

### 3. 验证与审计
```bash
/gsd:verify-work
# 系统会:
# 1. 启动 gsd-verifier 验证功能
# 2. 通过对话式 UAT 测试
# 3. 确认用户验收
# 4. 生成 VERIFICATION.md
```

### 4. 快速任务执行
```bash
/gsd:fast <task_description>
# 对于简单任务:
# 1. 直接执行,无需复杂规划
# 2. 自动创建 commit
# 3. 立即返回结果
```

### 5. 系统化调试
```bash
/gsd:debug
# 系统会:
# 1. 启动 gsd-debugger
# 2. 使用科学方法诊断问题
# 3. 管理调试会话状态
# 4. 提供修复方案
```

## 💡 最佳实践

### 1. 合理使用命令
- **复杂任务**: 使用完整流程 (`plan-phase` → `execute-phase` → `verify-work`)
- **中等任务**: 使用快速模式 (`fast`)
- **简单任务**: 直接对话执行

### 2. 阶段划分原则
- 每个阶段聚焦一个清晰目标
- 阶段间依赖关系明确
- 避免阶段过大(建议 3-7 天完成)

### 3. 检查点设置
- 在关键决策点设置检查点
- 需要用户确认时暂停
- 保持上下文完整

### 4. Worktree 使用建议
- 长期开发任务使用 worktree
- 快速迭代任务直接在主分支
- 定期清理完成的 worktree

### 5. 文档更新习惯
- 及时更新 STATE.md
- 维护 VERIFICATION.md
- 保留 DISCUSSION.md 记录

## 🔧 安装与更新

### 当前状态
- **安装版本**: 1.30.0
- **最新版本**: 1.34.2
- **更新可用**: ✅

### 更新方法
```bash
/gsd:update
# 系统会:
# 1. 检查最新版本
# 2. 显示变更日志
# 3. 执行安全更新
# 4. 重新应用本地修改
```

### 版本管理
- 版本信息存储在 `VERSION` 文件
- 文件清单通过 `gsd-file-manifest.json` 管理
- 支持变更追踪和回滚

## 📊 统计数据

### 系统规模
- **Agent 总数**: 18 个专用 Agent
- **命令总数**: 57+ 个工作流命令
- **模板文件**: 41 个标准化模板
- **参考文档**: 15 个技术规范
- **总文件数**: ~150 个系统文件

### 覆盖能力
- **项目生命周期**: 100% 全覆盖
- **开发场景**: 从原型到生产
- **质量保证**: 多层验证机制
- **协作支持**: 并行与持久化

## 🚀 未来展望

GSD 系统持续演进,未来计划:
- 更多专用 Agent 类型
- 更智能的计划生成
- 更完善的测试集成
- 更强大的状态管理
- 更友好的交互界面

## 📖 相关资源

- **安装目录**: `~/.claude/get-shit-done/`
- **命令目录**: `~/.claude/commands/gsd/`
- **Agent 目录**: `~/.claude/agents/`
- **模板目录**: `~/.claude/get-shit-done/templates/`
- **参考文档**: `~/.claude/get-shit-done/references/`

---

> 💡 GSD 通过结构化的工作流和专业化 Agent,让 Claude Code 成为真正的"开发伙伴",而非简单的代码生成工具。它把软件工程的最佳实践融入到 AI 辅助开发中,确保交付质量和项目可控性。