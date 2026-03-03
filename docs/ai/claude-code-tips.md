---
order: 22
---

# Claude Code 使用技巧指南

> 📅 主题：Claude Code CLI 工具的核心功能、常用命令与状态栏配置

## 一、什么是 Claude Code

**Claude Code** 是 Anthropic 官方推出的命令行交互工具，让开发者可以在终端中直接与 Claude 进行交互，完成代码编写、调试、重构等任务。

一句话理解：
**Claude Code = 终端 AI 助手 + 代码理解与生成 + 项目上下文感知。**

---

## 二、核心优势

1. **深度代码理解**
   - 自动读取项目上下文，理解代码结构
   - 支持多文件编辑和重构

2. **终端原生体验**
   - 无需切换 IDE，在终端中完成所有操作
   - 支持 Vim/Emacs 键位绑定

3. **灵活的模型选择**
   - 支持 Claude Opus 4.6、Sonnet 4.6、Haiku 4.5
   - 可连接自定义 API 端点

4. **丰富的扩展性**
   - 支持自定义状态栏
   - 支持 MCP（Model Context Protocol）扩展
   - 支持自定义 Hooks

---

## 三、常用命令速查

### 3.1 启动与基本操作

```bash
# 启动 Claude Code
claude

# 在特定目录启动
claude /path/to/project

# 使用特定模型
claude --model claude-sonnet-4-6
```

### 3.2 斜杠命令（Slash Commands）

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/clear` | 清空当前对话 |
| `/compact` | 压缩对话历史，释放上下文空间 |
| `/model` | 切换模型（如 `/model opus`） |
| `/config` | 打开配置对话框 |
| `/cost` | 显示当前会话的 token 使用统计 |
| `/permissions` | 管理工具权限设置 |
| `/review` | 代码审查模式 |
| `/init` | 初始化 CLAUDE.md 配置文件 |
| `/terminal-setup` | 设置终端键绑定 |
| `/mcp` | 管理 MCP 服务器 |
| `/vim` | 进入 Vim 模式 |
| `/bug` | 报告问题 |

### 3.3 快捷键

| 快捷键 | 说明 |
|--------|------|
| `Ctrl+C` | 取消当前输入或中断执行 |
| `Ctrl+D` | 退出 Claude Code |
| `↑` / `↓` | 浏览历史输入 |
| `Ctrl+R` | 搜索历史命令 |
| `Esc` (Vim 模式) | 切换到普通模式 |

### 3.4 后台任务管理

```bash
# 查看后台任务
/tasks

# 获取任务输出（带任务 ID）
# Claude 会自动显示任务列表
```

---

## 四、配置文件详解

### 4.1 配置文件位置

```
~/.claude/
├── settings.json      # 主配置文件
├── CLAUDE.md          # 项目级指导文件
└── projects/          # 项目配置缓存
```

### 4.2 settings.json 配置示例

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-token",
    "ANTHROPIC_BASE_URL": "https://api.anthropic.com",
    "ANTHROPIC_MODEL": "claude-sonnet-4-6"
  },
  "model": "claude-sonnet-4-6",
  "statusLine": {
    "type": "command",
    "command": "/opt/homebrew/bin/ccline"
  }
}
```

### 4.3 环境变量说明

| 变量 | 说明 |
|------|------|
| `ANTHROPIC_AUTH_TOKEN` | API 认证令牌 |
| `ANTHROPIC_BASE_URL` | API 端点地址 |
| `ANTHROPIC_MODEL` | 默认模型 |

---

## 五、状态栏配置（CCometixLine）

### 5.1 什么是状态栏

状态栏显示在 Claude Code 底部，可以展示：
- 当前模型信息
- Token 使用统计
- 上下文占用情况
- 自定义状态信息

### 5.2 安装 CCometixLine (ccline)

```bash
# 通过 npm 全局安装
npm install -g ccline

# 验证安装
ccline --version
```

### 5.3 配置状态栏

编辑 `~/.claude/settings.json`，添加：

```json
{
  "statusLine": {
    "type": "command",
    "command": "/opt/homebrew/bin/ccline"
  }
}
```

### 5.4 ccline 常用命令

```bash
# 查看帮助
ccline --help

# 进入 TUI 配置模式
ccline -c

# 设置主题
ccline -t <theme-name>

# 检查配置
ccline --check

# 初始化配置文件
ccline --init

# 检查更新
ccline -u
```

### 5.5 重启生效

配置完成后，重启 Claude Code 或运行 `/compact` 使状态栏生效。

---

## 六、CLAUDE.md 项目配置

### 6.1 什么是 CLAUDE.md

`CLAUDE.md` 是项目级配置文件，为 Claude 提供项目上下文和指导：

- 项目架构说明
- 常用命令
- 代码规范
- 开发注意事项

### 6.2 初始化 CLAUDE.md

```bash
# 在项目根目录运行
/init
```

### 6.3 示例结构

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview
[项目简介]

## Commands
[常用命令]

## Architecture
[架构说明]

## Code Style
[代码规范]
```

---

## 七、高级技巧

### 7.1 使用 Plan Mode

对于复杂任务，先规划再执行：

```
请进入规划模式，帮我设计一个用户认证系统的实现方案
```

### 7.2 多文件编辑

Claude Code 可以同时编辑多个文件：

```
帮我重构这个模块，将 User 相关的类移动到 user/ 目录下
```

### 7.3 后台执行长任务

```bash
# 运行测试在后台
npm test
# Claude 会自动检测并询问是否在后台运行
```

### 7.4 使用 Agent 处理复杂任务

```
使用 Explore agent 分析这个项目的数据库连接实现
```

---

## 八、常见问题

### Q: 如何切换到自定义 API 端点？

在 `settings.json` 中配置：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://your-custom-endpoint.com"
  }
}
```

### Q: 上下文太长怎么办？

使用 `/compact` 压缩对话历史，或开启新会话。

### Q: 如何查看 token 使用量？

使用 `/cost` 命令查看当前会话的统计信息。

### Q: 状态栏不显示？

1. 确认 ccline 已正确安装
2. 检查 settings.json 配置
3. 运行 `ccline --check` 验证配置
4. 重启 Claude Code

---

## 九、最佳实践

1. **善用 CLAUDE.md**：为每个项目创建清晰的指导文件
2. **合理选择模型**：简单任务用 Haiku，复杂任务用 Opus
3. **定期压缩上下文**：使用 `/compact` 保持会话高效
4. **配置状态栏**：实时了解 token 使用情况
5. **使用斜杠命令**：提高操作效率

---

## 十、参考资源

- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [CCometixLine GitHub](https://github.com/nicholasxuuy/ccline)
- [Anthropic API 文档](https://docs.anthropic.com)

---

> 💡 持续更新中，掌握 Claude Code 让开发效率翻倍！