---
order: 27
---

# CLI-Anything：让所有软件变成 AI Agent 可操控的工具

> 📅 主题：HKUDS 开源项目深度解析 — 7 阶段自动化 CLI 生成方法论

## 一、项目愿景

**CLI-Anything** 由香港大学数据科学实验室（HKUDS）开发，核心理念是：

```
今天的软件服务于人类 👨‍💻
明天的用户将是 AI Agent 🤖
```

一句话理解：
**CLI-Anything = 软件代码分析 → 自动生成 CLI → AI Agent 直接操控。**

它解决了 AI Agent 与专业软件之间的鸿沟：让 Claude、Cursor 等 AI 能够直接使用 GIMP、Blender、LibreOffice 等专业软件的完整功能，而不是通过脆弱的 UI 自动化或受限的 API。

---

## 二、核心痛点与解决方案

### 2.1 现存问题

| 痛点 | 描述 |
|------|------|
| AI 无法使用真实工具 | 只能操作简化版本，丢失 90% 功能 |
| UI 自动化脆弱 | 截图、点击方式容易失败，维护成本高 |
| 缺乏结构化输出 | Agent 需要解析复杂的 GUI 输出 |
| 自定义集成昂贵 | 每个软件都需要单独开发接口 |

### 2.2 CLI-Anything 的方案

| 解决方案 | 说明 |
|----------|------|
| 直接调用真实软件 | Blender 渲染 3D 场景、LibreOffice 生成 PDF |
| 纯命令行接口 | 无截图、无点击，可靠性极高 |
| 内置 JSON 输出 | Agent 直接消费结构化数据 |
| 一键自动生成 | 分析源码 → 7 阶段流程 → 完整 CLI |

---

## 三、7 阶段自动化流程

CLI-Anything 的核心是一个全自动的 7 阶段生成流程：

```
Phase 1: 🔍 分析    — 扫描源码，映射 GUI 动作到 API
Phase 2: 📐 设计    — 设计命令组、状态模型、输出格式
Phase 3: 🔨 实现    — 构建 Click CLI + REPL + JSON 输出
Phase 4: 📋 测试规划 — 创建单元 + E2E 测试计划
Phase 5: 🧪 测试实现 — 实现完整测试套件
Phase 6: 📝 文档    — 更新测试结果文档
Phase 7: 📦 发布    — 创建 setup.py，安装到 PATH
```

整个过程只需一个命令：

```bash
/cli-anything:cli-anything ./gimp
```

---

## 四、支持平台

CLI-Anything 设计为平台无关，已支持多个 AI Agent 平台：

| 平台 | 安装方式 |
|------|---------|
| **Claude Code** | `/plugin marketplace add HKUDS/CLI-Anything` |
| **OpenCode** | 复制命令到 `.opencode/commands/` |
| **Codex** | `bash codex-skill/scripts/install.sh` |
| **OpenClaw** | 复制 `SKILL.md` 到技能目录 |
| **Qodercli** | `bash qoder-plugin/setup-qodercli.sh` |
| **Goose** | 通过 CLI Provider 使用 |
| **GitHub Copilot CLI** | `copilot plugin install ./cli-anything-plugin` |

---

## 五、已生成 CLI 覆盖

项目已为 **25+ 软件** 生成完整的 CLI，涵盖多个领域：

### 5.1 创意与媒体

| 软件 | 领域 | 测试数量 | 后端 |
|------|------|----------|------|
| GIMP | 图像编辑 | 107 | Pillow + GEGL/Script-Fu |
| Blender | 3D 建模 | 208 | bpy (Python) |
| Inkscape | 矢量图 | 202 | SVG/XML 操控 |
| Audacity | 音频处理 | 161 | Python wave + sox |
| Kdenlive | 视频编辑 | 155 | MLT XML + melt |
| Shotcut | 视频编辑 | 154 | MLT XML + melt |
| OBS Studio | 直播录制 | 153 | JSON scene + obs-websocket |
| MuseScore | 音乐排版 | 56 | mscore CLI |

### 5.2 办公与协作

| 软件 | 领域 | 测试数量 | 后端 |
|------|------|----------|------|
| LibreOffice | 办公套件 | 158 | ODF + headless LO |
| Zotero | 文献管理 | New | SQLite + API |
| Mubu | 知识管理 | 96 | 本地数据 + 同步日志 |
| Zoom | 视频会议 | 22 | REST API (OAuth2) |

