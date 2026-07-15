# Yang-Kura 0.168.0 Beta 1

> Windows x64 个人本地音频媒体库 Beta。支持 ASMR/RJ 音声与普通音乐。

## 本次 Beta 的定位

这是 U02～U32 产品化、可靠性、UI、导入事务和 Windows 发布候选收口后的首个新 Beta。发布物面向个人 Windows 使用，不是商业安装包，不包含自动更新、代码签名或云端服务。

## 主要能力

- 原生选择本地资源库目录，使用安全 root token 与相对路径。
- 读取、扫描、备份、恢复和维护 `library-index.json`。
- ASMR/RJ 音声库、普通音乐库、首页、详情、歌单、队列和播放历史。
- HTMLAudio 播放；可选 mpv 子进程后端；mpv 不可用时明确回退 HTMLAudio。
- LRC、SRT、VTT、ASS、双语和无字幕状态。
- 继续播放、Seek、队列恢复、完成策略和重新授权后的 token 对账。
- copy-only 导入与受控 move-only，小批次失败时提供事务回滚。
- 本地元数据覆盖、备份恢复和 DLsite 单 RJ Provider。
- 缺失文件检查、受控索引清理、维护历史和 50,000 曲目生成数据性能基准。
- Windows portable 与 NSIS 安装包。

## 本轮重点变化

### 资源库与播放可靠性

- 目录授权、Index、首页、音声库、音乐库、PlayerBar 和诊断统一使用同一真实会话快照。
- 合法空 Index、读取失败、损坏 JSON 和多种文本编码严格区分。
- HTMLAudio 与 mpv 使用一致的续播、Seek、队列和完成状态。
- LRC、SRT、VTT、ASS 字幕链通过 Windows Electron 全流程自动验收。

### 日常 UI

- 日常侧栏只保留：首页、音声库、音乐库、歌单、导入和设置。
- 下载规划、诊断和历史工程内容退出可见日常导航，路由仅保留在隐藏兼容层。
- 首页媒体内容进入首屏；资源库、歌单、导入器、设置页的卡片、按钮、页签和间距完成统一。
- dark、acrylic-mist、ocean-drops 三主题和常用窗口/DPI 矩阵通过。

### 导入与数据安全

- copy-only 与 move-only 使用统一文件事务服务。
- 默认不覆盖已有目标。
- copy 批次部分失败时清理本轮新复制文件。
- move 批次部分失败时逆向恢复本轮已移动文件。
- OperationLog 记录事务与回滚结果，仍不保存真实绝对路径。

### Windows 发布候选

- portable 可从中文和空格路径启动。
- NSIS 可安装到中文和空格路径。
- 同目录重复安装通过，用户数据保留。
- 静默卸载后应用主体移除、用户数据保留、残留进程为零。
- portable 与 NSIS 安装版均完成正式首页加载截图，不接受只显示加载占位。
- 包内未混入 Index、日志、缓存、备份或用户数据。

## 安全边界

- Renderer 不接收真实 `absolutePath` 或 `file://`。
- 不自动覆盖、删除、移动、重命名真实媒体文件。
- 测试性删除、移动、覆盖和批量写入只使用临时目录或副本。
- Provider 不自动覆盖本地元数据。
- 用户真实 `E:\arsm` 未参与破坏性测试。

## 已知限制

- 安装包未进行商业代码签名，Windows SmartScreen 可能显示未知发布者提示。
- 不包含自动更新；升级采用下载新版本后覆盖安装。
- 用户本机真实 mpv、声卡和厂商驱动组合未被宣称全部验证；mpv 不可用时的 packaged HTMLAudio fallback 已验证。
- 当前数据层仍为 Local JSON Index，不是 SQLite。
- MVP130 下载器实验包未合入，本版本不提供正式下载器。
- 不包含 OpenList/WebDAV、完整 AI Agent、Player Core v2 或云同步。

## 安装与升级

GitHub 会将发布资产文件名中的空格规范化为点号；以下名称与 Release 页面实际下载名一致。

### Portable

直接运行：

```text
Yang.Kura-0.168.0-beta.1-portable-x64.exe
```

### 安装版

运行：

```text
Yang.Kura-0.168.0-beta.1-setup-x64.exe
```

可覆盖安装到同一目录。U32 自动化已验证重复安装和卸载均保留用户数据。首次启动或应用重启后，出于安全边界，需要重新授权资源库目录并读取已有 Index。

## 校验

Release 同时提供 `SHA256SUMS.txt`。下载后可在 PowerShell 中运行：

```powershell
Get-FileHash '.\Yang.Kura-0.168.0-beta.1-portable-x64.exe' -Algorithm SHA256
Get-FileHash '.\Yang.Kura-0.168.0-beta.1-setup-x64.exe' -Algorithm SHA256
```

将输出与 `SHA256SUMS.txt` 对照。

## 后续

本 Beta 发布完成前，MVP130 下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写继续冻结。发布后再按实际使用反馈决定下一条主线。
