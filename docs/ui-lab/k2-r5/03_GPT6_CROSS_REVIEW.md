# K2-R5 Cross-Model UI Review

角色：GPT-6 代替 Gemini 3.8 Flash 执行交叉 QA  
日期：2026-09-23  
输入：Claude Sonnet 5 proposal + Kimi K3 proposal

## 总结

两份方案的主方向高度一致，真正需要裁决的冲突不多。

共同认可：

- Music / ASMR 必须同级；
- 10TB 大库优先于视觉炫技；
- 滚动数据区禁止 Glass Soup；
- Music Detail / RJ Detail 应分模板；
- Player interaction contract 应统一；
- Android 必须遵循移动端布局；
- 三主题不能复制三份代码；
- Aurora 背景必须静态/缓存，不得实时逐帧模糊。

因此没有必要引入第四套方案。

## P0 — 必须阻止

### P0-1 Theme 不得改变顶级 IA

Claude 提出 Aurora 可弱化甚至取消独立 Home、不同 Theme 可显著改变导航呈现；这会破坏同一 App 的肌肉记忆。

裁决：

- Home / Music / ASMR / Playlists / Import / Settings 的路由语义跨主题固定；
- Navigation 展开/收起由 viewport/device 决定，不由主题决定；
- Theme 可以改变 density/material，但不能隐藏目的地。

### P0-2 Aurora 不得成为 ASMR-exclusive Theme

Aurora 可以 **优化长音频体验**，但用户选中该主题后 Music 仍必须完整可用。

裁决：

- Aurora = long-form immersive bias；
- Music Library 仍使用正常 Music IA；
- 只有 RJ Detail / Full Player 可以使用更强 subtitle/chapter emphasis。

### P0-3 数据滚动区禁止 backdrop-filter

两份方案都支持这一点，提升为硬门禁。

允许 blur：

- Player floating surface；
- menu / sheet / command palette；
- Full Player static background layer；
- Aurora ambient layer。

禁止：

- TrackRow；
- MediaCard grid scroll surface；
- filter list；
- table body；
- virtualized viewport。

同屏动态 blur surface 预算：最多 2。

### P0-4 主题不能复制业务组件

禁止：

```text
MidnightTrackRow
StudioTrackRow
AuroraTrackRow
```

正确方向：

```text
MediaRowBase
├─ TrackRow
└─ EpisodeRow

Theme
→ tokens
→ density
→ layoutVariant
```

Player state、subtitle sync、queue、search、virtualization、media binding 必须单实现。

### P0-5 Player 交互心智必须一致

Claude 的 Aurora “嵌入当前 RJ 上下文 Player”差异过大。

裁决：

- PlayerBar 永远是全局播放层；
- Midnight / Aurora 可 floating；
- Studio 可 docked；
- control order、progress semantics、open Full Player、open source Detail 完全一致；
- Full Player 是同一个 overlay/destination，不做三份。

### P0-6 Virtualization 需要固定 density contract

不接受某主题根据内容自由长高导致 variable-height virtual list。

裁决：

```text
compact      32px
standard     40px
comfortable  48px
```

主题只选择默认 density。长标题截断/secondary line 由对应 Row variant 明确占位，不让行高运行时漂移。

## P1 — 明显影响成熟度

### P1-1 默认主题冲突

Claude：Studio Graphite 默认。  
Kimi：Midnight Glass 默认。

裁决：

- **用户默认：Midnight Glass**
- **工程实现基准：Studio Graphite**

理由：

- 用户明确要求“好看、惊艳、成熟”，默认进入 Kura 应先体现品牌；
- Studio 最苛刻的信息密度适合作为实现/性能基准；
- 先实现 Studio 的 primitive 不等于用户默认 Studio。

### P1-2 Home 不做 Dashboard，也不做大 Hero 杂志页

统一骨架：

- Continue Listening；
- Recently Added；
- Recently Played；
- Favorites / Pinned（二选一可配置）。

Midnight/Aurora 允许“当前播放 artwork emphasis”，但最大只占一条 rail/header，不允许首屏 50% 巨型 Hero。

### P1-3 Navigation geometry 由响应式决定

Claude 的 Glass Rail / Graphite expanded Sidebar 不作为 Theme Delta。

Desktop：

- 宽窗口：Sidebar；
- 中等窗口：Rail；
- 极窄窗口：compact navigation。

主题只修改 Surface/spacing，不改变目的地位置。

### P1-4 TopBar 保留但降权

Claude 建议去掉独立 Header；当前 Kura 已有 TopBar。

裁决：

