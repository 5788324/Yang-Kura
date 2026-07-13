# U27 — Codex Windows GUI 实机验收任务书

## 1. 任务性质

你是 Codex，正在控制一台真实 Windows 电脑，对 Yang-Kura 当前 `main` 做完整的用户视角实机验收。

本轮只做：

- 拉取最新 Git 主线。
- 执行自动门禁。
- 构建 portable 候选。
- 启动真实 Electron 窗口。
- 按清单逐项点击、播放和检查。
- 保存截图、日志和验收报告。

本轮不做：

- 不开发新功能。
- 不重构。
- 不清理历史代码。
- 不修改架构。
- 不自动修复发现的问题。
- 不提交源码改动。
- 不操作真实大库执行 destructive test。

发现问题后先记录。只有用户明确批准后，才能另开修复分支。

## 2. 唯一代码来源

仓库：

```text
https://github.com/5788324/Yang-Kura.git
```

必须从最新 `origin/main` 验收。不要使用旧 ZIP、旧工作区副本或历史 MVP 包。

执行前先阅读：

```text
PROJECT_ROADMAP.md
PROJECT_STATE.md
docs/UI_DAILY_SURFACE_RULES.md
docs/U27_WINDOWS_GUI_ACCEPTANCE_TASK.md
```

`PROJECT_ROADMAP.md` 是长期路线真源；`PROJECT_STATE.md` 是当前状态快照。

## 3. Git 获取与基线确认

建议工作目录：

```text
G:\Codex\Yang Kura
```

### 已存在仓库

```powershell
$Repo = "G:\Codex\Yang Kura"
Set-Location $Repo

git status --short
```

如果存在任何未提交改动：

```text
立即停止。
不要 stash。
不要 reset。
不要覆盖用户工作。
先在报告中记录。
```

工作区干净时执行：

```powershell
git fetch origin --prune
git checkout main
git pull --ff-only origin main

git status --short
git rev-parse HEAD
git log -1 --oneline
```

### 尚未克隆

```powershell
$Parent = "G:\Codex"
New-Item -ItemType Directory -Force -Path $Parent | Out-Null
Set-Location $Parent

git clone https://github.com/5788324/Yang-Kura.git "Yang Kura"
Set-Location "G:\Codex\Yang Kura"
git checkout main
git pull --ff-only origin main

git status --short
git rev-parse HEAD
git log -1 --oneline
```

报告必须记录实际 HEAD，不要依赖任务书中的固定 SHA。

## 4. 环境确认

要求：

```text
Windows 10/11 x64
Node.js 22.x
npm 10.x
Git
可选：mpv.exe
```

执行：

```powershell
node --version
npm --version
git --version
```

版本不符合时先停止并报告，不要自行升级全局环境。

建议使用仓库本地 npm cache：

```powershell
$Repo = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$Repo\.npm-cache"
$env:npm_config_cache = "$Repo\.npm-cache"
```

安装依赖：

```powershell
npm ci --no-audit --no-fund --cache "$Repo\.npm-cache"
```

此处不要使用 `--ignore-scripts`，因为实机 Electron/打包验收需要 Electron binary 和项目 postinstall patch。

## 5. 自动门禁

依次执行并保存完整输出：

```powershell
npm run verify:env
npm run lint
npm run build:electron
npm run verify:all
npm audit --audit-level=high
npm run build
npm run desktop:smoke-check:strict
npm run test:mpv:acceptance
npm run desktop:pack
```

规则：

- 任一 high / critical 依赖风险：Blocker。
- TypeScript、Electron 编译、稳定回归或生产构建失败：Blocker。
- portable 构建失败：Blocker。
- mpv acceptance 因机器未安装 mpv 而无法完成：标记 `Not Tested`，不是自动通过。
- 不运行 `npm audit fix`。
- 不自动升级 Electron、Vite、React 或其他依赖。

把控制台输出保存到：

```text
G:\Codex\YangKuraAcceptance\logs\
```

建议文件：

```text
01-environment.txt
02-install.txt
03-verify-env.txt
04-lint.txt
05-build-electron.txt
06-verify-all.txt
07-audit-high.txt
08-build-renderer.txt
09-desktop-smoke-strict.txt
10-mpv-acceptance.txt
11-desktop-pack.txt
```

## 6. 验收数据安全边界

### 允许

- 使用临时测试目录。
- 使用真实媒体文件的副本。
- 使用 1～3 个小音频、封面、字幕和文本样本。
- copy-only 测试。
- move-only 只使用专门复制出来的临时样本。
- 对临时 Index 做损坏、恢复和清理测试。
- 对真实媒体库做只读浏览、搜索、播放和字幕检查。

### 禁止

