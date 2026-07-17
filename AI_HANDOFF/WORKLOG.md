# Yang-Kura 工作日志

> 仅记录当前有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34 — 联合审计与交付规则

- PR：#56
- 合并提交：`96885e2f5da6d24891e9e8e041ef681f13446f1c`
- 完成架构审计、依赖图、重构待办和关键行为冻结清单。
- 建立低风险任务批量修改、单一 PR、单次最终门禁规则。
- 建立文档轻量 CI。

### U35-A / U35-B — Design System 与生产 AppShell

- PR：#57、#58
- 建立唯一 IPC 契约、语义 Token、共享 UI primitives、两套正式主题和生产 AppShell。

### U36-A / U36-B / U36-C — 导航、Router、Overlay 与 IPC 分域

- PR：#59、#60、#61
- 建立统一导航注册表、Preload 请求合同、AppRouter、QueueDrawer、PlayerOverlayHost。
- Main IPC 按 Library、Media、Player、Metadata、Importer 分域。

## 2026-07-17

### U37-A — 页面状态与错误恢复

- PR：#62
- 合并提交：`63fcd76121f82be024f93ac0d7f11a8edee067ff`
- 首页、音声库、RJ 详情和音乐库建立页面边界与恢复入口。

### U37-B — 首页与音声库列表 UI

- PR：#63
- 合并提交：`0d5815da9132d3697b048ef0b9cfcf43bf1c6552`
- 新增 `HomeLibraryPage.tsx` 和 `AsmrLibraryPage.tsx`。
- 迁移搜索、排序、筛选、网格/列表、多选和批量加入歌单。

### U37-C — RJ 详情 UI

- 合并提交：`7587308b0b91cfb0f4e985b850a00915875d28cf`
- 新增 `RjDetailPage.tsx` 与 `RjMetadataDialog.tsx`。
- 保留播放、队列、收藏、字幕、文件健康、本地覆盖和 DLsite 选择性应用。

### 项目治理与发布策略更新

- PR：#68
- 合并提交：`4e9bdcf811133e7d8740b76fd01b1d07fb32d2a8`
- 创建 Issue #65 与 #66。
- 关闭被后续主线取代的遗留 PR #54。
- 明确大型功能长期冻结，媒体库完成后直接发布个人日用版。

### U37-D — 音乐库与详情 UI

- PR：#69
- 合并提交：`731b3a0e2e727a98d9a33b7ab7080b830dca5777`
- 新增正式 `MusicLibraryPage`，完成歌曲、专辑、艺术家、文件夹四视图和详情钻取。
- 支持搜索、排序、收藏、多选、全选当前结果、批量入队、播放全部和分组入队。
- 删除旧 `src/components/MusicLibrary.tsx`。
- TypeScript、U28～U32、focused verifiers、stable regression、生产构建和 Windows 打包链通过。

### U37-D 文档收口

- PR：#70
- 合并提交：`8aadcc4bdd995f45d47eddf1d1d966f9c27d4b1c`
- 工作日志与 U37 执行计划同步到最终验收事实。

### Beta 2 个人日用版发布准备

- PR：#71
- 合并提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 版本升级为 `0.169.0-beta.2`。
- 发布计划、Release Notes、Windows 构建、发布和资产回读升级为 Personal Beta Release。

### Beta 2 个人日用版发布 — 已完成

- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 发布时间：`2026-07-17T05:21:02Z`
- portable、setup 和 `SHA256SUMS.txt` 的远端文件名、大小、SHA-256 与 digest 全部一致。
- Issue #65 完成并关闭。

### U38-A — 播放器会话边界

- PR：#73
- 合并提交：`345d11555b219ae9eb48be0e1be539eca011b9e6`
- 新增 `playerQueueTransitions.ts`，负责上一首、下一首、shuffle、新队列和去重入队。
- 新增 `usePlayerSessionPersistence.ts`，统一 Queue、History、续播点、兼容键和节流写入。
- `useAudioPlayer.ts` 不再直接依赖 Queue/History 持久化服务。
- U29 Electron E2E 增加持久化数据清洗断言。
- Documentation Validation、TypeScript、U28～U32、focused verifiers、stable regression、生产构建、portable 和 NSIS 全部通过。

### U38-B — 播放器 Controller 与 Backend 边界

- PR：#75
- 合并提交：`4e7105386c2057bdcff95183b45b56aa6ceb5513`
- 新增 `usePlayerBackend.ts`，集中 HTMLAudio 生命周期、mpv 事件/命令、媒体解析、自动 fallback、Seek、音量/静音和播放状态同步。
- `useAudioPlayer.ts` 保留 Queue、完成策略、用户操作、会话持久化和字幕协调，对外 API 不变。
- `playerRuntimePolicy.ts` 提供共享 tokenized-local-track 类型守卫。
- U29 Electron E2E 覆盖真实后端、Seek、暂停、完成策略、Queue、四种字幕、重启授权、续播、上一首和下一首。
- U38-B verifier 禁止 Controller 重新直接持有 Audio、mpv 或 media resolver 副作用。
- Documentation Validation、TypeScript、U28～U32、U28～U38 focused verifiers、stable regression、最终生产构建、portable、NSIS、安装卸载、数据保留和打包后页面完整性全部通过。

