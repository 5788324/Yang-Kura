# U36-A 应用壳、导航与 Preload IPC 统一

## 目标

在不重写资源库、播放器、Index 或导入事务的前提下，先消除两个明确重复源：

1. Sidebar 内部页面清单；
2. Preload 内部裸 IPC channel 字符串与请求类型混合。

## 本批交付

### 统一导航注册表

`src/app/navigation.ts` 成为页面元数据事实源：

- 页面 ID；
- 用户可见名称；
- 日常/维护分区；
- 是否允许全局搜索；
- 是否显示在 Sidebar。

`Sidebar.tsx` 只消费 `DAILY_NAVIGATION_ROUTES`，不再维护本地 `DAILY_NAV_ITEMS`。

维护页仍保留内部入口，但不出现在日常导航。

### Preload 合同拆分

`electron/preload/contracts.ts` 负责：

- 资源库请求；
- Index 维护请求；
- 媒体、字幕和外部打开请求；
- mpv 请求、状态与事件；
- 元数据 Provider 请求；
- copy-only、move-only 与 Index patch 请求。

`electron/preload.ts` 只负责：

- `window.yangKura` API；
- typed invoke/subscribe；
- 稳定运行时 capability 状态；
- `contextBridge.exposeInMainWorld`。

所有 channel 均来自 `electron/ipc/contracts.ts` 中的 `IPC_CHANNELS`。

## 保持不变

- `window.yangKura` 方法名称和参数形状；
- Renderer 不接收绝对路径或 `file://`；
- Root token 和相对路径边界；
- Local JSON Index 行为；
- HTMLAudio/mpv 行为；
- 导入事务、回滚和 OperationLog；
- 元数据覆盖和 Provider 行为。

## 后续 U36-B

- 从 `App.tsx` 拆出 TopBar；
- 拆出页面 Router；
- 拆出 Queue/Lyrics/Resume Overlay Host；
- Main 侧 `ipcMain.handle` 按域迁移到 `IPC_CHANNELS`；
- 将 Preload 请求合同继续收敛为请求/响应映射，而不是单独请求类型集合。

## 验收

- TypeScript；
- Renderer 与 Electron build；
- U28～U32 Electron E2E；
- focused verifier；
- stable regression；
- portable 与 NSIS acceptance。