- 不在真实大库上执行 move-only。
- 不在真实大库上执行索引清理写入。
- 不删除真实媒体。
- 不覆盖同名目标。
- 不批量改真实元数据。
- 不执行全库 Provider 自动覆盖。
- 不修改用户现有应用数据而不备份。
- 不清理源目录。

## 7. 测试目录

建议：

```text
G:\Codex\YangKuraAcceptance\
├─ library\
│  ├─ ASMR\
│  └─ Music\
├─ import-source-copy\
├─ import-source-move\
├─ profile-backup\
├─ screenshots\
├─ logs\
└─ report\
```

测试样本至少包含：

### ASMR/RJ

- 一个多轨作品。
- 一个较长音频，推荐 1 小时以上；有 2～5 小时样本时优先使用副本。
- 一个无封面作品。
- 一个无字幕作品。
- 中文、日文、空格和特殊字符文件名。
- 一个较长目录名。

### 音乐

- MP3。
- FLAC。
- WAV 或 M4A 至少一种。
- 有封面和无封面各一个。

### 字幕

至少准备：

```text
LRC
SRT
VTT
ASS
```

可以分布在不同音轨，不要求单个音轨同时具备四种格式。

### 外部文件

- 一张图片。
- 一个小视频。
- 一个普通文本文件。

## 8. 用户数据保护

检查现有 Yang Kura 用户数据前：

1. 完全关闭 Yang Kura、Electron 和 mpv。
2. 检查 `%APPDATA%` 与 `%LOCALAPPDATA%` 中名称包含 `Yang Kura` 或 `yang-kura` 的目录。
3. 记录实际目录。
4. 如果需要验证干净首次启动，先完整复制到：

```text
G:\Codex\YangKuraAcceptance\profile-backup\
```

5. 不确定哪个目录属于应用时，不删除、不改名，改为在报告中标记“干净配置未执行”。
6. 验收结束后恢复用户原数据。

优先使用 Windows Sandbox、临时 Windows 账户或明确隔离的测试环境。不要为了验收破坏用户日常配置。

## 9. 启动候选

portable 产物默认位于：

```text
release\
```

产物名应类似：

```text
Yang Kura-0.167.0-mvp129-portable-x64.exe
```

实际版本以 `package.json` 和构建产物为准。

至少测试：

1. 仓库路径包含空格。
2. portable 所在目录包含中文或空格。
3. 双击启动。
4. 正常关闭。
5. 再次启动。

不要只使用 Vite 浏览器预览替代 Electron 实机窗口。

## 10. GUI 验收矩阵

每项记录：

```text
PASS
FAIL
NOT TESTED
NOT APPLICABLE
```

FAIL 必须包含复现步骤、截图、日志和严重程度。

### A. 首次启动和主框架

- [ ] 干净配置启动无演示媒体。
- [ ] 首页空状态可理解。
- [ ] 应用没有黑屏或白屏。
- [ ] 左侧导航默认显示日常功能。
- [ ] 下载规划和诊断工具不长期占据一级导航。
- [ ] AI 维护默认折叠。
- [ ] 当前位于维护页时，维护入口可见。
- [ ] 顶栏、侧栏和 PlayerBar 没有重叠。
- [ ] 关闭和重新启动正常。

### B. 资源库设置和扫描

- [ ] 选择 ASMR 目录。
- [ ] 选择音乐目录。
- [ ] 目录显示不泄露不必要的绝对路径到日常界面。
- [ ] 读取已有资源库记录。
- [ ] 一键扫描并应用。
- [ ] 进度提示正常。
- [ ] 扫描完成统计合理。
- [ ] 重启后显示上次资源库提示。
- [ ] 重新选择同一目录后可以读取已有 Index。
- [ ] 空目录有明确提示。
- [ ] 无权限目录有明确错误。
- [ ] 损坏 Index 不导致应用崩溃。
- [ ] AI 维护中的资源库检修默认隐藏。
- [ ] 展开后缺失检查、清理、备份恢复和历史可见。

### C. 首页和媒体浏览

- [ ] 首页继续播放。
- [ ] 最近播放。
- [ ] 最近加入。
- [ ] 音声库入口。
- [ ] 音乐库入口。
- [ ] 歌单入口。
- [ ] ASMR 作品列表加载。
- [ ] ASMR 搜索、筛选和排序。
- [ ] ASMR 详情音轨列表。
- [ ] 音乐库列表与专辑/艺术家信息。
- [ ] 无封面 fallback 正常。
- [ ] 无字幕状态不伪造字幕。
- [ ] 空搜索结果有明确空状态。
- [ ] 中文、日文和特殊字符正常显示。

### D. 播放器基础