### U38-C — 播放器字幕加载与状态边界

- PR：#77
- 合并提交：`bff4ff6641263a002509344216a01c7a79b4163b`
- 新增 `usePlayerSubtitles.ts`，集中字幕请求代次、过期结果丢弃、来源变更重载和结果映射。
- 切歌、重新授权或字幕来源列表变化时，旧请求立即失效，不能覆盖当前曲目。
- 新请求开始时清除旧歌词和旧来源，避免同一音轨重新绑定字幕后显示旧内容。
- `loaded`、`missing`、`error` 状态统一映射，并同步当前曲目与 Queue。
- `useAudioPlayer.ts` 不再直接调用字幕 IPC。
- 新增 U38-C 定向 verifier 和 `Player Fast Validation`。
- Windows 打包验收从普通 `src/**` 变更中移除，仅保留 Electron、依赖、安装器、打包配置和正式发布相关触发。
- U38 播放器连续结构治理到此收口；后续优先真实 Bug、字幕体验和日常 UI。

### U39-A — 播放器底栏语义主题一致性

- PR：#78
- 合并提交：`8431829427dbe3da86b976a18d124a7a119c5e8f`
- 底栏根表面改用 `player-bg`、`border-color` 和 `text-primary`。
- 曲目信息、播放控制、辅助控制、进度条、歌单菜单、音量弹层、Seek 预览、歌词浮窗和 Toast 全部进入语义主题体系。
- 移除播放器结构层的固定 zinc 深色；品牌强调、错误、警告和收藏状态色保留。
- 增加全局播放器 region 语义和统一品牌色键盘焦点。
- `Player Fast Validation` 按变更范围选择 U29 运行时矩阵或 U30 主题/无障碍矩阵。
- 不修改 mpv/HTMLAudio、播放状态、Queue、字幕、Seek、续播或完成策略。

### U39-B — 设置与 AI 维护入口边界

- 新增 `SettingsMaintenanceEntry.tsx`，从设置页明确进入独立 AI 维护路由。
- `DiagnosticsPageShell` 增加返回设置与返回维护概览。
- 维护概览只加载真实 Index 状态；性能面板和完整历史诊断继续按需加载。
- `diagnostics` 保持隐藏维护路由，不进入日常一级侧栏。
- 现有资源库检修、索引清理、备份与恢复能力暂不删除。
- 新增 `UI Fast Validation` 与 U39-B 定向 verifier。

### U39-C — 资源库授权持久化与重启恢复

- PR：#80
- 合并提交：`77f0152a80aea9fdfeaaf33f046d9a47d69f6d2e`
- 根因：Electron Main 的 root token 映射仅存在于内存，重启后 Index、媒体协议、mpv 和字幕无法解析旧 token。
- 新增 `RootAuthorizationStore`，在用户数据目录持久化并启动恢复授权记录。
- 重新选择既有资源库时复用存储记录，或从现有 Index 接管旧 token。
- Renderer 持久化脱敏授权摘要，Library Session 不再把正常重启误判为必须重新授权。
- U28 改为验证重启后无需重选即可读取空 Index，并继续读取真实 WAV 与播放。
- U29、构建和 Windows 打包链用于回归验证。

### U39-D — 雾光象牙浅色主题对比度

- PR：#81
- 新增 `theme-contrast-bridge.css`，在主题迁移期同步 Beta 2 语义 Token 与旧 Tailwind 变量。
- 三级文字、状态色和强调色对所有浅色表面达到至少 `4.5:1`。
- 可交互边界达到至少 `3:1`；白字强调按钮达到至少 `4.5:1`。
- 新增静态 WCAG verifier 与真实 Electron 运行时验收，覆盖主题挂载、变量同步、对比度和浅色首页/设置截图。
- UI Fast、U30、U28～U32、当前行为 verifier、stable regression 和生产构建通过。

## 当前结论

```text
U34～U36：完成
U37-A～U37-D：完成
U38-A～U38-C：播放器结构治理完成
U39-A：播放器底栏主题一致性完成
U39-B：设置与 AI 维护入口边界完成
U39-C：资源库授权持久化与重启恢复完成
U39-D：雾光象牙浅色主题对比度完成
当前版本：0.169.0-beta.2
Beta 2：已发布并完成远端资产校验
当前任务：继续修复 U39 审计剩余 Major/Minor 问题
大型功能：长期冻结
```
