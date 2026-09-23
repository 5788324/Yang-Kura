# K2-R5 Android Design Mapping

日期：2026-09-23  
状态：DESIGN ONLY — ANDROID IMPLEMENTATION FROZEN

## Principle

Desktop 与 Android 共用品牌/Token/组件语义，不共用错误的平台布局。

## Navigation

Phone：

```text
Home
Music
ASMR
我的
```

Search：

- per-page search；
- global Search destination；
- 不占 bottom nav slot。

我的：

- Playlists；
- Favorites；
- History；
- Offline/cache（未来）；
- Settings。

Tablet/Landscape：

- NavigationRail；
- adaptive secondary pane；
- no hover assumptions。

## Component Mapping

| Desktop | Android Compose |
|---|---|
| Sidebar | NavigationBar / NavigationRail |
| ContentHeader | TopAppBar + page toolbar |
| FilterBar | horizontal FilterChip row + ModalBottomSheet |
| virtual list | LazyColumn |
| media grid | LazyVerticalGrid adaptive |
| RightDock Queue | ModalBottomSheet / side pane on tablet |
| PlayerBar | MiniPlayer above NavigationBar |
| FullPlayer | full-screen composable overlay/destination |
| right click | long press + Bottom Sheet |
| hover action | explicit overflow button / contextual action |
| Tooltip | semantics / detail sheet |
| CSS token | CompositionLocal KuraThemeTokens |

## Player

MiniPlayer：

- always visible when media active；
- above NavigationBar；
- 48dp+ touch targets；
- tap artwork/full button opens Full Player。

Full Player：

- full screen；
- same player contract as Desktop；
- shared transition may be added later；
- swipe-down optional；
- Queue/Menu use Sheet。

## Theme Mapping

Midnight：

- standard mobile density；
- subtle glass MiniPlayer；
- content surfaces solid。

Studio：

- compact list；
- solid MiniPlayer；
- minimal animation。

Aurora：

- comfortable density；
- neutralized artwork ambient；
- subtitle/chapters stronger；
- no real-time blur。

## Do Not Implement Yet

- Android project；
- APlayer fork；
- Room migration；
- Media3 service；
- remote/OpenList；
- sync。

这些仍在 Desktop 2.0 稳定后解冻。