### 5.3 图表与可视化

| 软件 | 领域 | 测试数量 | 后端 |
|------|------|----------|------|
| Draw.io | 图表绘制 | 138 | mxGraph XML |
| Mermaid | 流程图 | 10 | mermaid.ink 渲染 |

### 5.4 AI 相关

| 软件 | 领域 | 测试数量 | 后端 |
|------|------|----------|------|
| ComfyUI | AI 图像生成 | 70 | REST API |
| Ollama | 本地 LLM | 98 | REST API |
| NotebookLM | AI 研究助手 | 21 | CLI wrapper |
| AnyGen | AI 内容生成 | 50 | REST API |

### 5.5 其他

| 软件 | 领域 | 测试数量 |
|------|------|----------|
| AdGuard Home | 网络广告拦截 | 36 |
| Godot Engine | 游戏开发 | 24 |
| RenderDoc | GPU 调试 | 59 |
| CloudCompare | 3D 点云 | 88 |
| Exa | AI 搜索 | 40 |
| VideoCaptioner | 视频字幕 | 26 |

> **总计 2,045 个测试，100% 通过率**

---

## 六、CLI-Hub：社区 CLI 发现中心

CLI-Anything 提供了 **CLI-Hub** — 一个中心化的 CLI 注册中心：

```bash
# Agent 自动发现并安装需要的 CLI
openclaw skills install cli-anything-hub

# 然后让 Agent 自己选择
"Find appropriate CLI software in CLI-Hub and complete the task: <your task>"
```

Agent 会：
1. 浏览 CLI-Hub 目录
2. 选择合适的 CLI
3. 自动安装并使用

---

## 七、技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Agent                                  │
│                    (Claude Code / Cursor)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ /cli-anything
┌─────────────────────────────────────────────────────────────────┐
│                    CLI-Anything Plugin                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Phase 1  │→│ Phase 2  │→│ Phase 3  │→│ Phase 4-7│           │
│  │ 分析     │ │ 设计     │ │ 实现     │ │ 测试发布 │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ 生成的 CLI
┌─────────────────────────────────────────────────────────────────┐
│              cli-anything-<software>                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ REPL     │ │ JSON     │ │ Undo/Redo│ │ SKILL.md │           │
│  │ 交互模式 │ │ 输出     │ │ 状态管理 │ │ Agent发现│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓ 调用真实软件
┌─────────────────────────────────────────────────────────────────┐
│                    Real Software                                 │
│          (GIMP / Blender / LibreOffice / ...)                   │
└─────────────────────────────────────────────────────────────────┘
```

### 7.1 核心设计原则

1. **真实软件集成** — CLI 生成有效的项目文件，调用真实应用渲染
2. **灵活交互模式** — REPL 交互 + 子命令脚本，双模式支持
3. **一致用户体验** — 统一的 REPL 接口、品牌 banner、样式化提示
4. **Agent 原生设计** — 内置 `--json` 标志，结构化数据输出
5. **零妥协依赖** — 真实软件是硬性要求，测试失败而非跳过

---

## 八、使用示例

### 8.1 LibreOffice CLI

```bash
# 创建 Writer 文档
cli-anything-libreoffice document new -o report.json --type writer

# 添加标题
cli-anything-libreoffice --project report.json writer add-heading -t "Q1 Report" --level 1

# 导出为 PDF
cli-anything-libreoffice --project report.json export render output.pdf -p pdf --overwrite

# JSON 输出（供 Agent 使用）
cli-anything-libreoffice --json document info --project report.json
{
  "name": "Q1 Report",
  "type": "writer",
  "pages": 1,
  "elements": 2,
  "modified": true
}
```

### 8.2 Blender REPL 模式

```
$ cli-anything-blender
╔══════════════════════════════════════════╗
║       cli-anything-blender v1.0.0       ║
║     Blender CLI for AI Agents           ║
╚══════════════════════════════════════════╝

blender> scene new --name ProductShot
✓ Created scene: ProductShot

blender[ProductShot]> object add-mesh --type cube --location 0 0 1
✓ Added mesh: Cube at (0, 0, 1)

