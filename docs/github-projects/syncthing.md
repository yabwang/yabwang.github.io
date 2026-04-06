---
order: 1
---

# Syncthing - 开源 P2P 文件同步工具

## 项目简介

**Syncthing** 是一个开源的持续文件同步程序，可以在两台或多台计算机之间实时同步文件。

| 属性 | 信息 |
|------|------|
| GitHub | [syncthing/syncthing](https://github.com/syncthing/syncthing) |
| Stars | 81,455+ ⭐ |
| 最新版本 | v2.0.15 |
| 许可证 | MPL-2.0 |
| 支持平台 | Windows, macOS, Linux, Android, iOS |

## 核心特点

### 🔒 隐私优先

- **数据不经过云端** — 文件直接在设备间传输，无需第三方服务器
- **端到端加密** — 所有传输都经过 TLS 加密
- **开源透明** — 代码完全公开，可审计安全性

### 🌐 跨平台支持

| 平台 | 支持情况 |
|------|----------|
| Windows | ✅ 官方支持 |
| macOS | ✅ 官方支持 |
| Linux | ✅ 官方支持 |
| Android | ✅ 官方 App |
| iOS | ✅ App Store 可下载 |

### 💰 完全免费

- 无需付费订阅
- 无文件大小限制
- 无设备数量限制
- 无需注册账号

## 与其他方案对比

| 特性 | Syncthing | 云存储 (Dropbox等) | Obsidian Git |
|------|-----------|-------------------|--------------|
| 价格 | 免费 | 付费/有限免费 | 免费 |
| 隐私性 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 需要云服务 | ❌ | ✅ | ✅ (GitHub) |
| 设备需同时在线 | ✅ | ❌ | ❌ |
| 版本控制 | 基础 | 基础 | 完整 Git |
| 配置复杂度 | 中等 | 简单 | 中等 |
| 手机稳定性 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## 典型使用场景

### 1. Obsidian 笔记同步

```
电脑端                              手机端
+------------------+              +------------------+
| Syncthing        |              | Syncthing App    |
| Obsidian 库      | <---------> | Obsidian 库      |
| 自动同步变更      |   P2P 直连   | 自动同步变更      |
+------------------+              +------------------+
```

**优势**：
- 无需付费订阅 Obsidian Sync
- 笔记数据完全私密
- 同步速度快

### 2. 文档同步

- 工作文档在多台电脑间同步
- 照片从手机自动备份到电脑
- 代码项目在多设备间同步

### 3. 家庭数据共享

- 家庭照片库共享
- 音乐/视频库同步
- 无需上传到云端

## 快速开始

### 安装

**Windows**:
```powershell
winget install Syncthing.Syncthing
```

**macOS**:
```bash
brew install --cask syncthing
```

**Linux**:
```bash
sudo apt install syncthing  # Debian/Ubuntu
```

**Android**: [Google Play](https://play.google.com/store/apps/details?id=com.nutomic.syncthingandroid) 或 [F-Droid](https://f-droid.org/packages/com.nutomic.syncthingandroid/)

**iOS**: [App Store](https://apps.apple.com/app/syncthing/id1583961890)

### 基本配置流程

1. **电脑端启动 Syncthing**
   ```bash
   syncthing
   ```
   自动打开 Web GUI: http://localhost:8384

2. **获取设备 ID**
   - 点击右上角「操作」→「显示 ID」
   - 记录设备 ID 或生成二维码

3. **手机端添加设备**
   - 打开 Syncthing App
   - 扫描电脑端二维码或输入设备 ID
   - 在电脑端确认连接请求

4. **配置同步文件夹**
   - 电脑端：添加文件夹，选择 Obsidian 库路径
   - 手机端：添加同名文件夹，选择存储位置
   - **关键**：文件夹 ID 必须两端一致

5. **开始同步**
   - 两端确认共享
   - 文件自动同步

## 高级配置

### 跨网络同步

如果设备不在同一局域网，有三种方案：

**方案 A：中继服务器（默认启用）**
- 自动使用 Syncthing 官方中继
- 无需配置，但速度较慢

**方案 B：端口转发**
```bash
# 路由器配置
外部端口 22000 → 内部 IP:22000

# 防火墙开放
sudo ufw allow 22000/tcp  # Linux
```

**方案 C：Tailscale 组网（推荐）**
1. 在所有设备安装 [Tailscale](https://tailscale.com)
2. 登录同一账号
3. 设备自动组成虚拟局域网
4. Syncthing 自动发现

### 忽略模式

创建 `.stignore` 文件排除不需要同步的内容：

```
# Obsidian 工作区（设备特定）
.obsidian/workspace.json
.obsidian/workspace-mobile.json

# 临时文件
.trash/
*.tmp

# 系统文件
.DS_Store
Thumbs.db
```

### 版本控制

在文件夹设置中启用版本控制：

| 类型 | 说明 |
|------|------|
| 垃圾箱 | 删除文件移到 .stversions |
| 简单版本控制 | 保留最近 N 个版本 |
| 阶段性版本控制 | 按时间保留版本 |

## 常见问题

| 问题 | 解决方法 |
|------|----------|
| 设备无法发现 | 检查防火墙，确认 21027/UDP 开放 |
| 同步速度慢 | 使用端口转发或 Tailscale 替代中继 |
| 文件冲突 | Syncthing 自动重命名冲突文件 |
| 手机后台不同步 | 关闭电池优化，允许后台运行 |
| iOS 权限问题 | 在「文件」App 中授权 Syncthing |

## 相关资源

- **官网**: [syncthing.net](https://syncthing.net)
- **GitHub**: [syncthing/syncthing](https://github.com/syncthing/syncthing)
- **文档**: [docs.syncthing.net](https://docs.syncthing.net)
- **论坛**: [forum.syncthing.net](https://forum.syncthing.net)

---

## 总结

Syncthing 是追求隐私和数据主权用户的最佳选择。虽然配置相对复杂，但一旦设置完成，就能享受免费、私密、无限制的文件同步体验。

**推荐人群**：
- 注重隐私的用户
- 不想付费订阅云服务
- 有多设备同步需求
- 开发者、技术爱好者

**不太推荐**：
- 追求极致简单的用户
- 需要随时访问历史版本
- 设备经常离线