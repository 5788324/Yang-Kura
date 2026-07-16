# U36-B App Shell、Router 与 Overlay 边界

## 结论

U36-B 完成应用壳第二批结构拆分，不改变资源库、播放、字幕、元数据、导入事务或文件安全行为。

## 已完成

### TopBar

- 新增 `src/app/TopBar.tsx`。
- 资源库连接状态、状态颜色和顶部应用栏从 `App.tsx` 移出。
- 保留 `#windows-app-bar` 与 `data-u30-runtime-status` 运行时验收合同。

### App Router

- 新增 `src/app/AppRouter.tsx`。
- Dashboard、资源库、详情、歌单、导入器、设置和维护页面的 lazy loading 与路由判断集中管理。
- Downloader 与 Diagnostics 仍是内部维护路由，不进入日常 Sidebar。
- `App.tsx` 不再直接 import 页面级组件。

### Player Overlay Host

- 新增 `src/app/PlayerOverlayHost.tsx`。
- Lyrics 全屏层与断点续播提示从 `App.tsx` 移出。
- 恢复续播仍通过原 `PlayerState` 更新，不新增存储键或媒体路径。

### Queue Drawer

- 新增 `src/app/QueueDrawer.tsx`。
- 队列摘要、轨道列表、清空队列和 Escape 关闭行为集中管理。
- 保留 `#u29-queue-drawer`、`#queue-close-button` 和队列持久化行为。

## App.tsx 当前职责

`App.tsx` 仅保留：

1. 顶层状态与持久化 Hook；
2. 资源库会话和播放历史协调；
3. 元数据、歌单和详情导航业务回调；
4. `TopBar + Sidebar + AppRouter + QueueDrawer + PlayerBar + PlayerOverlayHost` 组合。

页面 JSX、标题栏 JSX、队列 JSX、歌词层 JSX 和续播 JSX 不再由 `App.tsx` 持有。

## 不可破坏边界

- Renderer 不接收绝对路径或 `file://`。
- `window.yangKura` API 不变。
- Local JSON Index 行为不变。
- HTMLAudio/mpv fallback、队列、历史和续播行为不变。
- copy-only、move-only、回滚和 OperationLog 不变。
- 历史 DOM selector 仅在对应真实组件中保留，不新增隐藏 verifier 锚点。

## 下一步

U36-C 将 `electron/main.ts` 中的 `ipcMain.handle` 注册按 Library、Media、Player、Metadata、Importer 分域，统一消费 `IPC_CHANNELS`，仍不修改业务实现。
