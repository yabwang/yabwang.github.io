---
order: 4
---

# MCPorter：TypeScript 中调用 MCP 的完整工具链

> 📅 主题：steipete 开源项目深度解析 — MCP 发现、调用、CLI 生成一站式解决方案

## 一、项目定位

**MCPorter** 是由 Peter Steinberger（steipete）开发的 MCP（Model Context Protocol）工具链，核心理念：

```
让 MCP 从配置文件走向实际代码执行
```

一句话理解：
**MCPorter = MCP 配置发现 + CLI/TS 调用 + 类型生成 + 一键 CLI 打包。**

它解决了 MCP 开发的核心痛点：让开发者能够直接调用已配置的 MCP 服务，无需手写复杂的连接代码或解析 JSON Schema。

---

## 二、核心能力

| 能力 | 描述 |
|------|------|
| **零配置发现** | 自动合并 ~/.mcporter + 项目配置 + Cursor/Claude/Codex 等导入 |
| **一键 CLI 生成** | 将任何 MCP 服务转为可分发 CLI |
| **类型化客户端** | 生成 `.d.ts` 或完整客户端包装器 |
| **友好 API** | camelCase 方法、自动参数映射、结果助手 |
| **OAuth/stdio 支持** | 内置 OAuth 缓存、日志追踪、进程包装 |
| **守护进程管理** | 状态 MCP 服务保持活跃 |

---

## 三、快速上手

### 3.1 安装

```bash
# npx 即用
npx mcporter list

# 项目安装
pnpm add mcporter

# Homebrew
brew tap steipete/tap
brew install steipete/tap/mcporter
```

### 3.2 调用语法

MCPorter 支持多种调用方式：

```bash
# 冒号分隔（Shell友好）
npx mcporter call linear.create_comment issueId:ENG-123 body:'Looks good!'

# 函数调用风格
npx mcporter call 'linear.create_comment(issueId: "ENG-123", body: "Looks good!")'

# 等号语法
npx mcporter call server.tool title=value team=value

# 直接 URL
npx mcporter call https://mcp.linear.app/mcp.list_issues assignee=me
```

### 3.3 列出 MCP 服务

```bash
# 列出所有服务
npx mcporter list

# 查看特定服务（带 Schema）
npx mcporter list context7 --schema

# 直接指向 URL
npx mcporter list https://mcp.linear.app/mcp --all-parameters
```

输出类似 TypeScript 头文件：

```ts
linear - Hosted Linear MCP; exposes issue search, create, and workflow tooling.
  23 tools · 1654ms · HTTP https://mcp.linear.app/mcp

  /**
   * Create a comment on a specific Linear issue
   * @param issueId The issue ID
   * @param body The content of the comment as Markdown
   */
  function create_comment(issueId: string, body: string);
```

---

## 四、配置发现机制

MCPorter 自动发现系统上已配置的 MCP：

```
配置优先级:
1. --config <path>（显式指定）
2. MCPORTER_CONFIG 环境变量
3. <root>/config/mcporter.json（项目）
4. ~/.mcporter/mcporter.json（用户）
```

**自动导入**：支持从以下工具导入配置：
- Cursor
- Claude Code / Claude Desktop
- Codex
- Windsurf
- OpenCode
- VS Code

配置示例：

```jsonc
{
  "mcpServers": {
    "context7": {
      "baseUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "Authorization": "$env:CONTEXT7_API_KEY"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  },
  "imports": ["cursor", "claude-code", "windsurf"]
}
```

MCPorter 自动处理：
- `${VAR}` 和 `$env:VAR` 环境变量插值
- OAuth token 缓存
- stdio 命令继承配置文件目录

---

## 五、代码调用

### 5.1 单次调用

```ts
import { callOnce } from "mcporter";

const result = await callOnce({
  server: "firecrawl",
  toolName: "crawl",
  args: { url: "https://anthropic.com" },
});

console.log(result); // 原始 MCP envelope
```

### 5.2 Runtime API

```ts
import { createRuntime } from "mcporter";

const runtime = await createRuntime();

// 连接池、OAuth 会话复用
const tools = await runtime.listTools("context7");
const result = await runtime.callTool("context7", "resolve-library-id", {
  args: { libraryName: "react" },
});

await runtime.close(); // 关闭所有传输
```

### 5.3 Server Proxy

```ts
import { createRuntime, createServerProxy } from "mcporter";

const runtime = await createRuntime();
const chrome = createServerProxy(runtime, "chrome-devtools");
const linear = createServerProxy(runtime, "linear");

// camelCase 方法自动映射到 kebab-case
const snapshot = await chrome.takeSnapshot();
console.log(snapshot.text());

const docs = await linear.searchDocumentation({ query: "automations" });
console.log(docs.json());
```

**结果助手**：
- `.text()` — 文本输出
- `.markdown()` — Markdown 输出
- `.json()` — JSON 解析
- `.images()` — 图片块
- `.content()` — 全部内容
- `.raw` — 原始 envelope

---

## 六、CLI 生成

一键将 MCP 服务转为独立 CLI：

```bash
# 从 URL 生成
npx mcporter generate-cli --command https://mcp.context7.com/mcp

# 从本地配置
npx mcporter generate-cli linear --bundle dist/linear.js

# 编译为二进制（需要 Bun）
npx mcporter generate-cli chrome-devtools --compile
```