blender[ProductShot]*> render execute --output render.png --engine CYCLES
✓ Rendered: render.png (1920×1080, 2.3 MB)
```

---

## 九、SKILL.md 自动生成

每个生成的 CLI 都包含一个 `SKILL.md` 文件，让 AI Agent 自动发现和使用：

```yaml
---
name: cli-anything-blender
description: Blender CLI for AI agents - 3D modeling, rendering, scene management
---

# Commands
- scene: new, info, list
- object: add-mesh, add-light, transform
- render: execute, settings
- export: format, output
```

Agent 可以：
1. 通过 REPL banner 显示的路径找到 SKILL.md
2. 了解所有可用命令
3. 直接使用 CLI 完成任务

---

## 十、关键经验教训

项目文档 `HARNESS.md` 总结了生成 CLI 的关键教训：

| 教训 | 说明 |
|------|------|
| **使用真实软件** | CLI 必须调用实际应用渲染，不能用简化替代 |
| **渲染鸿沟** | GUI 应用在渲染时应用效果，需正确的滤镜转换 |
| **滤镜转换** | 格式间映射需处理重复合并、参数空间差异 |
| **时间码精度** | 非整数帧率（29.97fps）需用 `round()` 而非 `int()` |
| **输出验证** | 检查 magic bytes、ZIP 结构、像素分析、时长 |

---

## 十一、实际演示

项目提供了多个真实演示：

### Draw.io HTTPS 握手图

Agent 通过 CLI 创建完整的 HTTPS 连接生命周期图：
- TCP 三次握手
- TLS 协商
- 加密数据交换
- TCP 四次终止

### Slay the Spire II 游戏自动化

Agent 使用 CLI 进行游戏：
- 读取游戏状态
- 选择卡牌
- 选择路径
- 实时战略决策

### VideoCaptioner 字幕生成

Agent 自动生成并叠加字幕：
- 双语文本渲染
- 可定制格式

---

## 十二、项目结构

```
cli-anything/
├── cli-anything-plugin/          # Claude Code 插件
│   ├── HARNESS.md                # 方法论 SOP（核心文档）
│   ├── commands/                 # 命令定义
│   └── repl_skin.py              # 统一 REPL 接口
│
├── gimp/agent-harness/           # GIMP CLI
├── blender/agent-harness/        # Blender CLI
├── libreoffice/agent-harness/    # LibreOffice CLI
├── ...                           # 其他 25+ CLI
│
├── cli-hub-meta-skill/           # CLI-Hub meta skill
├── codex-skill/                  # Codex 技能
└── opencode-commands/            # OpenCode 命令
```

---

## 十三、局限性与路线图

### 当前局限

| 局限 | 说明 |
|------|------|
| 需要强大模型 | 依赖 Claude Opus 4.6 等前沿模型 |
| 需要源码访问 | 编译二进制需要反编译，质量下降 |
| 可能需要迭代 | 单次运行可能未完全覆盖，需 `/refine` 补充 |

### 未来路线

- 支持更多应用类别（CAD、DAW、IDE、EDA）
- Agent 任务完成率基准测试套件
- 社区贡献的内部/定制软件 CLI
- 封闭源软件和 Web 服务 CLI

---

## 十四、总结

CLI-Anything 代表了 AI Agent 与软件交互的新范式：

| 特性 | 价值 |
|------|------|
| **真实性** | 使用完整专业软件功能，无妥协 |
| **可靠性** | 命令行接口，无脆弱的 UI 自动化 |
| **自动化** | 7 阶段流程一键完成 |
| **可发现** | SKILL.md 让 Agent 自动发现工具 |
| **生产级** | 2,045+ 测试，100% 通过 |

对于 AI Agent 开发者，CLI-Anything 提供了将任何软件变成 Agent 工具的完整方法论，大幅降低了专业软件自动化的门槛。

---

## 参考资料

- [CLI-Anything GitHub 仓库](https://github.com/HKUDS/CLI-Anything)
- [CLI-Hub 官方网站](https://hkuds.github.io/CLI-Anything/)
- [HARNESS.md 方法论文档](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/HARNESS.md)
- [PUBLISHING.md 发布指南](https://github.com/HKUDS/CLI-Anything/blob/main/cli-anything-plugin/PUBLISHING.md)

---

> 💡 CLI-Anything 正在快速发展，已支持 25+ 软件。欢迎贡献新的 CLI 或改进方法论！