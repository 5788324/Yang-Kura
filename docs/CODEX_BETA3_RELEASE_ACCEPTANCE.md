# Codex：Yang-Kura Beta 3 正式日用候选专项实机验收

## 任务性质

只验证自动化尚不能替代的两个范围：真实音乐库只读链、临时副本写入/回滚链。不要重跑全部页面、U28～U40 或发布打包链，不修改源码，不提交 Git。

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

必须满足：分支为 `release/beta3-daily-closeout`、`HEAD = remote`、tracked/cached diff 为 0。开始时记录实际 SHA；测试期间远端分支变化则停止并报告 `BASELINE_INVALID`。

## 独立环境

```powershell
$Root = Join-Path $env:TEMP 'YangKura-Beta3-Acceptance'
$Profile = Join-Path $Root 'profile'
$TempLibrary = Join-Path $Root 'library-copy'
Remove-Item $Root -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $Profile,$TempLibrary | Out-Null
$env:YANG_KURA_USER_DATA_ROOT = $Profile
npm run desktop:preview
```

## A. 真实音乐库只读

目录：`D:\CloudMusic\VipSongsDownload`。

- 选择音乐库目录并读取已有 Index；没有 Index 时只执行只读预览，不写真实目录。
- 检查歌曲、专辑、艺术家、文件夹、搜索、筛选和至少一个详情页。
- 播放一首真实音乐；检查时长大于 0、进度、暂停/继续、Seek、队列和历史。
- 在设置中选择或确认 mpv；关闭并重启后路径和播放能力仍保持。
- 禁止在真实目录创建、覆盖、移动、删除、重命名或写回元数据。

## B. 临时副本写入与回滚

从真实库复制少量测试样本到 `%TEMP%\YangKura-Beta3-Acceptance\library-copy`；所有写入只发生在这里。

验证：

1. 扫描预览与 Index 写入；
2. 自动备份和读取新 Index；
3. copy-only 导入；
4. 受控 move-only；
5. 同名/目标已存在冲突；
6. 人为制造中途失败，确认停止与回滚；
7. OperationLog 包含操作、结果和回滚摘要；
8. 备份恢复后集合和轨道统计一致；
9. 不出现临时绝对路径泄漏到日常 UI。

## C. 结束状态

- 关闭应用后相关 Electron、Yang-Kura 和 mpv 进程为 0。
- 仓库 tracked/cached diff 为 0。
- 真实音乐库没有写入。
- 临时目录保留作为证据，不自动清理。

## 输出

保存到 `%TEMP%\YangKura-Beta3-Acceptance\report`：

- `BETA3_COMMAND_RESULTS.txt`
- `BETA3_FINAL_REPORT.md`
- `BETA3_FUNCTION_MATRIX.md`
- `BETA3_DEFECTS.md`

最终状态：`PASS`、`PARTIAL`、`FAIL` 或 `BASELINE_INVALID`。未执行项必须写 `NOT TESTED`。完成后停止，不修代码、不提交、不扩展范围。
