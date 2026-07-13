# U28 — Windows 原生目录选择与真实媒体闭环任务书

## 1. 任务性质

U28 是 U27 `CONDITIONAL GO` 的补充实机验收轮。

本轮目标不是开发新功能，而是使用真实 Windows 原生目录选择器和仓库外临时样本，完成 U27 无法自动化的媒体闭环：

```text
原生目录授权
→ 扫描与 Local JSON Index
→ UI 显示真实临时媒体
→ HTMLAudio / mpv 播放与 Seek
→ LRC / SRT / VTT / ASS
→ copy-only / move-only 临时副本
→ 重启恢复
```

本轮默认不修改源码、不提交、不推送。发现问题先记录；只有用户明确批准后，才另开定向修复分支。

## 2. 唯一代码来源

```text
https://github.com/5788324/Yang-Kura.git
```

必须从最新 `origin/main` 开始，不使用旧 ZIP 或历史工作区副本。

执行前阅读：

```text
PROJECT_ROADMAP.md
PROJECT_STATE.md
docs/UI_DAILY_SURFACE_RULES.md
docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md
docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md
```

## 3. Git 与环境基线

建议工作目录：

```text
G:\Codex\Yang Kura
```

先执行：

```powershell
$Repo = "G:\Codex\Yang Kura"
Set-Location $Repo

git status --short
```

如果存在未提交改动：

```text
立即停止。
不 stash。
不 reset。
不覆盖用户工作。
在报告中记录。
```

工作区干净时执行：

```powershell
git fetch origin --prune
git checkout main
git pull --ff-only origin main

git status --short
git rev-parse HEAD
git log -1 --oneline
node --version
npm --version
```

报告必须记录实际 HEAD。

## 4. 测试目录与数据边界

所有测试数据必须位于仓库外的专用目录：

```text
G:\Codex\YangKuraAcceptance\U28\
├── asmr-library\
├── music-library\
├── import-source-copy\
├── import-source-move\
├── import-target\
├── profile-backup\
├── screenshots\
├── logs\
└── report\
```

禁止：

- 使用用户真实大库做写入、清理、copy 或 move 测试。
- 把验收目录放进仓库。
- 覆盖同名目标。
- 自动删除源目录。
- 通过脚本绕过原生目录选择器。
- 把绝对路径或 `file://` 暴露到日常 Renderer 界面。
- 运行 `npm audit fix`。

## 5. 临时样本要求

### ASMR 样本

至少准备：

```text
asmr-library\
├── RJ01234567_中文 日文 [测试]\
│   ├── cover.jpg
│   ├── 01_短音频.mp3
│   ├── 01_短音频.lrc
│   ├── 02_短音频.wav
│   ├── 02_短音频.srt
│   ├── 03_短音频.flac
│   ├── 03_短音频.vtt
│   ├── 04_短音频.m4a
│   └── 04_短音频.ass
├── RJ07654321_无封面无字幕\
│   └── 01_track.mp3
└── 长路径_特殊字符_【测试】\深层目录\
    └── 01_long_seek_sample.mp3
```

要求：

- 音频只需短小、合法、可公开测试的合成声音或静音文件。
- 长 Seek 样本可以是较长的合成音频，不使用用户真实 ASMR 内容。
- 四种字幕分别包含明确可识别的测试文本和时间戳。

### 音乐样本

至少准备：

```text
music-library\
├── 测试艺术家 - 测试专辑\
│   ├── cover.png
│   ├── 01 - 测试歌曲.mp3
│   └── 02 - 日本語 Song.flac
└── Singles\
    └── 特殊 字符 [single].mp3
```

### 导入样本

`import-source-copy` 与 `import-source-move` 必须是两个相互独立的副本。每份包含：

- 1～3 个小音频；
- 1 个封面；
- 1 个字幕或文本；
- 一个与目标同名的冲突副本，用于验证不覆盖策略。

## 6. 自动门禁

使用仓库本地 npm cache：

