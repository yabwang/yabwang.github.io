---
order: 2
---

# OpenCLI：让 AI Agent 直接操控浏览器的新范式

> 📅 主题：OpenCLI 开源项目深度解析 — 网站、Electron 应用、本地工具一键变 CLI

## 一、什么是 OpenCLI

**OpenCLI** 是一个创新的命令行工具，可以将**任何网站**、**Electron 应用**或**本地 CLI 工具**变成可编程的命令行接口。

一句话理解：
**OpenCLI = 浏览器自动化 + AI Agent 控制层 + CLI Hub 集成中心。**

它解决了 AI Agent 操作网页的核心痛点：让 Claude、Cursor 等 AI 能够直接操控浏览器，执行点击、输入、提取数据等操作，并将这些交互固化成可复用的 CLI 命令。

---

## 二、核心亮点

### 2.1 浏览器会话复用

OpenCLI 的最大创新在于**复用 Chrome/Chromium 的登录状态**：

```
传统方案：AI Agent → 模拟浏览器 → 重新登录 → 获取数据
OpenCLI：AI Agent → 连接已登录的浏览器 → 直接获取数据
```

这意味着：
- 你的账号密码永远不会离开浏览器
- 不需要管理复杂的登录逻辑
- 可以直接使用已经登录好的网站

### 2.2 反检测内置

针对网站的反爬虫机制，OpenCLI 在多层做了对抗措施：

| 检测点 | OpenCLI 对抗方案 |
|--------|-----------------|
| `navigator.webdriver` | Patch 为 undefined |
| `window.chrome` | 伪造 Chrome 对象 |
| ChromeDriver 特征 | 清除全局变量 |
| CDP frames | 清除 Error stack trace |
| 插件列表 | 伪造常见插件 |

### 2.3 CLI Hub 集成

OpenCLI 可以作为所有命令行工具的统一入口：

```bash
# 自动发现并调用外部 CLI
opencli gh pr list --limit 5      # GitHub CLI
opencli docker ps                 # Docker
opencli obsidian search query="AI" # Obsidian

# 如果工具未安装，自动执行 brew install
```

通过 `opencli register mycli` 可以注册任意本地 CLI，让 AI Agent 自动发现。

### 2.4 Electron 应用 CLI 化

这是一个突破性功能：**把 Electron 桌面应用变成 CLI 工具**。

目前支持的应用：

| 应用 | 功能 |
|------|------|
| Cursor IDE | 控制 Composer、聊天、代码提取 |
| ChatGPT macOS | 自动化桌面版 ChatGPT |
| Notion | 搜索、读取、写入页面 |
| Discord | 消息、频道、服务器管理 |
| Antigravity | 控制 AI 应用本身 |

这意味着 **AI 可以控制其他 AI 应用**，形成递归式的自动化能力。

---

## 三、技术架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   AI Agent      │────→│   OpenCLI       │────→│   Browser       │
│  (Claude/Cursor)│     │   Daemon        │     │   (Chrome/CDP)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              ↓
                        ┌─────────────────┐
                        │ Browser Bridge  │
                        │   Extension     │
                        └─────────────────┘
```

### 3.1 Browser Bridge 扩展

这是一个轻量级的 Chrome 扩展 + 微守护进程：
- 零配置，自动启动
- 与 OpenCLI daemon 保持连接
- 负责接收和执行浏览器操作指令

### 3.2 通信协议

基于 Chrome DevTools Protocol (CDP)：
- 页面导航、点击、输入
- DOM 元素查询、数据提取
- 网络请求拦截

### 3.3 动态加载器

只需将 `.ts` 或 `.yaml` 适配器放入 `clis/` 目录即可自动注册：

```yaml
# 示例：最简 YAML 适配器
site: example
commands:
  hot:
    url: https://example.com/hot
    selector: .hot-list
    schema:
      title: .title
      url: .link
```

---

## 四、内置命令覆盖

OpenCLI 内置了 **79+ 网站适配器**，覆盖国内外主流平台：

### 4.1 国内平台

| 平台 | 命令示例 |
|------|---------|
| 小红书 | `search`, `note`, `comments`, `publish` |
| Bilibili | `hot`, `search`, `download`, `comments` |
| 知乎 | 热榜、搜索、文章导出 |
| 贴吧 | `hot`, `posts`, `search` |
| 虎扑 | `hot`, `search`, `detail` |
| 闲鱼 | `search`, `item`, `chat` |
| 豆瓣 | 图片下载、电影信息 |

### 4.2 国际平台

| 平台 | 命令示例 |
|------|---------|
| Twitter/X | `trending`, `search`, `download`, `thread` |
| Reddit | `hot`, `frontpage`, `search`, `subreddit` |
| HackerNews | `top`, `new`, `best` |
| YouTube | 视频信息、下载 |
| Amazon | `bestsellers`, `search`, `product` |
| Spotify | `play`, `pause`, `search`, `queue` |

### 4.3 AI 相关平台

| 平台 | 功能 |
|------|------|
| Gemini | `new`, `ask`, `deep-research` |
| NotebookLM | 笔记本管理、源文件操作 |
| 腾讯元宝 | `new`, `ask` |

---

## 五、快速上手

### 5.1 安装浏览器扩展

1. 从 GitHub Releases 下载 `opencli-extension.zip`
2. 解压后在 `chrome://extensions` 加载扩展
3. 启用开发者模式

