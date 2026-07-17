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
- 修复曲目标题/艺术家布局和批量队列实时状态验收。
- TypeScript、U28～U32、focused verifiers、stable regression、生产构建全部通过。
- portable、NSIS、首次安装、重复安装、卸载、用户数据保留和进程退出全部通过。

### U37-D 文档收口

- PR：#70
- 合并提交：`8aadcc4bdd995f45d47eddf1d1d966f9c27d4b1c`
- 工作日志与 U37 执行计划同步到最终验收事实。

### Beta 2 个人日用版发布准备

- PR：#71
- 合并提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 版本升级为 `0.169.0-beta.2`。
- 发布计划、Release Notes、预检、Windows 构建、main-only 发布和资产回读升级为 Personal Beta Release。
- 旧 Beta 1 自动恢复工作流改为只读手动历史审计。
- U02～U27 历史字符串 verifier 退出当前 focused gate，U28～U37 当前结构 verifier 全部通过。
- PR 阶段 TypeScript、U28～U32、stable regression、portable、NSIS、安装卸载和发布资产组装全部通过。

### Beta 2 个人日用版发布 — 已完成

- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 标题：`Yang-Kura 0.169.0 Beta 2 · 个人日用版`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- 发布时间：`2026-07-17T05:21:02Z`
- portable：`Yang.Kura-0.169.0-beta.2-portable-x64.exe`，85,261,159 bytes，SHA-256 `2c5fa4be8460a7f591a1f2f4bb5a105e3001ca9dbd944a8a5ae324e4ef77a3e5`
- setup：`Yang.Kura-0.169.0-beta.2-setup-x64.exe`，85,491,801 bytes，SHA-256 `e6f234606922da9f96d8e6cad3f0b9a4b7adc1d3f74fc42d088ec752192ec885`
- `SHA256SUMS.txt`：213 bytes，SHA-256 `5ce43fe6bdefbe3036f08e47bcd2ccfcaa89e5b2b3f7c32a17ad948e46dcb9bd`
- 三个资产的远端文件名、大小、下载文件 SHA-256 和 GitHub digest 全部一致。
- 冻结记录：`release/beta2-publication-state.json`。
- Issue #65 完成并关闭。

## 当前结论

```text
U34～U36：完成
U37-A：完成
U37-B：完成
U37-C：完成
U37-D：完成
当前版本：0.169.0-beta.2
Beta 2：已发布并完成远端资产校验
当前任务：长期日用维护与 Issue #66 技术债治理
大型功能：长期冻结
```