```powershell
$Repo = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$Repo\.npm-cache"
$env:npm_config_cache = "$Repo\.npm-cache"

npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$Repo\.npm-cache"
```

执行：

```powershell
npm run verify:env
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
npm run desktop:smoke-check:strict
npm run desktop:pack
```

如果存在可用 mpv，并准备了测试音频：

```powershell
$env:YANG_KURA_MPV_TEST_AUDIO = "<一个临时测试音频绝对路径>"
$env:YANG_KURA_MPV_TEST_AUDIO_2 = "<第二个临时测试音频绝对路径>"
npm run test:mpv:acceptance
```

如果 mpv 不可用，记录 `NOT TESTED`，不要伪造 PASS。

## 7. 原生目录选择器人工交接点

当前自动化接口不能操作 Windows 原生目录选择器，因此允许用户在以下时刻只完成目录选择：

1. Codex 打开“选择 ASMR 资源库目录”。
2. 用户选择 `U28\asmr-library` 并确认。
3. Codex 打开“选择音乐资源库目录”。
4. 用户选择 `U28\music-library` 并确认。
5. 导入器选择 copy 来源和目标时，由用户选择对应临时目录。
6. 导入器选择 move 来源和目标时，由用户选择对应临时目录。

用户只负责原生对话框中的目录选择。其余页面点击、结果检查、日志整理和报告由 Codex 继续完成。

不得用开发者工具、配置文件或脚本直接注入绝对路径来替代 GUI 授权。

## 8. 资源库与 Index 验收

### 8.1 ASMR 目录

通过原生目录选择器授权后：

1. 执行一键扫描。
2. 检查扫描进度与完成提示。
3. 检查 `library-index.json` 是否生成或更新。
4. 检查 Index 备份。
5. 读取并应用 Index。
6. 打开音声库。
7. 检查两个 RJ 目录是否正确显示。
8. 检查封面、有字幕、无封面、无字幕状态。
9. 检查中文、日文、空格、方括号和较长路径。
10. 检查日常界面不显示绝对路径或 `file://`。

### 8.2 音乐目录

重复授权、扫描、写入、读取和应用流程，并检查：

- 专辑与单曲分组；
- 封面；
- 艺术家、专辑和曲目标题；
- 中文、日文与特殊字符；
- 音乐库搜索和基本筛选。

### 8.3 重启恢复

关闭 portable，确认无残留进程，再重新启动：

- 检查上次资源库提示；
- 按产品现有安全策略重新授权或读取 Index；
- 检查资源库可恢复；
- 检查空状态不会错误覆盖真实临时资源。

## 9. 播放与 Seek 验收

分别验证 HTMLAudio 与 mpv 可用条件下的行为。

### 9.1 基础控制

- 播放、暂停。
- 上一首、下一首。
- 队列打开、关闭和切换。
- 音量、静音。
- 循环模式。
- 播放完成策略。
- 喜欢与歌单入口。

### 9.2 Seek

- 点击进度条立即跳转。
- 拖拽中只预览，释放后提交。
- 连续快速拖拽。
- 接近 0 秒和接近结尾。
- 长音频中段和后段 Seek。
- Seek 后时间和歌词行同步。

### 9.3 fallback 与进程

如果 mpv 可用：

- 验证 mpv 播放。
- 验证正常切歌。
- 在安全可控条件下验证 mpv 退出后的 HTMLAudio fallback。
- 检查恢复位置不是从 0 开始。
- 检查没有双重播放。
- 关闭应用后无 mpv 残留。

如果 mpv 不可用：

- 检查提示清晰。
- 检查 HTMLAudio fallback 可播放。
- 记录 `mpv NOT TESTED`，不阻断其他 U28 流程。

## 10. 字幕验收

逐个播放对应音轨并检查：

| 格式 | 必须检查 |
|---|---|
| LRC | 时间戳解析、当前行高亮、Seek 后同步 |
| SRT | 分段时间、文本显示、Seek 后同步 |
| VTT | cue 解析与显示 |
| ASS | 基础文本提取与时间同步 |

