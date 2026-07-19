# PROJECT_STATE

## 当前状态

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
主分支事实来源：GitHub main
候选分支：release/beta3-daily-closeout
PR 当前远端 HEAD：84e3caabec37a8de3843a51068b15bce76385524
PR #91：开放并保持阻断草稿
Beta 3 Release：尚未创建
发布结论：PARTIAL / NO-GO
当前任务：提交 R6 TrackRow 直接点击加固，并完成封面与导入事务定向验收
Git 工作方式：ChatGPT 只读拉取并交付完整源码包，Codex / DeepSeek 单一提交和推送
大型功能：长期冻结，只有用户明确提出后才启动
```

## 已完成范围

- Beta 1 / Beta 2 已发布并完成远端资产校验。
- U34～U40-D3 的架构、正式媒体库、日常体验、真实库稳定性和 HTMLAudio 停滞状态主线已完成。
- Issue #66 已关闭。
- 双资源库、Local JSON Index、播放器、字幕、Queue、History、续播、导入事务、元数据覆盖、portable 和 NSIS 主链已存在。

## Beta 3 门禁状态

R5 Windows fresh clone 基线：`84e3caabec37a8de3843a51068b15bce76385524`。该 SHA 的 GitHub Actions 已全部 PASS；Windows 验收工作区另外包含尚未提交的 TrackRow 直接点击加固。

| 项目 | 结果 |
|---|---|
| 固定 SHA / fresh clone | PASS |
| `E:\arsm` 大库读取 | PASS，137 个作品或专辑、6979 条音轨 |
| 第一条主区域 / 第二条行尾 | PASS，queue=14，duration=3:12 / 14:43 |
| pause/resume/seek、上一首/下一首、音量/静音 | PASS |
| HTMLAudio 后端与 mpv 缺失回退 | PASS，无错误 |
| 同 Profile 重启与继续播放 | PASS |
| 媒体、字幕、封面、目录保护 | PASS，四类数量未减少 |
| TrackRow 直接点击加固进入远端 | 待 R6 提交和 CI |
| 多个真实专辑独立封面 | PARTIAL，自动 verifier PASS，实机视觉核对待完成 |
| 真实小样本导入事务 | 待完成 |
| 物理声卡听感 | 自动工具无法确认；最终实机可人工补听 |

B3-MAJ-001、B3-MAJ-002、B3-MAJ-003 已由 R5 实机关闭。B3-MAJ-004 只剩真实多专辑视觉证据。R6 不重新执行整套播放验收，只需固定 SHA 快速点击复核、封面视觉核对和导入事务门禁。

## 已确认的发布终局

Beta 3 完成后不直接宣布项目完成，必须继续执行：

```text
Beta 3 播放与发布收口
→ 全项目 UI / 功能 / 按钮全链路审查
→ 自动化回归和问题修复
→ Codex Windows 实机全量验收
→ 清理无用源码、脚本、工作流、文档和构建遗留
→ 正式发布 1.0.0
→ 进入维护迭代
```

1.0.0 的定位是当前个人本地媒体库主链的正式稳定版，不新增大型模块。正式发布后默认只处理 Bug、UI 优化和明确的小功能。

## 1.0 前全量审查边界

- 枚举所有生产路由、页面、弹窗、菜单、快捷键和可点击按钮。
- 核对每个入口的完整链路：UI → Hook/Service → IPC/Electron Main → 文件系统或播放器后端 → 状态反馈、错误提示和恢复。
- 检查空按钮、失效入口、重复入口、不可达旧页面、错误文案、加载/空状态、取消和回滚。
- 覆盖资源库、RJ 详情、音乐库、播放、字幕、搜索、筛选、收藏、歌单、Queue、History、续播、导入事务、元数据、设置、主题、窗口、安装升级卸载和数据保留。
- 自动化通过后，由 Codex 使用固定分支与 SHA 在真实 Windows、真实媒体、GUI、声卡和文件系统上复验。
- Blocker/Major 未清零、关键按钮链路未覆盖或实机报告不完整时，不得发布 1.0.0。

## Git 与 Codex 协作

- ChatGPT 只读拉取并锁定源码基线，在本地完成分析、开发、自动测试、CI 诊断、文档和完整源码包；不直接写入 GitHub。
- Codex / DeepSeek 负责从固定 branch/SHA 应用源码包、创建单一提交并推送，避免逐文件提交和重复触发 CI。
- ChatGPT 在推送后只读取 PR、CI 与日志；需要修复时重新交付完整源码包。
- Codex 继续负责 Windows GUI、真实媒体、声卡、mpv、重启和文件系统验收。

## 仍需处理

1. Codex / DeepSeek 从远端 `84e3caab...` 应用 R6 完整源码包，创建一个提交并推送一次。
2. 只读确认新固定 SHA 的 Branch、Player Fast、U40-B、U40-D 和文档/架构工作流结果。
3. Codex 在新 SHA 上做定向实机复核：第一条主区域、第二条行尾和进程收尾；不重复整套长流程。
4. 在真实库抽查至少 12 个不同 RJ/专辑，记录封面路径/截图，确认不存在统一继承同一封面。
5. 在 `%TEMP%` 小样本中完成 copy-only、move-only、目标冲突、失败回滚与 OperationLog；不得使用真实媒体做破坏性测试。
6. 门禁全部 PASS 后再同步版本到 `0.170.0-beta.3`，合并 PR #91 并创建 Beta 3 prerelease。
7. Beta 3 后执行全项目功能/UI/按钮链审计、清理无用文件并发布 `1.0.0`。

## 禁止事项

- 不提前合并 PR #91 或创建 Beta 3 Release。
- 不把旧绿色 CI 当作最新 Windows 实机通过。
- 不让用户承担测试、构建、Git 或排错。
- 不使用逐文件提交和反复推送的临时补丁工作流。
- 不在诊断证据明确前修改播放器行为。
- 不解冻下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号或插件市场；只有用户明确需要时另立任务。
