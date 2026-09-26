# Kura Reference UI Map

更新日期：2026-09-26

## Implementation Map

| Kura Area | Primary Reference | Secondary Reference | Reuse Level | Kura-specific change |
|---|---|---|---|---|
| Desktop Shell | SPlayer MainLayout | Kura R5.1 | behavior reference | React/Electron own implementation |
| Sidebar/Rail | Kura own | Feishin | concept | Music/ASMR first-class |
| Home | YesPlayMusic content-first | Feishin | pattern | Continue/Recent/Favorites only |
| Music Songs | Feishin | YesPlayMusic | architecture + UX | SQLite query + virtual list |
| Music Albums | YesPlayMusic CoverRow | Feishin infinite grid | visual pattern | Kura MediaCard + grid virtualization |
| Album Detail | YesPlayMusic album.vue | Feishin detail split | visual + architecture | local metadata/actions |
| Artist Detail | YesPlayMusic | Feishin | visual + architecture | local-first |
| Music TrackRow | YesPlayMusic interaction | Feishin large-list | UX only | fixed 32/40/48 contracts |
| PlayerBar | SPlayer PlayerBar | Kura existing | UX only | one global state |
| Full Player | SPlayer FullPlayer | Resonate | UX only | Music/RJ content modes |
| Lyrics | SPlayer Lyrics | Resonate LyricsSheet | UX only | shared timeline primitive |
| Studio Graphite | Feishin | fooyin | concept | no plugin-canvas complexity |
| ASMR Library | Kura own | Feishin filter/list pattern | Kura implementation | Works/Circle/CV/Tag/Folder |
| RJ Detail | Kura own | Resonate long-audio controls | Kura implementation | episode/subtitle/chapter/attachment |
| Android Scaffold | Resonate RootScaffold | Aurora adaptive | code candidate | Home/Music/ASMR/Me |
| Android MiniPlayer | Resonate | Aurora | code candidate | Kura player contract |
| Android FullPlayer | Resonate | Aurora | code candidate | Music/RJ modes |
| Android Theme Chroma | Resonate | Aurora | code candidate | Aurora Dream only/neutralized |
| Android multi-source UI | Aurora | Kura SourceRef | code candidate | Local/OpenList/cache later |

## R5.2 Order

### Batch A — Shared Primitives

1. Surface
2. Button / IconButton
3. SearchField
4. Chip / Tabs
5. Artwork
6. EmptyState
7. MediaRowBase
8. TrackRow
9. EpisodeRow
10. MediaCard
11. ContentHeader
12. FilterBar

Reference rule:

- visuals: YesPlayMusic;
- large-list structure: Feishin;
- player decomposition: SPlayer;
- no copied GPL/AGPL source.

### Batch B — Music

1. Music Library header/filter
2. Songs virtual list
3. Albums adaptive virtual grid
4. Artists
5. Folders
6. Album detail

Music visual target:

> YesPlayMusic 的成熟比例 + Feishin 的大库结构，不保留二者在线服务 IA。

### Batch C — ASMR

1. Works grid/list
2. Circle/CV/Tag facets
3. Folder tree
4. Work Detail
5. EpisodeRow
6. Subtitle/Chapter panel
7. Attachments

ASMR target:

> 不做“Music Album Detail 换字段”。

### Batch D — Player

1. split current PlayerBar responsibilities
2. floating/docked geometry
3. TrackInfo
4. Controls
5. Progress
6. Toolbar
7. Queue
8. FullPlayer shell

SPlayer only supplies behavioral reference.

## Prototype Acceptance

Before declaring R5 visual direction done, capture:

- Desktop 1440×900 Music Library
- Desktop 1440×900 Album Detail
- Desktop 1440×900 ASMR Library
- Desktop 1440×900 RJ Detail
- Desktop Full Player
- Studio Graphite dense list
- Midnight Glass normal use
- Aurora Dream RJ Detail

Check:

- no Dashboard;
- no Card Soup;
- no Glass in scrolling data;
- artwork is visual anchor;
- filters are reachable;
- Player does not cover content;
- 1024×720 still usable;
- Music and ASMR feel like same product, not same template.