输出：
- `context7.ts` — TypeScript 模板（内嵌 Schema）
- `context7.js` — 打包 CLI

**高级选项**：

| 选项 | 说明 |
|------|------|
| `--name` | 自定义 CLI 名称 |
| `--description` | 自定义帮助摘要 |
| `--bundle` | 打包输出 |
| `--compile` | 编译为二进制 |
| `--include-tools` | 只包含指定工具 |
| `--exclude-tools` | 排除指定工具 |
| `--from` | 从现有 CLI 重新生成 |

生成的 CLI 内嵌元数据，可用 `mcporter inspect-cli` 查看。

---

## 七、类型生成

生成强类型接口：

```bash
# 类型接口
npx mcporter emit-ts linear --out types/linear-tools.d.ts

# 客户端包装器
npx mcporter emit-ts linear --mode client --out clients/linear.ts
```

**模式对比**：

| 模式 | 输出 | 用途 |
|------|------|------|
| `types` | `.d.ts` | 仅类型定义 |
| `client` | `.d.ts` + `.ts` | 完整客户端工厂 |

---

## 八、守护进程管理

状态 MCP 服务（如 Chrome DevTools）通过守护进程保持活跃：

```bash
# 查看状态
mcporter daemon status

# 启动守护进程
mcporter daemon start

# 停止守护进程
mcporter daemon stop

# 重启
mcporter daemon restart

# 带日志
mcporter daemon start --log --log-file /tmp/daemon.log
```

配置中设置生命周期：

```jsonc
{
  "mcpServers": {
    "chrome-devtools": {
      "lifecycle": "keep-alive"  // 守护进程管理
    }
  }
}
```

---

## 九、OAuth 认证

OAuth 保护的 MCP 服务（如 Vercel、Supabase）自动处理认证：

```bash
# 完成登录
npx mcporter auth vercel

# 直接 URL
npx mcporter auth https://mcp.linear.app/mcp

# 带超时
mcporter auth --oauth-timeout 30000
```

Token 缓存到 `~/.mcporter/<server>/`。

---

## 十、配置管理

交互式管理 MCP 配置：

```bash
# 列出本地配置
mcporter config list

# 查看详情（支持模糊匹配）
mcporter config get linar  # 自动纠正为 linear

# 添加服务
mcporter config add my-server https://api.example.com/mcp

# 删除服务
mcporter config remove my-server

# 从编辑器导入
mcporter config import cursor --copy

# 登出 OAuth
mcporter config logout vercel
```

---

## 十一、实用示例

### Context7 文档搜索

```bash
# 无需认证
npx mcporter call context7.resolve-library-id libraryName=react
npx mcporter call context7.get-library-docs context7CompatibleLibraryID=/websites/react_dev topic=hooks
```

### Linear 搜索

```bash
LINEAR_API_KEY=sk_linear_example npx mcporter call linear.search_documentation query="automations"
```

### Chrome DevTools 截图

```bash
npx mcporter call chrome-devtools.take_snapshot
```

### Vercel 文档

```bash
npx mcporter auth vercel  # 先完成 OAuth
npx mcporter call vercel.search_vercel_documentation topic="routing"
```

---

## 十二、架构设计

```
┌─────────────────────────────────────────────────────────────────┐
│                     MCPorter CLI / Runtime                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Config       │  │ Discovery    │  │ Connection   │          │
│  │ Resolver     │→ │ Engine       │→ │ Pool         │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Call Parser  │  │ Server Proxy │  │ Result Helper│          │
│  │ (多语法支持) │  │ (camelCase)  │  │ (.text/json) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ CLI Generator│  │ TS Emitter   │  │ Daemon       │          │
│  │ (打包/编译)  │  │ (.d.ts/client)│  │ Manager      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     MCP Servers                                  │
│  HTTP (OAuth) │ STDIO │ SSE │ Streamable HTTP                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 十三、相关项目

作者 steipete 的其他项目：

| 项目 | 说明 |
|------|------|
| **CodexBar** | macOS 菜单栏显示 Codex token 窗口 |
| **Trimmy** | 多行 shell 片段扁平化工具 |
| **Oracle** | 多模型 Prompt 打包器（GPT/Claude/Gemini） |

---

## 十四、总结

MCPorter 提供了 MCP 开发的完整工具链：

| 功能 | 价值 |
|------|------|
| **零配置** | 自动发现 Cursor/Claude/Codex 配置 |
| **多语法** | CLI 风格 + 函数调用风格 |
| **强类型** | 自动生成 `.d.ts` 接口 |
| **CLI 打包** | 一键生成可分发 CLI |
| **守护进程** | 状态服务保持活跃 |
| **OAuth** | 自动处理认证流程 |

对于 MCP 开发者和 AI Agent 构建者，MCPorter 大幅降低了 MCP 集成的复杂度。

---

## 参考资料

- [MCPorter GitHub 仓库](https://github.com/steipete/mcporter)
- [CLI 参考文档](https://github.com/steipete/mcporter/blob/main/docs/cli-reference.md)
- [调用语法文档](https://github.com/steipete/mcporter/blob/main/docs/call-syntax.md)
- [类型生成文档](https://github.com/steipete/mcporter/blob/main/docs/emit-ts.md)
- [MCP 规范](https://github.com/modelcontextprotocol/specification)

---

> 💡 MCPorter 正在快速发展，支持多种 MCP 传输协议和主流 AI 编辑器配置导入！