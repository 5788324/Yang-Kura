# K2-R5 Reference UI Audit

更新日期：2026-09-26  
状态：**REFERENCE-DRIVEN UI ROUTE LOCKED**

## 目标

K2-R5 不再以“AI 从零生成播放器 UI”为主要路线。

改为：

```text
成熟播放器真实源码
→ 拆 Layout / Component / Interaction / Density
→ 判断许可证边界
→ 建立 Kura Reference Map
→ 独立重写成 Kura React / Compose
→ Windows 截图 QA
```

AI 负责分析、重构、适配和实现，不负责凭空发明整套视觉。

## 审计对象

| 项目 | 当前技术/定位 | License | Kura 使用方式 |
|---|---|---|---|
| YesPlayMusic | Vue + Tauri / 成熟音乐 UI | 前端/Tauri MIT；Rust sidecar GPL-3.0-only | **可直接研究/移植前端视觉思想；优先重写成 React** |
| SPlayer-Next | Vue + Desktop player / Lyrics / FullPlayer | AGPL-3.0 | **只参考交互/比例，禁止复制源码** |
| Feishin | React + Electron / 大库 / Navidrome/Jellyfin | GPL-3.0 | **架构和大库 UX 参考，禁止复制源码** |
| fooyin | C++/Qt / 高度可配置桌面播放器 | GPL-3.0+ | **Studio Graphite 管理思想参考** |
| Resonate | Kotlin + Compose + Media3 + Room | MIT | **Android 首选可移植 UI 骨架** |
| Aurora | Kotlin + Compose + Media3，多来源播放器 | Apache-2.0 | **Android 多来源/平板/高级播放参考，可选择性移植** |

## 当前活跃性结论

2026-09 下旬：

- SPlayer-Next、Feishin、fooyin、Aurora 均有近期提交；
- fooyin 2026-09-24 发布 v0.13.1；
- Resonate 是 2026 新项目，规模较小，但架构现代且 MIT；
- YesPlayMusic 当前 nagi-studio 分支仍维护，前端/Tauri 代码沿用 MIT。

活跃性不是视觉选择的唯一标准；Kura 只提取已经成熟且能长期维护的模式。

---

# Desktop 源码审计

## 1. YesPlayMusic — Music 页视觉骨架

### 已核对源码

- `src/views/library.vue`
- `src/views/album.vue`
- `src/components/TrackList.vue`
- `src/components/CoverRow.vue`

### 值得 Kura 采用

#### A. Library 不用 Dashboard

`library.vue` 的核心是：

```text
一个主内容块
+ TrackList
+ Tabs
+ CoverRow
```

不是 KPI / Widget Dashboard。

Kura Home 和 Music Library 应继续采用“内容本身是视觉主体”，而不是工程面板。

#### B. Album Detail 的比例成熟

`album.vue`：

```text
288px Cover
+ Title / Artist / Year / Count / Duration
+ Primary Play
+ Secondary Actions
+ TrackList
+ More by Artist
```

这套层级非常适合作为 Kura Music Album Detail 的基础。

Kura 不直接复制固定 288px，而使用 responsive token：

```text
desktop wide: 240–288
desktop medium: 200–240
compact: 160–200
```

#### C. CoverRow 的信息层级值得保留

`CoverRow.vue`：

- Cover 是主视觉；
- title 两行；
- secondary metadata 12px；
- artist 使用独立视觉处理；
- grid gap 大于文字内部 gap。

Kura MediaCard 应借这个“Cover > Title > Meta”层级。

#### D. TrackList 的右键/双击心智成熟

`TrackList.vue` 已经证明：

- double click play；
- right-click context actions；
- liked / queue / playlist actions；
- Album / Playlist / Generic TrackList 共用底层组件。

Kura 应保留相同桌面心智，但用现有 `MediaRowBase` / `TrackRow` 实现，不复制 Vue 代码。

### 不采用

- 旧式网络音乐账号/云盘 IA；
- 固定 3 列 track grid；
- 过大的 Library 用户头像标题；
- 与网易云在线服务绑定的动作。

---

