# Yang-Kura U34 依赖图

> 目标：说明当前依赖、主要耦合点和 Beta 2 的目标依赖方向。  
> 本文不是要求一次性搬迁目录，而是后续纵向迁移的导航图。

## 1. 当前运行时依赖

### 1.1 Renderer

```text
src/main.tsx
  ↓
src/App.tsx
  ├─ Sidebar / PlayerBar / Queue Drawer / Lyrics Overlay
  ├─ Dashboard / Library / Detail / Playlist / Importer / Settings / Diagnostics
  ├─ useLocalStorage
  ├─ useAudioPlayer
  ├─ libraryIndexAdapter
  ├─ playlist / queue / history persistence
  ├─ metadataOverrideService
  ├─ librarySessionService
  └─ window custom events
```

核心问题：`App.tsx` 不只是组合器，同时承担资源库加载、元数据更新、歌单写入、队列对账、恢复播放、路由和多个弹层状态。

### 1.2 播放器

```text
PlayerBar / LyricsPanel / Library pages
  ↓
useAudioPlayer
  ├─ Browser HTMLAudio
  ├─ window.yangKura mpv IPC
  ├─ window.yangKura media URL resolve
  ├─ window.yangKura subtitle read
  ├─ Queue persistence
  ├─ Playback history
  ├─ Completion policy
  └─ Runtime reconciliation
```

核心问题：一个 hook 同时承担 Controller、Backend Adapter、Queue、History、Persistence 和 Subtitle Loader。

### 1.3 设置与维护

```text
SettingsPage
  ├─ Appearance
  ├─ mpv detection/preference
  ├─ Root authorization/sessionStorage
  ├─ Scanner / Index read-write
  ├─ Index health/removal
  ├─ Backup/restore/retention/history
  ├─ Path records
  └─ Historical MVP maintenance models

DiagnosticsPage
  ├─ Fixture scanner and planned contracts
  ├─ Historical Electron contract models
  ├─ Historical UI/regression models
  ├─ Importer MVP strategy/preview/executor models
  └─ Current diagnostics and maintenance surfaces
```

核心问题：日常设置、真实维护功能和历史项目记录共用同一运行时页面。

## 2. 当前 Electron 边界

```text
Renderer
  │ window.yangKura
  ▼
src/types/electron-api.d.ts
  ↕（手工同步）
electron/preload.ts
  │ ipcRenderer.invoke('raw-channel')
  ▼
electron/main.ts
  ├─ request as Partial<T>
  ├─ 手工字段检查
  ├─ root token map
  ├─ Scanner / Index / Maintenance
  ├─ Media protocol
  ├─ mpv
  ├─ Metadata Provider
  └─ Import transaction
```

### 重复事实源

| 内容 | 当前位置 |
|---|---|
| request 类型 | main / preload / electron-api.d.ts |
| result 类型 | main 返回对象 / electron-api.d.ts |
| IPC channel | preload 字符串 / main 字符串 |
| capability 状态 | main shell status / preload shell status / diagnostics service |
|错误状态|各 handler 自定义字符串联合类型|

## 3. 当前数据流

### 3.1 资源库

```text
Electron main 读取 library-index.json
→ preload 返回 sanitized index
→ Renderer 写 localStorage cache
→ dispatch yang-kura-library-index-loaded
→ App.tsx 读取 cache
→ libraryIndexAdapter
→ rjWorks / musicAlbums
→ metadataOverrideService 叠加本地覆盖
→ 页面显示
```

问题：真实数据回流依赖 localStorage + window event + App state，多处都能触发刷新。

### 3.2 播放

```text
页面选择 AudioTrack
→ useAudioPlayer 建立 queue/state
→ 尝试 mpv
→ 失败时 resolve yang-kura-media URL
→ HTMLAudio
→ time/progress event
→ history + queue persistence
→ PlayerBar / LyricsPanel
```

问题：后端、持久化和 UI state 没有清晰的应用层控制器。

