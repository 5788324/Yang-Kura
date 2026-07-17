# Yang-Kura 工作日志

> 仅记录当前有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34 — 联合审计与交付规则

- PR：#56
- 合并提交：`96885e2f5da6d24891e9e8e041ef681f13446f1c`
- 完成架构审计、依赖图、重构待办和关键行为冻结清单。
- 建立低风险任务批量修改、单一 PR、单次最终门禁规则。
- 建立文档轻量 CI。

### U35-A — 共享合同与 Design System 基础

- PR：#57
- 合并提交：`a8d931985ea804b17582693bce82ffe7a62b26a0`
- 建立唯一 `IPC_CHANNELS`、`IpcResult<T>`、`IpcError` 与错误分类。
- 建立暮夜琥珀、雾光象牙语义 Token 和基础 UI primitives。

### U35-B — 正式主题与生产 AppShell

- PR：#58
- 合并提交：`5937903c932bdabb0fbb0115b4312fb14a57d79e`
- 两套正式主题投入生产运行。
- Renderer 入口接入 ThemeRuntimeBridge 与 AppShell production bridge。
- TopBar、Sidebar、内容区、PlayerBar、队列和续播提示接入语义 Token。

### U36-A — 导航与 Preload IPC 统一

- PR：#59
- 合并提交：`b55196f5d4a374125a89b0640f221b8efc333e28`
- 建立 `src/app/navigation.ts` 页面元数据事实源。
- Sidebar 改为消费统一导航注册表。
- Preload 请求类型拆到 `electron/preload/contracts.ts`。
- Preload 所有 IPC 调用改用 `IPC_CHANNELS`。

### U36-B — App Shell、Router 与 Overlay 拆分

- PR：#60
- 合并提交：`00a2bad8ca24f68048aa4d48d5cc20a0407ecb1a`
- 新增 `TopBar.tsx`、`AppRouter.tsx`、`QueueDrawer.tsx` 和 `PlayerOverlayHost.tsx`。
- `App.tsx` 仅保留顶层状态、业务协调与壳组合。

### U36-C — Main IPC 分域注册

- PR：#61
- 合并提交：`27d2076029cd2221183bb69b1d0d79ca078d974d`
- 建立共享 invoke registrar 与 Library、Media、Player、Metadata、Importer 五个领域注册模块。
- Main 不再直接调用 `ipcMain.handle/removeHandler`，channel 全部来自 `IPC_CHANNELS`。

### U37-A — 资源库页面状态与错误恢复

- PR：#62
- 合并提交：`63fcd76121f82be024f93ac0d7f11a8edee067ff`
- 新增 `LibraryPageState` 和 `LibraryRouteBoundary`。
- AppRouter 为首页、音声库、RJ 详情和音乐库建立页面边界。
- RJ 详情 ID 失效时提供明确返回入口。

## 2026-07-17

### U37-B — 首页与音声库列表 UI

- PR：#63
- 合并提交：`0d5815da9132d3697b048ef0b9cfcf43bf1c6552`
- 新增 `HomeLibraryPage.tsx` 和 `AsmrLibraryPage.tsx`。
- 迁移首页、搜索、排序、筛选、网格/列表、多选和批量加入歌单。
- 保留大库搜索索引、渲染窗口、Index、播放、字幕、元数据覆盖和文件安全语义。

### U37-C — RJ 详情 UI

- 合并提交：`7587308b0b91cfb0f4e985b850a00915875d28cf`
- 新增 `RjDetailPage.tsx`，迁移详情 Hero、播放入口、作品信息、字幕覆盖和资源健康状态。
- 音轨列表使用共享 `TrackRow`，支持播放、队列、收藏、外部打开和文件管理器定位。
- 新增 `RjMetadataDialog.tsx`，保留本地覆盖、清除覆盖、DLsite 查询、差异预览和字段选择性应用。
- 评分、个人听音状态和笔记统一保存到本地元数据覆盖层，不修改媒体文件。

### 项目治理与发布策略更新

- PR：#68
- 合并提交：`4e9bdcf811133e7d8740b76fd01b1d07fb32d2a8`
- 创建 Issue #65：完成媒体库并发布个人日用版。
- 创建 Issue #66：渐进式结构治理与质量提升。
- 关闭被后续主线取代的遗留 PR #54。
- 明确项目仅供个人本地使用，简单相关任务默认合并完成。
- 大型功能长期冻结，媒体库完成后直接发布个人日用版。

### U37-D — 音乐库与详情 UI

- PR：#69
- 新增 `src/features/library/MusicLibraryPage.tsx`，替换旧音乐库生产路由。
- 完成歌曲、专辑、艺术家、文件夹四种正式视图。
- 专辑、艺术家和文件夹支持钻取详情、返回导航、播放全部和全部加入队列。
- 专辑墙与分组使用共享 `MediaCard`，曲目列表使用共享 `TrackRow`。
- 支持页面/全局搜索、排序、仅看收藏、曲目多选、全选当前结果和批量加入队列。
- 保留播放、队列、收藏、外部打开、文件定位、音乐元数据覆盖和大库渲染窗口。
- 新增语义主题样式、窄窗口响应布局、键盘激活和 reduced-motion。
- 删除旧 `src/components/MusicLibrary.tsx`，不保留新旧实现双轨。
- U32 Electron 审计升级为验证四视图、钻取详情、批量队列、收藏筛选和窄窗口。
- 当前任务推进到 Windows 发布候选与个人日用版发布。

## 当前结论

```text
U34～U36：完成
U37-A：完成
U37-B：完成
U37-C：完成
U37-D：完成
当前任务：Windows 发布候选与个人日用版发布
技术债：持续治理
大型功能：长期冻结
```
