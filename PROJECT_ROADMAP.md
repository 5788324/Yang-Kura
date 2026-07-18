# PROJECT_ROADMAP

> 长期路线真源。公开代码事实以 GitHub `main` 为准；Beta 3 候选状态以 PR #91 和最新有效 Codex 报告为准。

## 1. 当前基线

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
PR：#91
候选分支：release/beta3-daily-closeout
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
原发布主线：Beta 3 正式日用发布收口（暂停）
当前主线：暂停开发并交接 B3-MAJ-001
发布状态：NO-GO
大型功能：长期冻结
```

## 2. 已完成主线

- U34～U37：统一 IPC、语义 Token、AppShell 和正式媒体库页面。
- U38：Queue/Persistence、Player Backend、Subtitle lifecycle 分域。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。
- U40-A～C：快速维护、全产品旅程和 UI 收口。
- U40-D～D3：真实库读取、分组、独立 Profile、单实例、主题、歌单、导入页、mpv 和 HTMLAudio 停滞状态收口。
- Beta 2：已发布并完成远端资产校验。

## 3. 下一对话的第一阶段：重新诊断

1. 读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md` 和 `docs/BETA3_BLOCKER_STATUS.md`。
2. 拉取 PR #91 最新分支并确认当前 HEAD。
3. 比较 `0cc9779e...` 到当前 HEAD 的播放器、TrackRow、测试和工作流改动。
4. 不使用 v1/v2/v3 本地包作为补丁来源。
5. 让测试在失败时记录完整 PlayerBar 状态、renderer console、HTMLAudio 事件、mpv 事件和 IPC 结果。
6. 先判断第二条音轨实际处于：未切换、resolving、mpv、html-audio、unsupported 中的哪一种。

## 4. 第二阶段：最小修复

完成条件：

```text
第一条主区域播放 PASS
第二条行尾按钮播放 PASS
第二条切换后 duration > 0
progress 推进
pause / resume / seek PASS
重启恢复 PASS
进程回收 PASS
```

只允许一个最小修复候选。失败后先分析证据，不连续叠加猜测性补丁。

## 5. 第三阶段：发布前实机范围

播放器专项通过后才执行：

- `%TEMP%\YangKura-Beta3-Acceptance` 中的 Index 备份与恢复；
- copy-only；
- move-only；
- 同名冲突；
- 人为失败和回滚；
- OperationLog；
- `D:\CloudMusic\VipSongsDownload` 真实目录只读核对，禁止写 Index。

## 6. 第四阶段：PR 与发布

1. 同步 package 与 lockfile 到 `0.170.0-beta.3`。
2. 全部实机 PASS 后更新现有 PR #91。
3. 只执行一次最终 L3 CI。
4. 合并到 `main`。
5. 创建 `v0.170.0-beta.3` prerelease。
6. 回读目标提交、资产名、大小和 SHA-256。
7. 同步 README、状态、路线图、工作日志和交接。

## 7. 发布后维护

真实 Bug → 数据/Index/导入/播放/进程 → 字幕/搜索/UI/性能 → 明确的小型功能 → 触链技术债。

## 8. 长期冻结

下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号和插件市场继续冻结。