- [ ] HTMLAudio 模式播放。
- [ ] mpv 优先模式播放。
- [ ] mpv 未安装或不可用时有明确提示并回退。
- [ ] mpv 运行中断后从合理位置恢复到 HTMLAudio。
- [ ] 播放。
- [ ] 暂停。
- [ ] 上一首。
- [ ] 下一首。
- [ ] 点击进度轨道 Seek。
- [ ] 拖拽期间只预览，释放后提交最终 Seek。
- [ ] 长音频 Seek。
- [ ] 音量。
- [ ] 静音和恢复。
- [ ] 循环模式。
- [ ] 播放完成策略。
- [ ] 当前时间和总时长显示。
- [ ] 喜欢按钮状态和提示。
- [ ] 收藏到歌单。

### E. 队列、歌单和播放历史

- [ ] 打开队列。
- [ ] 队列数量正确。
- [ ] 切换队列音轨。
- [ ] 保存为歌单。
- [ ] 创建自建歌单。
- [ ] 添加音声和音乐。
- [ ] 重复添加有合理行为。
- [ ] 系统歌单只读提示。
- [ ] 从歌单移除不删除真实媒体。
- [ ] 播放历史保存。
- [ ] 重启后继续播放映射正确。

### F. 字幕和全屏播放器

- [ ] LRC 加载和当前行高亮。
- [ ] SRT 加载。
- [ ] VTT 加载。
- [ ] ASS 加载。
- [ ] 双语歌词显示。
- [ ] 无字幕时有明确空状态。
- [ ] 桌面歌词浮窗打开和关闭。
- [ ] 浮窗关闭按钮可用。
- [ ] 全屏播放器打开。
- [ ] 打开后焦点进入全屏区域。
- [ ] Escape 退出。
- [ ] 退出后焦点返回触发按钮。
- [ ] reduced-motion 下动画减少。

### G. 外部打开

- [ ] 图片使用系统程序打开。
- [ ] 视频使用系统程序或已配置外部播放器打开。
- [ ] 文本/其他文件外部打开。
- [ ] 文件管理器定位。
- [ ] 无效文件有错误提示，不导致应用崩溃。

### H. 导入器

只使用临时测试目录。

#### copy-only

- [ ] 选择导入来源。
- [ ] 识别 RJ 或音乐资源。
- [ ] 生成导入预览。
- [ ] 冲突列表合理。
- [ ] 目标路径合理。
- [ ] 执行 copy-only。
- [ ] 源文件仍存在。
- [ ] 目标文件存在。
- [ ] 同名目标不覆盖。
- [ ] OperationLog 存在。
- [ ] Index 创建备份。
- [ ] Index patch 写入。
- [ ] 资源库刷新后出现新资源。

#### move-only

- [ ] 只使用临时副本。
- [ ] 有明确二次确认。
- [ ] 目标存在时停止，不覆盖。
- [ ] 成功后源文件移走。
- [ ] 失败时停止后续 move。
- [ ] OperationLog 记录结果。
- [ ] 不自动删除空源目录。

### I. 元数据

- [ ] 本地 ASMR 元数据编辑。
- [ ] 本地音乐元数据编辑。
- [ ] 覆盖值在重启后保留。
- [ ] 可以恢复原始值。
- [ ] 不修改真实媒体标签。
- [ ] DLsite 单 RJ 查询预览。
- [ ] Provider 网络失败有明确提示。
- [ ] 不执行全库无确认覆盖。

### J. 三主题和窗口尺寸

主题：

```text
dark
acrylic-mist
ocean-drops
```

每个主题检查：

- [ ] 首页。
- [ ] 资源库。
- [ ] 详情页。
- [ ] 歌单。
- [ ] 设置。
- [ ] PlayerBar。
- [ ] 全屏播放器。
- [ ] 弹窗、菜单、Toast 和浮层。
- [ ] 文字与背景对比。
- [ ] Hover 和 Focus。

窗口尺寸：

- [ ] 小窗口。
- [ ] 常规窗口。
- [ ] 最大化。
- [ ] 无明显横向溢出。
- [ ] 按钮不重叠。
- [ ] 内容区域可滚动。
- [ ] PlayerBar 不遮挡正文。

Windows 缩放环境允许时检查：

```text
100%
125%
150%
```

无法切换时标记 NOT TESTED，不得伪造通过。

### K. 键盘和无障碍

- [ ] Tab 可遍历主要控件。
- [ ] 焦点轮廓可见。
- [ ] Enter / Space 可触发按钮。
- [ ] Escape 关闭弹窗、菜单或全屏页。
- [ ] 图标按钮有可理解名称。
- [ ] 活动导航有正确状态。
- [ ] 不出现永久焦点陷阱。

### L. 日常 UI 去工程化