## 2. SPlayer-Next — Player / Lyrics 主参考

### 已核对源码

- `src/layouts/MainLayout.vue`
- `src/components/player/PlayerBar.vue`
- `src/components/player/FullPlayer/*`
- `src/components/player/Lyrics/*`
- `src/components/player/PlayerControls.vue`
- `src/components/player/TrackInfo.vue`

### 值得 Kura 采用

#### A. Player geometry 本身可切换

`MainLayout.vue` 已经把：

```text
floating player
default docked player
sidebar-aware player geometry
```

做成同一个 PlayerBar 的外层布局变化。

这与 Kura Theme Delta Matrix 完全吻合：

```text
Midnight / Aurora = floating
Studio = docked
```

Kura 应继续保持“一套 Player state / 一套 controls / 不同 geometry”。

#### B. Floating Player 不需要占满窗口

SPlayer floating 模式：

- 左右留边；
- max-width；
- rounded full/pill；
- pointer events 与 FullPlayer 状态分离。

Kura Midnight Player 可以借这个比例思想，但不复制 AGPL 源码。

#### C. Player 拆分粒度成熟

SPlayer 分开：

- PlayerBar
- PlayerControls
- PlayerTimeInfo
- TrackInfo
- Toolbar
- QualityControl
- FullPlayer
- Lyrics

Kura R5.2/R5.3 应采用类似职责拆分，而不是一个巨型 `PlayerBar.tsx`。

### 不采用

- SPlayer 的视觉 token/源码；
- AGPL 组件直接复制；
- 在线音乐服务专属功能。

---

## 3. Feishin — 大库页面结构主参考

### 已核对目录

`src/renderer/features/` 已按：

- albums
- artists
- folders
- home
- lyrics
- now-playing
- player
- playlists

拆成 feature。

Album 又继续拆：

- `album-list-header.tsx`
- `album-list-header-filters.tsx`
- `album-list-content.tsx`
- `album-list-infinite-grid.tsx`
- `album-list-infinite-detail.tsx`
- `album-detail-header.tsx`
- `album-detail-content.tsx`

### 值得 Kura 采用

#### A. Header / Filter / Content 分离

Kura 当前页级组件仍偏重。

R5 应改为：

```text
MusicLibraryPage
├─ MusicLibraryHeader
├─ LibraryFilterBar
├─ LibraryView
│  ├─ TrackVirtualList
│  ├─ AlbumVirtualGrid
│  ├─ ArtistGrid
│  └─ FolderTree
└─ EmptyState
```

ASMR 同理。

#### B. Grid / Detail / Infinite 是独立实现职责

这对 Kura 69k Track 很关键。

Grid virtualization 不应隐藏在 MediaCard 里，而应是 Library View 层职责。

#### C. Feature-first folder structure

Kura 可以保持 Shared UI + Feature 两层：

```text
shared/ui/
features/music/
features/asmr/
features/player/
```

而不是把所有播放器组件都放在通用 components 根目录。

### License

GPL-3.0。

**禁止复制 Feishin 源码。**

只提取：

- feature boundaries；
- list/grid/detail separation；
- filter/header interaction；
- infinite/virtualized list strategy。

---

## 4. fooyin — Studio Graphite UX 参考

fooyin 当前明确定位为 customizable desktop music player，包含：

- flexible playback；
- library management；
- playlists；
- scripting；
- 可重排 UI；
- plugin/widget architecture。

2026-09-24 发布 v0.13.1，仍高度活跃。

### Kura 只借

- dense library 的“专业工具感”；
- column thinking；
- library / playlist 分工；
- metadata 作为可见信息而不是藏进卡片；
- configurable workspace 的思路。

### Kura 不借

- 无限可配置布局；
- plugin widget canvas；
- scripting UI。

Kura 是私人播放器，不需要变成 foobar2000 类通用壳。

### License

GPL-3.0+，只参考。

---

# Android 源码审计

## 5. Resonate — Android UI 首选骨架

### 已核对

- `RootScaffold.kt`
- `NowPlayingScreen.kt`

### 为什么非常适合 Kura

