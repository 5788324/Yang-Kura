# Codex：U40-D2 最新 main 实机定向复测

## 1. 任务目标

在**最新 GitHub `main`** 上重新验证 U40-D 真实资源库链路，并复测上一份报告中的 7 个观察项。

本轮只做实机测试：

- 不修改源码；
- 不提交或推送；
- 不清理用户已有未跟踪文件；
- 不对真实媒体库执行写入、移动、删除、重命名或覆盖；
- 不重复执行 portable、NSIS、安装/卸载和完整发布链。

真实目录：

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

## 2. 基线是硬阻断条件

在仓库目录执行：

```powershell
$Repo = "G:\Codex\Yang Kura"
Set-Location $Repo

git fetch origin --prune
git switch main

git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

必须满足：

```text
branch = main
HEAD = origin/main
HEAD 包含 U40-D 合并提交 5daa0102b1114b6213d3240aa7cb4e66285ca7ab
HEAD 包含 U40-D2 修复提交（以本文件交付时指定的最新提交为准）
tracked diff = 0
cached diff = 0
```

检查 U40-D：

```powershell
git merge-base --is-ancestor 5daa0102b1114b6213d3240aa7cb4e66285ca7ab HEAD
if ($LASTEXITCODE -ne 0) { throw "BASELINE_INVALID: U40-D is missing" }
```

若 `HEAD != origin/main`、指定修复提交不在历史中，或当前分支不是 `main`：

```text
立即停止。
报告状态只能写 BASELINE_INVALID。
不得继续启动 GUI。
不得给产品判定 GO / NO-GO。
```

不要使用旧 ZIP、旧工作树、旧分支或旧提交 `f87813cb...`。

## 3. 准备独立测试 profile

应用现在支持显式隔离目录：

```text
YANG_KURA_USER_DATA_ROOT
```

使用以下目录：

```powershell
$EvidenceRoot = Join-Path $env:TEMP "YangKura-U40D2-Retest"
$ProfileRoot = Join-Path $EvidenceRoot "profile"
$ReportRoot = Join-Path $EvidenceRoot "report"
$ScreenshotRoot = Join-Path $EvidenceRoot "screenshots"
$LogRoot = Join-Path $EvidenceRoot "logs"

Remove-Item -LiteralPath $EvidenceRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $ProfileRoot, $ReportRoot, $ScreenshotRoot, $LogRoot | Out-Null