### 3.3 导入

```text
ImporterPage / preview services
→ preload IPC
→ main-side preflight/transaction
→ copy/move + rollback + OperationLog
→ Index patch preview/readiness/write
→ read current index
→ Renderer cache/event refresh
```

优势：事务安全语义较完整。问题：流程和类型跨 Renderer/preload/main 分散，main.ts 中仍保留大量 MVP 阶段命名。

## 4. 目标依赖结构

```text
src/
├─ app/
│  ├─ AppShell
│  ├─ router
│  ├─ providers
│  └─ global-overlays
├─ features/
│  ├─ home
│  ├─ library
│  ├─ metadata
│  ├─ player
│  ├─ playlist
│  ├─ importer
│  ├─ settings
│  └─ maintenance
├─ domain/
│  ├─ library
│  ├─ media
│  ├─ playback
│  ├─ importer
│  └─ metadata
├─ application/
│  ├─ library-use-cases
│  ├─ playback-controller
│  ├─ importer-orchestrator
│  └─ maintenance-use-cases
├─ infrastructure/
│  ├─ electron-client
│  ├─ local-storage
│  ├─ index-adapter
│  └─ repositories
├─ shared/
│  ├─ contracts
│  ├─ result
│  ├─ events
│  ├─ ui
│  └─ utilities
└─ tests/

electron/
├─ main.ts                  仅启动和组合
├─ window/
├─ ipc/
│  ├─ channels.ts
│  ├─ register-library.ts
│  ├─ register-player.ts
│  ├─ register-importer.ts
│  └─ register-maintenance.ts
├─ services/
│  ├─ library
│  ├─ playback
│  ├─ importer
│  ├─ metadata
│  └─ maintenance
└─ preload/
```

## 5. 目标依赖方向

```text
React UI
  ↓
Feature Controller / Application Use Case
  ↓
Domain Model + Port
  ↑
Infrastructure Adapter
```

Electron 侧：

```text
Renderer Client
  ↓ shared contract
Preload Adapter
  ↓ shared channel registry
IPC Handler
  ↓
Electron Service
```

## 6. 硬性禁止依赖

1. `domain` 不得 import React、Electron、Node `fs/path`、localStorage。
2. UI 组件不得直接调用 `fs` 或写裸 IPC channel 字符串。
3. Feature 不得读取另一个 Feature 的内部 state；通过 Application service 或公共 Domain model 协作。
4. Renderer 不新增 `absolutePath` 或 `file://` 传输。
5. 运行时页面不得新增历史 verifier service、MVP 展示模型或隐藏锚点。
6. 新 IPC 必须从共享 channel/contract 导出。
7. Electron main 入口不再新增大段业务实现，只负责注册和生命周期。

## 7. 迁移顺序

### U35-A：共享基础

- `shared/contracts/ipc`；
- channel registry；
- `Result<T, E>` 与错误分类；
- Design Token 与基础 UI primitives。

### U35-B / U36：Shell 与维护边界

- App Shell/Router；
- Settings 拆分；
- AI Maintenance 独立入口；
- preload/main 契约统一；
- Electron main 按注册器拆分。

### U37：资源库

- Library repository/use cases；
- 首页、音声库、音乐库、详情页面；
- metadata/provider 边界。

### U38：播放器

- Player controller；
- HTMLAudio backend；
- mpv backend client；
- Queue/history persistence；
- Subtitle loader。

### U39：导入器

- Import application workflow；
- Transaction adapter；
- Index patch/refresh；
- OperationLog/rollback UI。

### U40：历史清理

- 历史 service 和 verifier 归档；
- 移除旧 barrel；
- 收紧 strict/import/complexity 门禁。

## 8. 迁移原则

```text
先建立新边界
→ 迁移一个纵向用户流程
→ 跑现有行为回归
→ 删除该切片旧入口
```

禁止先大规模移动文件、再等待未来补齐行为；任何 PR 合入后都必须保持可运行。
