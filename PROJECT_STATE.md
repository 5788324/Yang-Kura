# PROJECT_STATE

## 当前状态

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
主分支事实来源：GitHub main
候选分支：release/beta3-daily-closeout
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
PR #91：开放并保持阻断草稿
Beta 3 Release：尚未创建
发布结论：FAIL / NO-GO
当前任务：开发暂停，等待重新诊断 Beta 3 播放阻断
Git 工作方式：本地集中开发与验证完成后统一推送
大型功能：长期冻结，只有用户明确提出后才启动
```

## 已完成范围

- Beta 1 / Beta 2 已发布并完成远端资产校验。
- U34～U40-D3 的架构、正式媒体库、日常体验、真实库稳定性和 HTMLAudio 停滞状态主线已完成。
- Issue #66 已关闭。
- 双资源库、Local JSON Index、播放器、字幕、Queue、History、续播、导入事务、元数据覆盖、portable 和 NSIS 主链已存在。

## Beta 3 阻断状态

最新有效证据来自 Codex v2：

| 项目 | 结果 |
|---|---|
| 固定分支与 HEAD | PASS |
| 候选内部哈希 | PASS |
| 生产路由核对 | PASS |
| TrackRow 直接激活源码核对 | PASS |
| TypeScript lint | PASS |
| Renderer build | PASS |
| Electron build | PASS |
| 真实鼠标 E2E 后端时长 | FAIL |
| Windows GUI 播放复测 | NOT TESTED |
| 重启恢复 | NOT TESTED |
| 临时导入事务 | NOT TESTED |
| 提交与推送 | 未执行 |

阻断错误：

```text
Timed out waiting for player: RJ detail action backend duration
```

这只证明第二条音轨的后端时长链未完成，不能证明具体是 TrackRow、HTMLAudio、mpv、IPC 或测试观测逻辑中的哪一层。

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

- ChatGPT 在任务开始时一次性拉取并锁定源码基线。
- 分析、开发、批量修改、自动测试和文档同步均在同一工作区完成。
- 候选稳定前不逐文件远程提交、不频繁推送、不重复触发 CI。
- 完成后整理为 1～2 个逻辑提交并统一推送；真实 CI 失败最多追加一次修复推送。
- 需要实机验收时，ChatGPT 输出完整 Codex 提示词；用户只负责转发，Codex 按指定 branch/SHA 测试并回传证据。

## 仍需处理

1. 重新审计 `69fe73b...` 相对已知失败基线 `0cc9779e...` 的播放器和测试改动。
2. 构造可诊断的第二音轨切换测试，保存完整最后状态和后端事件。
3. 找到最小根因后制作单一候选，不叠加 v1/v2/v3 补丁。
4. 播放通过后补做临时导入事务和真实音乐目录只读链。
5. 发布 Beta 3 前同步 `package.json` 与 `package-lock.json` 到 `0.170.0-beta.3`。
6. Beta 3 后执行全项目功能/UI/按钮链审计和 Codex 实机验收。
7. 清理无用文件并发布 `1.0.0`。

## 禁止事项

- 不提前合并 PR #91 或创建 Beta 3 Release。
- 不把旧绿色 CI 当作最新 Windows 实机通过。
- 不让用户承担测试、构建、Git 或排错。
- 不使用逐文件提交和反复推送的临时补丁工作流。
- 不解冻下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号或插件市场；只有用户明确需要时另立任务。