技术完全贴近目标：

```text
Kotlin
Jetpack Compose
Media3
Room
Material 3
```

而且 MIT。

### 可直接吸收的结构

#### A. RootScaffold

当前模式：

```text
Scaffold
├─ Screen NavHost
├─ MiniPlayer
└─ Bottom Navigation
```

这就是 Kura Android 正确的基本骨架。

Kura 改成：

```text
Home
Music
ASMR
我的
```

Search 从独立 Bottom Tab 改为 global/page search。

#### B. MiniPlayer → FullPlayer

Resonate 使用：

- MiniPlayer 常驻；
- Full player overlay；
- vertical swipe collapse；
- animation；
- state 不随页面销毁。

这与 Kura Desktop Player state decoupling 原则一致。

#### C. NowPlaying 控件位置

其 transport 控件放在下部，强调单手可达。

Kura Android 应保留：

- artwork 上半区；
- title/meta；
- progress；
- main transport；
- secondary actions；
- queue/sleep/speed/lyrics。

RJ 模式把 secondary actions 中 Lyrics 替换/扩展为：

- Subtitle
- Chapter
- Bookmark
- Sleep
- Speed

#### D. Chroma / artwork-derived accent

Resonate 已有 ChromaEngine 和颜色钳制。

Kura Aurora Dream Android 可直接借这种**只在 Track change 时更新颜色**的思想。

### License

MIT。

未来 Android 解冻后，Resonate 可以进入“可直接移植/改写”的代码候选，而不仅是截图参考。

---

## 6. Aurora Android — 多来源与 Adaptive 参考

Aurora：

- Kotlin / Compose / Media3；
- Local + Navidrome + Jellyfin + 其他来源；
- Apache-2.0；
- 有 Window Layout / Rail / 多来源下载等复杂状态。

### Kura 值得借

- 多 Source 的 UI state；
- tablet / rail adaptive layout；
- 下载/缓存状态；
- advanced Now Playing；
- source-error feedback；
- remote/local unified media presentation。

### 风险

`AuroraApp.kt` 当前职责非常大。

Kura 不应复制它的巨型 App composable，而应只移植：

- adaptive layout patterns；
- source state components；
- selected player components；
- theme primitives。

### License

Apache-2.0，可选择性移植并保留 notice。

---

# 结论：Kura Reference Stack

## Desktop

```text
App Shell
  ← SPlayer layout geometry
  + Kura own shell

Music Library
  ← YesPlayMusic visual hierarchy
  + Feishin list/grid/filter architecture

Album / Artist
  ← YesPlayMusic visual proportions
  + Feishin detail architecture

Track List
  ← YesPlayMusic interaction model
  + Feishin large-list architecture
  + Kura virtualization

PlayerBar
  ← SPlayer geometry / decomposition
  + Kura player state

Full Player / Lyrics
  ← SPlayer interaction inspiration
  + Kura own React rewrite

Studio Graphite
  ← Feishin + fooyin management principles

RJ / ASMR
  ← Kura own product model
  + audiobook/long-audio patterns
  + Player primitives shared with Music
```

## Android

```text
App Scaffold
  ← Resonate (MIT)

MiniPlayer / FullPlayer
  ← Resonate (MIT)

Artwork Chroma
  ← Resonate idea/code candidate

Adaptive / Multiple Sources
  ← Aurora (Apache-2.0)

RJ Screens
  ← Kura own content model

Theme tokens
  ← KURA_DESIGN_SYSTEM_V2
```

---

# License Gate

## A — Code candidate

Can inspect and selectively port with attribution/notice as required:

- YesPlayMusic frontend/Tauri — MIT portion only；
- Resonate — MIT；
- Aurora — Apache-2.0。

Before actual copy, record exact source file and license in `THIRD_PARTY_NOTICES`.

## B — Inspiration only

Do not copy code:

- SPlayer-Next — AGPL-3.0；
- Feishin — GPL-3.0；
- fooyin — GPL-3.0+。

For B projects:

```text
observe behavior
→ write Kura spec
→ independent implementation
```

No source snippet should enter Kura production code.