$env:YANG_KURA_USER_DATA_ROOT = $ProfileRoot
Remove-Item Env:YANG_KURA_E2E_MODE -ErrorAction SilentlyContinue
Remove-Item Env:YANG_KURA_E2E_USER_DATA_ROOT -ErrorAction SilentlyContinue
```

禁止只修改 `APPDATA` / `LOCALAPPDATA` 后使用“等价 Electron 入口”。必须使用仓库规定的启动命令，并保留上述环境变量：

```powershell
npm run desktop:preview
```

`node_modules` 缺失时才运行一次：

```powershell
npm ci --ignore-scripts --no-audit --no-fund
```

不要重复运行已经由 GitHub Actions 通过的完整自动门禁。

## 4. 第一阶段：干净 profile

首次启动后检查：

- 首页没有 U28/U29/U30/U31/U32/U39/U40-B 测试音轨；
- 最近播放为空；
- 队列为空；
- 自建歌单为空；
- 没有旧资源库会话；
- 没有日常 `%APPDATA%\Yang-Kura` 中的历史内容；
- `$ProfileRoot` 在启动后产生应用 profile 文件；
- 日常 `%APPDATA%\Yang-Kura` 的文件数量和修改时间不应因本轮测试变化。

任一旧日常数据出现在隔离 profile 中，记录：

```text
U40D2-GUI-001 / Blocker / profile isolation failed
```

## 5. 全部可见页面快速覆盖

逐页进入并记录 `PASS / PARTIAL / FAIL / NOT TESTED`：

1. 首页；
2. 音声库；
3. 音声作品详情；
4. 音乐库：歌曲、专辑、艺术家、文件夹；
5. 专辑、艺术家、文件夹详情；
6. 歌单列表；
7. 歌单新建表单与空状态；
8. 导入资源；
9. 设置；
10. AI 维护；
11. 播放队列抽屉；
12. 全屏歌词；
13. 可见弹窗、菜单、折叠区和行级操作。

每页至少检查：

- 可见按钮；
- 表单字段；
- 下拉框；
- 空状态；
- 返回操作；
- Escape；
- Tab；
- Shift+Tab；
- Enter / Space 对当前聚焦按钮的触发；
- 是否出现横向溢出、遮挡或不可点击控件。

只记录真实执行结果；未执行项目保留 `NOT TESTED`。

## 6. 复测歌单 `$0`

进入空歌单页面。

预期：

```text
共 0 个歌单、0 首音轨；自建歌单保存在本机。
```

不得出现：

```text
$0
${filteredPlaylists.length}
${playlistSummary.trackCount}
```

然后：

1. 打开新建歌单表单；
2. 检查空名称不能保存；
3. 新建一个临时空歌单；
4. 返回列表；
5. 确认统计变成 1 个歌单；
6. 删除临时歌单。

这些操作只写隔离 profile，不接触真实媒体文件。

## 7. 复测三主题状态同步

在设置中依次选择：

| 设置选择 | 顶栏必须显示 |
|---|---|
| 高雅黑 | 高雅黑 |
| 云雾亚克力 | 云雾亚克力 |
| 微光海洋 | 微光海洋 |

每次切换检查：

- 页面材质变化；
- 顶栏文字立即同步；
- 切换页面后仍一致；
- 关闭并重启后保持一致；
- 顶栏按钮的 `aria-label` 与当前主题一致。

不能再出现“设置选择微光海洋，顶栏显示雾光象牙”。

## 8. 复测导入页日常语言

进入“导入资源”，展开所有**用户可见**的折叠区。

预期日常页面可以看到：

- 选择来源；
- 查看预览；
- 冲突检查；
- 复制或移动说明；
- 安全边界和结果摘要。

用户可见页面不得出现：

```text
MVP-xx
IPC
Scanner
Contract
rootPathToken
absolutePath
file://
verifier
release gate
历史验证
```

历史工程面板 `mvp107-importer-ai-maintenance-fold` 应从生产页面隐藏，不能由普通用户展开。

不要在真实目录执行复制或移动。需要检查文件操作界面时，只使用 `%TEMP%\YangKura-U40D2-Retest` 中的小样本副本。

## 9. 真实音声库只读链路

选择：

```text
E:\arsm
```

执行“读取已有记录”。

检查：

- 状态从读取中收敛到成功或明确失败；
- 超过 15 秒时出现可重试超时状态，而不是永久 pending；
- 设置、顶栏、首页和音声库显示同一次读取结果；
- 不再将根目录和一级分类目录错误显示为两个作品；
- 日常作品列表不存在 0 音轨集合；
- 作品按可用 RJ / 实际作品目录层级呈现；
- 打开至少 3 个不同作品详情；
- 搜索、筛选、返回、批量入口可操作。

不要求固定作品数量；以真实目录和当前 `library-index.json` 为准。

## 10. 播放、字幕、队列与历史

从真实音声库选择一个有音频的作品：

1. 播放一条真实音轨；
2. 确认时长大于 0；
3. 确认进度持续变化；
4. Seek 到不同位置；
5. 暂停和继续；
6. 上一首、下一首；
7. 加入队列；
8. 打开队列抽屉；
9. 检查历史与最近播放；
10. 打开歌词/字幕。

若系统没有 mpv：

- 记录 `mpv unavailable` 为环境 Observation；
- 应自动使用 HTMLAudio；
- 不得因 mpv 缺失直接判定产品失败。

无论是否安装 mpv，都不得出现：

```text
rootPathToken 无效或已失效
```

目录授权记录应在 Electron 启动时恢复到运行时 token map。

字幕至少检查：

- 有字幕音轨能显示；
- 当前行随播放变化；
- Seek 后字幕位置同步；
- 无字幕音轨显示真实空状态；
- 能识别的格式按样本实际覆盖 LRC / SRT / VTT / ASS。

## 11. 音乐库只读链路

选择：

```text
D:\CloudMusic\VipSongsDownload
```

若已有 `library-index.json`，读取现有记录；否则只执行只读扫描预览，不写 Index。

检查：

- 歌曲、专辑、艺术家、文件夹视图；
- 搜索和筛选；
- 打开详情；
- 播放一首实际音乐；
- 队列和历史更新；
- 不暴露绝对路径。

真实音乐目录禁止写入。

## 12. 重启与单实例

### 12.1 第二实例

保持第一实例运行，使用相同环境变量再次执行：

```powershell
npm run desktop:preview
```

预期：

- 不创建两个独立播放实例；
- 现有窗口恢复、显示并获得焦点；
- 没有双重声音；
- 没有多份 mpv 进程。

### 12.2 完整重启

1. 正常关闭窗口；
2. 等待 Yang-Kura/Electron/mpv 进程退出；
3. 保留同一个 `$ProfileRoot`；
4. 再次执行 `npm run desktop:preview`。

预期：

- 出现可交互窗口；
- 资源库授权恢复；
- 读取状态不矛盾；
- 最近播放、队列、歌单和主题按隔离 profile 恢复；
- 重新播放时 token 可用；
- 不出现旧自动化样本。

连续执行 3 次关闭和重启。

## 13. 窗口、DPI 与键盘

可实际执行时检查：

```text
1040×680 @ 100%
1280×800 @ 125%
1600×900 @ 150%
```

以及：

- 系统减少动画；
- 全屏歌词；
- Escape 关闭弹窗、队列和歌词；
- Tab / Shift+Tab；
- 原生最小化、最大化、关闭按钮。

无法可靠改变窗口或 DPI 时写 `NOT TESTED`，不要伪报。

## 14. 结束检查

关闭应用后：

```powershell
Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -match 'electron|mpv|Yang' -and
    ($_.CommandLine -like "*$Repo*" -or $_.CommandLine -like "*$ProfileRoot*")
  } |
  Select-Object ProcessId, Name, CommandLine