### 5.2 安装 OpenCLI

```bash
# npm 安装
npm install -g @jackwener/opencli

# 安装 AI Skills
npx skills add jackwener/opencli
```

### 5.3 验证安装

```bash
opencli doctor          # 检查扩展 + daemon 连接
opencli daemon status   # 查看守护进程状态
```

### 5.4 快速测试

```bash
# 公开 API，无需浏览器
opencli hackernews top --limit 5

# 需要浏览器登录状态
opencli bilibili hot --limit 5
opencli xiaohongshu search "AI绘画"
```

---

## 六、AI Agent 集成

这是 OpenCLI 最强大的功能：为 AI Agent 提供直接的浏览器控制能力。

### 6.1 operate 命令族

```bash
opencli operate open https://example.com
opencli operate click .submit-button
opencli operate type .search-box "关键词"
opencli operate get .result-list
opencli operate screenshot
opencli operate close
```

完整命令：`open`, `state`, `click`, `type`, `select`, `keys`, `wait`, `get`, `screenshot`, `scroll`, `back`, `eval`, `network`, `init`, `verify`, `close`

### 6.2 Skill 配置

将 `opencli-operate` skill 加载到 AI Agent：

```bash
npx skills add jackwener/opencli --skill opencli-operate
```

然后在 `AGENT.md` 或 `.cursorrules` 中配置：

```markdown
## Available Tools
Run `opencli list` to discover all CLI commands.
```

这样 AI Agent 就能自动发现并调用所有可用工具。

---

## 七、开发新适配器

OpenCLI 提供了完整的开发工具链：

```bash
# 探索网站 API
opencli explore https://example.com --site mysite

# 自动生成 YAML 适配器
opencli synthesize mysite

# 一键生成：探索 → 合成 → 注册
opencli generate https://example.com --goal "hot"
```

### 7.1 认证策略决策树

OpenCLI 内置了 5 层认证策略：

```
PUBLIC → COOKIE → HEADER → CDP → OPERATE
```

从最简单的公开 API，到需要浏览器操作的复杂场景，自动选择最优方案。

---

## 八、输出格式

所有命令支持多种输出格式：

```bash
opencli bilibili hot -f json    # JSON 格式
opencli bilibili hot -f yaml    # YAML 格式
opencli bilibili hot -f csv     # CSV 格式
opencli bilibili hot -f md      # Markdown 格式
opencli bilibili hot -v         # 详细调试信息
```

---

## 九、退出码约定

遵循 Unix `sysexits.h` 规范，便于 CI 集成：

| 代码 | 含义 | 场景 |
|------|------|------|
| 0 | 成功 | 命令正常完成 |
| 66 | 空结果 | 无数据返回 |
| 69 | 服务不可用 | Browser Bridge 未连接 |
| 75 | 临时失败 | 命令超时，可重试 |
| 77 | 需认证 | 未登录目标网站 |

---

## 十、插件生态

社区已贡献多个插件：

| 插件 | 功能 |
|------|------|
| opencli-plugin-github-trending | GitHub Trending |
| opencli-plugin-hot-digest | 多平台热点聚合 |
| opencli-plugin-juejin | 稀土掘金热门文章 |
| opencli-plugin-vk | VK 社交平台 |

安装插件：

```bash
opencli plugin install github:user/opencli-plugin-my-tool
```

---

## 十一、总结

OpenCLI 代表了一种新的 AI Agent 与 Web 交互范式：

1. **安全性**：复用已登录浏览器，凭证不外泄
2. **确定性**：CLI 输出结构化，可管道、可脚本化
3. **零成本**：运行时不消耗 LLM token
4. **可扩展**：YAML/TS 动态加载器，插件生态
5. **AI Ready**：内置 Skills，让 AI Agent 自动发现工具

对于 AI Agent 开发者，OpenCLI 提供了从浏览器探索到适配器生成的完整工具链，大幅降低了 Web 自动化的开发成本。

---

## 参考资料

- [OpenCLI GitHub 仓库](https://github.com/jackwener/opencli)
- [OpenCLI 官方文档](https://opencli.org/)
- [opencli-operate Skill 文档](https://github.com/jackwener/opencli/blob/main/skills/opencli-operate/SKILL.md)
- [适配器开发指南](https://github.com/jackwener/opencli/blob/main/skills/opencli-explorer/SKILL.md)

---

> 💡 OpenCLI 正在快速发展，当前版本已支持 79+ 网站适配器和多个 Electron 桌面应用。欢迎贡献新的适配器和插件！