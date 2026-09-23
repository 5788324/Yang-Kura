# KURA_DESIGN_SYSTEM_V2 — GPT-6 Design Decision

日期：2026-09-23  
状态：**LOCKED FOR K2-R5.2**

## 1. 产品视觉定位

Kura 是：

> 档案馆级私人媒体库 + 成熟音乐播放器 + 长音频/RJ沉浸播放器。

不是：

- 流媒体运营平台；
- Dashboard；
- 文件管理器套播放器；
- 三套换色皮肤。

## 2. 顶级 IA

所有 Theme 共用：

```text
Home
Music
ASMR
Playlists / Favorites
Import
Settings
```

Diagnostics / maintenance 继续退到高级入口。

Theme 不允许改变 route set。

## 3. 用户默认与实现顺序

用户默认 Theme：

**Midnight Glass**

工程实现基准：

**Studio Graphite**

原因：

- Midnight 承担品牌第一印象；
- Studio 承担最苛刻的信息密度与性能验证；
- Aurora 最后实现，避免 ambient effect 提前干扰基础组件。

实现：

```text
Studio primitives
→ Midnight material
→ Aurora ambient/detail emphasis
```

## 4. Core Tokens

### Spacing

4pt grid：

```text
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
```

### Typography

```text
caption 12
body-sm 13
body 14
title 16
heading 20
display 28
```

Weight：

```text
400 / 500 / 600
```

数字、时长、RJ号：

```css
font-variant-numeric: tabular-nums;
```

### Density

固定：

```text
compact      32px
standard     40px
comfortable  48px
```

虚拟化列表只使用已声明的固定 row height。

### Radius

```text
4 / 8 / 12 / 16 / 20
```

### Motion

```text
fast     120ms
standard 200ms
slow     320ms
```

Aurora 个别 artwork/background crossfade 可到 600ms，但不影响操作反馈。

## 5. Theme Definitions

### Midnight Glass

默认。

- standard density；
- 内容区实色；
- floating surfaces 才 glass；
- floating PlayerBar；
- 深色冷静 ambient；
- moderate artwork emphasis；
- 200ms motion。

### Studio Graphite

管理模式。

- compact density；
- zero blur；
- 1px line + luminance hierarchy；
- docked PlayerBar；
- table/list first；
- tabular metadata；
- 120ms motion；
- 可用微弱 zebra。

### Aurora Dream

长音频沉浸模式。

- comfortable density；
- 内容区仍实色；
- cover-derived neutralized static ambient；
- floating PlayerBar；
- RJ Detail subtitle/chapter emphasis；
- 280–320ms content motion；
- 600ms background crossfade；
- Music 仍完整支持。

## 6. 唯一允许的 Theme layout variants

只允许：

1. `playerLayoutVariant = floating | docked`
2. `detailEmphasis = standard | subtitle-first`
3. `ambientBackground = none | subtle | artwork-derived`

Navigation geometry 不是 Theme variant。

出现第 4 个 Theme layout branch 时必须重新审查。

## 7. Component Contract

### L1 Primitive

Button  
IconButton  
Input  
SearchField  
Chip  
Menu  
Tooltip  
Slider  
Toggle  
Skeleton  
EmptyState

纯 tokens，不看 theme name。

### L2 Media

Artwork  
MediaRowBase  
TrackRow  
EpisodeRow  
MediaCard  
ProgressBar  
VolumeSlider  
MarqueeText

`TrackRow` 与 `EpisodeRow` 共享：

- focus；
- selection；
- play action；
- context actions；
- keyboard；
- virtual row contract。

### L3 Composite

ContentHeader  
FilterBar  
ListHeader  
RailSection  
QueueItem  
SubtitleLine  
ChapterBar

### L4 Region

Sidebar/Rail  
TopBar  
RightDock  
PlayerBar  
FullPlayer  
DetailHeader  
AmbientBackground

只有 L4 可以出现批准的 layoutVariant。

## 8. Home

Home 固定为：

1. Continue Listening
2. Recently Added
3. Recently Played
4. Favorites / Pinned

不要：

- KPI；
- 文件总数大数字；
- 欢迎语；
- 推荐信息流；
- 运营 Banner；
- 巨型 Hero。

允许 Midnight/Aurora 对第一条 rail 做 artwork emphasis，但不改变页面骨架。

## 9. Music

Music：

- Songs；
- Albums；
- Artists；
- Folders；
- Playlists。

Detail：

- Album / Artist 模板；
- TrackRow；
- queue；
- lyrics。

## 10. ASMR

ASMR：

- Works；
- Circle；
- CV；
- Series；
- Tags；
- Folder tree。

Detail：

- Work metadata；
- EpisodeRow；
- subtitle；
- chapter/progress；
- attachments；
- related works。

不把 Music Detail 套皮成 RJ Detail。

## 11. Player

统一交互：

- title/meta click → source Detail；
- artwork / full-player button → Full Player；
- queue button → Right Dock；
- controls order 固定；
- keyboard/shortcut 固定。

Theme 只决定 floating/docked material。

Full Player：

- 同一组件；
- 不做 route-dependent Player；
- Music lyrics 与 ASMR subtitle 使用同一 text-timeline primitive、不同内容模式。

## 12. Performance Design Budget

- >100 items virtualize；
- scroll viewport 禁 backdrop-filter；
- visible blur surfaces <= 2；
- thumbnail cache only；
- image intrinsic size；
- scrolling freeze decorative animations；
- theme switch CSS variables first；
- no whole-list React re-render for color-only theme change；
- Aurora artwork color cached by artwork key；
- no per-frame sampling。

## 13. Accessibility

Desktop：

- keyboard focus visible；
- ↑↓ / Enter / Space contracts；
- no hover-only critical action；
- 1024×720 supported。

Android：

- >=48dp touch target；
- long press has visible alternative；
- color not sole state indicator；
- TalkBack labels later required。

## 14. K2-R5.2 Scope

下一实现批次：

1. tokens v2；
2. Theme runtime skeleton；
3. Surface/Button/Input/Chip；
4. Artwork fallback；
5. MediaRowBase/TrackRow/EpisodeRow；
6. MediaCard；
7. ContentHeader/FilterBar；
8. Home rails；
9. Music Library visual migration；
10. ASMR Library visual migration。

不在本批做：

- Aurora runtime cover extraction；
- Full Player 大改；
- Android code；
- OpenList；
- remote source。