git -C $Repo status --short
git -C $Repo rev-parse HEAD
git -C $Repo rev-parse origin/main
```

必须确认：

- 本轮仓库相关 Electron 进程为 0；
- mpv 进程为 0；
- tracked diff 为 0；
- cached diff 为 0；
- HEAD 仍等于 origin/main；
- 真实媒体库没有写入；
- 测试证据保存在仓库外。

## 15. 输出文件

输出到：

```text
%TEMP%\YangKura-U40D2-Retest\report
```

必须包含：

```text
U40D2_COMMAND_RESULTS.txt
U40D2_FINAL_REPORT.md
U40D2_PAGE_FUNCTION_MATRIX.md
U40D2_DEFECTS.md
```

`U40D2_COMMAND_RESULTS.txt` 至少记录：

```text
branch=
HEAD=
origin_main=
u40d_ancestor=
u40d2_fix_ancestor=
profile_root=
tracked_diff=
cached_diff=
mpv_available=
mpv_processes_after=
repo_electron_processes_after=
```

最终结论只能使用：

```text
PASS
PARTIAL
FAIL
BASELINE_INVALID
```

判定原则：

- 基线不符：`BASELINE_INVALID`；
- profile、真实播放或三轮重启失败：`FAIL`；
- 核心链通过但存在明确非阻断缺陷：`PARTIAL`；
- 全部已执行核心项通过，无法执行项目均诚实标为 `NOT TESTED`：`PASS`。

完成后停止，不开发、不修代码、不提交 Git。