还要检查：

- 无字幕音轨的真实空状态；
- 双语分隔显示；
- 全屏歌词页；
- 桌面歌词浮窗；
- 上一首/下一首后字幕切换；
- 重启后的字幕重新关联。

## 11. 导入器验收

### 11.1 初始页 MIN-001 复核

在未选择来源时记录：

- 是否仍显示“4 个示例文件”；
- 是否明确标注为示例；
- “0 阻断 / 1 提醒”是否可能被理解为当前扫描结果。

不在本轮直接修复。根据真实导入后的对比决定是否建立 Minor 修复任务。

### 11.2 copy-only

使用 `import-source-copy`：

- 预览来源、目标和冲突；
- 确认不会覆盖同名目标；
- 执行 copy-only；
- 源文件必须保留；
- 目标文件必须出现；
- OperationLog 必须记录；
- Index 必须备份并安全更新；
- 导入后资源库刷新并能播放。

### 11.3 move-only

只使用 `import-source-move` 副本：

- 必须有二次确认；
- 冲突时不覆盖；
- 成功项从来源移动到目标；
- 失败时停止后续 move；
- OperationLog 记录结果；
- 不自动删除空源目录；
- Index 更新和资源库刷新正确。

## 12. UI 与窗口补测

至少检查：

- 1040×680。
- 常规窗口。
- 最大化。
- 100% DPI。
- 环境允许时的 125% 和 150% DPI。
- 三主题。
- 完整 Tab / Shift+Tab 主流程。
- Escape 关闭弹层和全屏播放器。
- 弹层关闭后的焦点返回。
- reduced-motion 设置。

## 13. 问题分级

| 等级 | 定义 |
|---|---|
| Blocker | 数据损坏、误删、应用无法启动、核心流程完全不可用 |
| Major | 扫描、播放、字幕或导入核心流程存在明显错误 |
| Minor | 文案、布局、单项状态或低频交互问题 |
| Observation | 环境限制、测试工具限制或非阻塞风险 |

## 14. 报告格式

```text
U28 Windows 原生媒体闭环验收报告

基线：
- 日期：
- Git HEAD：
- version：
- Node / npm：
- portable：
- SHA-256：
- mpv：

自动门禁：
- verify:env：
- lint：
- build:electron：
- verify:all：
- build：
- audit high：
- strict smoke：
- desktop pack：
- mpv acceptance：

原生目录授权：PASS / FAIL
ASMR 扫描与 Index：PASS / FAIL
音乐扫描与 Index：PASS / FAIL
HTMLAudio：PASS / FAIL / NOT TESTED
mpv：PASS / FAIL / NOT TESTED
Seek：PASS / FAIL / NOT TESTED
字幕：PASS / FAIL / NOT TESTED
copy-only：PASS / FAIL
move-only：PASS / FAIL
重启恢复：PASS / FAIL
窗口与主题：PASS / FAIL
键盘：PASS / FAIL / PARTIAL

MIN-001 复核：

问题表：
- ID：
- 等级：
- 模块：
- 复现步骤：
- 实际：
- 预期：
- 证据：

数据安全：
- 误删：
- 覆盖：
- 错误移动：
- 原配置恢复：
- 残留进程：

结论：GO / CONDITIONAL GO / NO-GO
是否建议进入 U29：
```

## 15. 完成条件

U28 只有在以下项目均有真实结果时才算完成：

- 原生目录选择器授权。
- 至少一个 ASMR 和一个音乐样本进入 UI。
- 至少一个音轨真实播放并完成 Seek。
- 至少一种字幕真实同步；四种字幕要么全部通过，要么明确列出问题。
- copy-only 通过。
- move-only 在临时副本上通过，或明确记录阻断缺陷。
- 重启恢复检查。
- 用户原配置恢复。
- Git 工作区保持 clean。
- 无残留 Electron / Yang Kura / mpv 进程。

完成后停止，不主动修复。
