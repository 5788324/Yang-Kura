# NEXT_CHAT_HANDOFF

## 当前必须先知道

```text
项目：Yang-Kura
核心版本：0.167.0-mvp129
代码事实来源：最新 origin/main
U02～U26：已完成
U27 最终结论：NO-GO
当前任务：U28 修复并复验资源库授权、真实 Index、浏览与播放闭环
阻断问题：MAJ-001、MAJ-002
MVP130：继续冻结，禁止合入
```

完整交接见：

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
```

## 接手第一步

用户反馈上述 Major“可能已经修复并推送到 Git”，但交接时 GitHub `main` 未发现可验证的产品修复提交或开放修复 PR。

因此新对话必须先：

```powershell
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git rev-parse HEAD
git log -15 --oneline --decorate
```

- 工作区不干净时停止，不要 stash、reset 或覆盖。
- 检查最近提交、远端分支和 PR，确认修复是否已在 main、其他分支或尚未存在。
- 不以提交标题代替源码审查和实机验证。

## U28 决策

1. 修复已在 main：不重复开发，直接跑门禁和真实 GUI 闭环。
2. 修复在分支/PR：审查 diff、运行门禁、复验后正式合并。
3. 没有修复：从最新 main 建独立 U28 分支，只修 MAJ-001/MAJ-002。

## U28 完成条件

- 原生目录选择后设置页授权状态一致。
- 读取已有记录/一键扫描按真实能力启用。
- Index 可读取或安全生成。
- 顶栏、设置、浏览页和播放器使用同一数据快照。
- 诊断页不再以 Demo 状态冒充真实资源状态。
- 临时样本可写测试通过。
- 真实 `E:\arsm` 只读授权、浏览和播放通过。
- U02～U28 verifier、`verify:stable` 和生产构建通过。
- 用户配置恢复、Git clean、无残留进程。

## 后续主线

```text
U28 资源库真实闭环
→ U29 播放器与字幕
→ U30 UI、三主题、窗口与 DPI
→ U31 导入器与数据安全
→ U32 Windows 发布候选
→ U33 新 Beta 发布收口
```

不得跳过 U28 启动下载器、AI Agent、SQLite、远程资源库、Player Core v2 或全项目重构。