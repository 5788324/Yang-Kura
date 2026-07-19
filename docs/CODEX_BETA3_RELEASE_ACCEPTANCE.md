# Codex：Yang-Kura Beta 3 阻断修复专项复测

## 任务性质

只复测 B3-MAJ-001，并在播放通过后继续完成上次因阻断而停止的临时副本事务。不要重跑全部页面、U28～U40 或发布打包链，不修改源码，不提交 Git。

## 基线

仓库：`G:\Codex\Yang Kura`

```powershell
$Repo = 'G:\Codex\Yang Kura'
Set-Location $Repo
git fetch origin --prune
git switch release/beta3-daily-closeout
git pull --ff-only origin release/beta3-daily-closeout
$Head = git rev-parse HEAD
$Remote = git rev-parse origin/release/beta3-daily-closeout
"branch=$(git rev-parse --abbrev-ref HEAD)"
"HEAD=$Head"
"remote=$Remote"
```

必须满足：分支为 `release/beta3-daily-closeout`、`HEAD = remote`、tracked/cached diff 为 0。开始时记录实际 SHA；不满足则只报告 `BASELINE_INVALID`。

## 独立环境

```powershell
$Root = Join-Path $env:TEMP 'YangKura-Beta3-Acceptance'
$Profile = Join-Path $Root 'profile-retest'
$TempLibrary = Join-Path $Root 'library-retest'
New-Item -ItemType Directory -Force -Path $Profile,$TempLibrary | Out-Null
$env:YANG_KURA_USER_DATA_ROOT = $Profile
npm run desktop:preview
```

## A. B3-MAJ-001 必测

在临时目录创建或复制一份合法、时长大于 5 秒的 WAV。使用音声库“一键扫描并应用”，读取 Index 后进入唯一作品详情。

必须验证：

1. 根目录单文件作品名称不再显示 `root`；
2. 详情仍识别为可播放音轨；
3. 点击音轨主区域和右侧“播放”按钮都能进入全局播放器；
4. 全局播放器显示当前音轨，队列数至少为 1；
5. mpv 或 HTMLAudio 返回真实时长后，时长大于 0；
6. 进度持续推进；
7. 暂停、继续、Seek、上一首/下一首边界和队列可操作；
8. 如果历史或 localStorage 写入失败，播放状态仍不得被阻断。

任何一项失败均保留 `B3-MAJ-001 = FAIL` 并停止发布。

## B. 临时副本事务

A 通过后，在 `%TEMP%\YangKura-Beta3-Acceptance` 内继续：

1. 再次扫描写入，确认形成旧 Index 备份；
2. 备份恢复后统计一致；
3. copy-only；
4. 受控 move-only；
5. 同名或目标已存在冲突；
6. 人为制造中途失败并验证停止与回滚；
7. OperationLog 包含操作、结果和回滚摘要；
8. 日常 UI 不显示完整临时绝对路径。

## C. 真实音乐目录

`D:\CloudMusic\VipSongsDownload` 没有既有 Index，因此保持只读：只记录授权、读取不存在 Index 和只读预览结果，不写真实目录。可以从中复制少量样本到临时目录验证音乐扫描、浏览和播放；不得在真实目录生成 Index。

## D. 结束状态

- 关闭后 Yang-Kura、Electron 和 mpv 进程为 0；
- tracked/cached diff 为 0；
- 真实音乐目录无写入；
- 原有未跟踪资料不删除、不修改。

## 输出

保存到 `%TEMP%\YangKura-Beta3-Acceptance\report-retest`：

- `BETA3_RETEST_COMMAND_RESULTS.txt`
- `BETA3_RETEST_FINAL_REPORT.md`
- `BETA3_RETEST_FUNCTION_MATRIX.md`
- `BETA3_RETEST_DEFECTS.md`

最终状态：`PASS`、`PARTIAL`、`FAIL` 或 `BASELINE_INVALID`。未执行项必须保留 `NOT TESTED`。完成后停止，不修代码、不提交、不扩展范围。