默认日常界面不得长期显示：

- [ ] MVP 编号。
- [ ] verifier 名称。
- [ ] Git SHA。
- [ ] IPC 原始状态。
- [ ] 命令行指令。
- [ ] Scanner Contract。
- [ ] Beta/RC 交接说明。
- [ ] 原始错误对象。
- [ ] 绝对路径或 `file://`。

这些内容只能进入 AI 维护、诊断页或日志。

### M. 关闭和进程回收

播放期间关闭应用：

```powershell
Get-Process | Where-Object {
  $_.ProcessName -match 'Yang|Kura|electron|mpv'
} | Select-Object ProcessName, Id, Path
```

检查：

- [ ] Electron 窗口关闭。
- [ ] 应用进程退出。
- [ ] mpv 子进程退出。
- [ ] 无双重播放。
- [ ] 无明显残留进程。
- [ ] 再次启动正常。

不要误杀用户其他 Electron 应用。终止进程前必须确认路径和命令行属于 Yang-Kura。

## 11. 截图要求

至少保存：

1. 干净首页。
2. 侧栏默认状态。
3. AI 维护折叠和展开状态。
4. ASMR 库。
5. ASMR 详情。
6. 音乐库。
7. 歌单。
8. PlayerBar 播放中。
9. 全屏播放器。
10. 歌词浮窗。
11. 设置页日常区域。
12. 资源库检修区域。
13. 导入器预览。
14. copy-only 结果。
15. 三主题各一张关键页面。
16. 小窗口与最大化。
17. 错误或异常状态。

文件名建议：

```text
01-home-clean.png
02-sidebar-daily.png
03-ai-maintenance-collapsed.png
...
```

## 12. 问题分级

### Blocker

- 无法启动。
- 黑屏/白屏。
- 数据损坏。
- 真实文件误删、覆盖或错误移动。
- 播放无法使用。
- portable 无法构建或运行。
- high/critical 依赖风险。

### Major

- 核心页面无法使用。
- mpv/HTMLAudio fallback 失效。
- Index 无法读写或恢复。
- 导入闭环失败。
- 字幕主流程失败。
- 关闭后残留播放进程。

### Minor

- 文案、对齐、局部主题、焦点或单一按钮问题。
- 不影响主流程的错误提示或空状态问题。

### Observation

- 可改进但不构成缺陷。
- 性能、视觉或后续增强建议。

## 13. 报告格式

保存到：

```text
G:\Codex\YangKuraAcceptance\report\U27_WINDOWS_GUI_ACCEPTANCE_REPORT.md
```

使用以下结构：

```markdown
# U27 Windows GUI 实机验收报告

## 基线
- 日期：
- Windows 版本：
- Windows 缩放：
- Node：
- npm：
- Git HEAD：
- package.json version：
- portable 产物：
- mpv 状态：

## 自动门禁
| 项目 | 结果 | 日志 |
|---|---|---|
| verify:env | | |
| lint | | |
| build:electron | | |
| verify:all | | |
| audit high | | |
| build | | |
| desktop smoke strict | | |
| mpv acceptance | | |
| desktop pack | | |

## GUI 总览
| 模块 | PASS | FAIL | NOT TESTED | 备注 |
|---|---:|---:|---:|---|
| 首次启动 | | | | |
| 资源库 | | | | |
| 浏览 | | | | |
| 播放器 | | | | |
| 字幕 | | | | |
| 队列/歌单 | | | | |
| 外部打开 | | | | |
| 导入器 | | | | |
| 元数据 | | | | |
| 三主题/窗口 | | | | |
| 键盘/无障碍 | | | | |
| AI 维护边界 | | | | |
| 进程回收 | | | | |

## 问题清单
| ID | 严重度 | 模块 | 复现步骤 | 实际结果 | 预期结果 | 截图/日志 |
|---|---|---|---|---|---|---|

## 数据安全结论
- 是否误删：
- 是否覆盖：
- 是否错误移动：
- 是否暴露 absolutePath/file://：
- Index 备份恢复：
- 用户原配置是否已恢复：

## 最终判断
- GO / CONDITIONAL GO / NO-GO：
- 是否建议进入 U28：
- 必须先修的 Blocker/Major：
- 可后置的 Minor：
```

## 14. 最终输出要求

完成后只提交：

1. 实际 Git HEAD。
2. 自动门禁结果。
3. portable 产物路径和 SHA-256。
4. GUI 汇总。
5. 问题表。
6. 截图和日志目录。
7. GO / CONDITIONAL GO / NO-GO。
8. 是否建议进入 U28。

不要主动修复。不要创建功能分支。不要提交源码。验收报告完成后等待用户和项目管理 AI 决定下一步。