- 保留极轻 TopBar 作为 window/runtime/library state chrome；
- Search / Filter / View switch 放各页 ContentHeader；
- 禁止把 TopBar 做成网页导航栏。

### P1-5 EpisodeRow 不单独复制一套底层逻辑

Claude 的 RJ EpisodeRow 需求成立，但实现采用：

```text
MediaRowBase
├─ MusicTrackRow
└─ RjEpisodeRow
```

共享 focus/selection/play/actions/virtualization contract，只改变 metadata columns 和 subtitle/progress cells。

### P1-6 Aurora cover color 必须 neutralize

采用：

1. cover dominant / representative color；
2. clamp saturation；
3. 与 neutral surface 混合 60–70%；
4. 生成静态 gradient；
5. key 按 artwork hash/cache；
6. 内容变化时 crossfade。

禁实时采样。

## P2 — 视觉打磨

- 数字/RJ号统一 tabular-nums；
- Studio 可用极轻 zebra，其他主题禁用；
- 无封面使用 hash color + initial，不用“暂无封面”灰盒；
- 中日混排明确 CJK fallback 与 line-height；
- 长 RJ 名展示结构化字段，原始文件名进 Tooltip/metadata；
- scrolling 时 freeze equalizer/marquee；
- Empty state 必须提供 clear filters；
- focus / keyboard / touch target 纳入同一 Component Contract。

## Theme Matrix QA

| 项目 | Midnight Glass | Studio Graphite | Aurora Dream |
|---|---|---|---|
| 主要意图 | 听 | 管 | 陪 |
| 用户默认 | 是 | 否 | 否 |
| 实现基准 | 否 | 是 | 否 |
| 内容 Surface | 实色 | 实色 | 实色 |
| Floating Surface | 玻璃 | 实色 | 轻玻璃 |
| 默认 density | standard 40 | compact 32 | comfortable 48 |
| Player | floating | docked | floating |
| Background | 深色静态 | graphite | cover-derived static |
| Motion | 200ms | 120ms | 280–350ms |
| Music 支持 | 完整 | 完整 | 完整 |
| ASMR 支持 | 完整 | 完整 | 长音频强化 |
| Theme-specific IA | 禁止 | 禁止 | 禁止 |
| Theme-specific business components | 禁止 | 禁止 | 禁止 |

## Desktop Review

必须：

- Sidebar / Rail 响应式，不由主题切换；
- Page ContentHeader 统一；
- Music 与 ASMR 共用 shell，不共用 Detail template；
- Right Queue Dock；
- Full Player overlay；
- 主题切换不重建大列表；
- Home 去 KPI Dashboard 化；
- grid/list 都必须有大库预算。

可以保留：

- 当前 R5.1 Midnight Glass shell 作为视觉原型；
- 当前 TopBar runtime state；
- 当前 Player global state；
- R2–R4 Catalog/Query/virtualization。

## Android Review

底部导航最终建议：

```text
Home
Music
ASMR
我的
```

Search 不占 Tab：

- page top search；
- global Search destination。

“我的”承载：

- Playlists；
- Favorites；
- History；
- Offline/cache（未来）；
- Settings entry。

手机：

- NavigationBar；
- Mini Player above nav；
- Context actions → Bottom Sheet；
- Full Player → full-screen composable/overlay，支持 swipe-down；
- 禁止 Desktop Dock/hover/right-click 语义搬运。

平板：

- NavigationRail；
- adaptive list/grid；
- 可出现 secondary pane，但仍 touch-first。

## 必须改

1. 当前 Midnight Glass 中滚动内容若使用 backdrop-filter，必须清理。
2. Theme 与 Navigation route 解耦。
3. Theme runtime 必须基于 CSS variables + 少量 layoutVariant。
4. 默认 density 固定为 32/40/48 三档。
5. Home 统一为 library-state rails，不做 Dashboard。
6. PlayerBar interaction contract 固定。
7. Music/RJ Detail 分模板但共享 primitives。
8. Aurora 背景做缓存/降噪。
9. 无封面 fallback 产品化。
10. Android 只做 mapping，不开正式工程。

## 可以保留

- Midnight Glass 名称和品牌方向；
- Studio Graphite；
- Aurora Dream；
- R5.1 已完成 App Shell；
- SQLite / FTS / Scanner / Query / virtualization；
- Music/ASMR 一级导航；
- Full Player overlay 心智；
- Right Dock Queue 方向；
- 三层 Token 架构。

## 审查结果

**GO — 进入 GPT-6 Design Decision。**

不需要 Gemini 额外调用。
