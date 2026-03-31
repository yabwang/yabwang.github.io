---
order: 15
---

# Learn Claude Code：深入理解 AI Agent 开发

> 📅 一个从零到一学习 AI Agent 开发的系列教程，基于 Claude Code 实战经验总结

## 📚 系列目录

本系列共 12 篇文章，从基础循环到高级团队协作，逐步深入 AI Agent 开发核心概念。

### 第一部分：基础架构

| 章节 | 标题 | 核心内容 |
|------|------|----------|
| [s01](/ai/lear-claude-code/zh/s01-the-agent-loop) | The Agent Loop | Agent 循环：一个工具 + 一个循环 = 一个 Agent |
| [s02](/ai/lear-claude-code/zh/s02-tool-use) | Tool Use | 工具使用：从 Bash 到 Function Calling |
| [s03](/ai/lear-claude-code/zh/s03-todo-write) | Todo Write | 任务追踪：TodoWrite 工具与任务管理 |
| [s04](/ai/lear-claude-code/zh/s04-subagent) | Subagent | 子 Agent：委托复杂任务给专业化 Agent |

### 第二部分：进阶能力

| 章节 | 标题 | 核心内容 |
|------|------|----------|
| [s05](/ai/lear-claude-code/zh/s05-skill-loading) | Skill Loading | 技能加载：动态扩展 Agent 能力 |
| [s06](/ai/lear-claude-code/zh/s06-context-compact) | Context Compact | 上下文压缩：突破上下文窗口限制 |
| [s07](/ai/lear-claude-code/zh/s07-task-system) | Task System | 任务系统：Task 工具与异步执行 |
| [s08](/ai/lear-claude-code/zh/s08-background-tasks) | Background Tasks | 后台任务：并行执行与资源管理 |

### 第三部分：团队协作

| 章节 | 标题 | 核心内容 |
|------|------|----------|
| [s09](/ai/lear-claude-code/zh/s09-agent-teams) | Agent Teams | Agent 团队：多 Agent 协作架构 |
| [s10](/ai/lear-claude-code/zh/s10-team-protocols) | Team Protocols | 团队协议：Agent 间通信与协调 |
| [s11](/ai/lear-claude-code/zh/s11-autonomous-agents) | Autonomous Agents | 自主 Agent：从被动响应到主动决策 |
| [s12](/ai/lear-claude-code/zh/s12-worktree-task-isolation) | Worktree & Task Isolation | Worktree 隔离：并行任务的安全边界 |

---

## 🎯 学习路径

**入门阶段**（s01-s04）：
- 理解 Agent 循环的本质
- 掌握工具调用机制
- 学会任务追踪与子 Agent 委托

**进阶阶段**（s05-s08）：
- 动态技能扩展
- 上下文管理策略
- 异步任务与后台执行

**高级阶段**（s09-s12）：
- 多 Agent 协作设计
- 团队协议与通信
- 自主决策与任务隔离

---

## 💡 核心洞见

> *"One loop & Bash is all you need"*

Agent 开发的本质是：
1. **循环**：持续运行直到任务完成
2. **工具**：连接 LLM 与真实世界的桥梁
3. **状态**：追踪进度、管理上下文
4. **协作**：委托、并行、协调

---

> 📖 本系列基于 Claude Code 实战经验整理，适合有一定 Agent 开发基础的开发者深入学习。