# Kimi K3 Design Proposal — Normalized Capture

来源：用户于 2026-09-23 回传的 Kimi K3 设计输出。本文是供仓库交接使用的规范化摘录，不替代原始回传文本。

## 产品定位

Kura = **档案馆级私人媒体库 + 沉浸式长音频播放器**。

原则：

- 库是第一公民，播放是叠加层；
- 信息密度本身是审美；
- Music 与 RJ/ASMR 共品牌、不同内容模型；
- Theme 是 Design Mode，不是皮肤；
- 所有视觉效果必须过性能关。

## 三主题

### Midnight Glass

- 深夜私人听音室；
- 玻璃只允许用于悬浮层；
- PlayerBar 悬浮；
- 内容区实色；
- comfortable density；
- 适合晚间播放。

### Studio Graphite

- 大库管理；
- 零透明、零模糊；
- 32px compact TrackRow；
- 表格视图默认；
- PlayerBar 贴底、低存在感；
- 侧栏更窄；
- 数字 tabular-nums。

### Aurora Dream

- RJ/ASMR 情绪沉浸；
- cover-derived 静态渐变背景；
- Detail 以字幕/章节为中心；
- 字级更松；
- 动效更柔；
- 禁逐帧取色/实时背景动画。

## Desktop IA

- Sidebar：Home / Music / ASMR / Playlists / Scanner / Settings；
- Content Header；
- Content；
- Right Dock Queue；
- PlayerBar；
- Full Player overlay。
- Home 反 Dashboard，只保留继续播放 / 最近入库 / 最近播放等内容 rail。
- Detail 是内容页，Full Player 是播放覆盖层。
- 全局 Search = 页内筛选 + Ctrl/Cmd+K + 搜索结果页。

## Android IA

手机：

- NavigationBar：Home / Music / ASMR / 我的；
- Search 放页面顶部/全局搜索，不单独占 Tab；
- Mini Player 在导航上方；
- Queue/Menu/Context 用 Bottom Sheet；
- Full Player 使用移动端覆盖层/手势。

平板：

- NavigationRail；
- 更接近 Desktop 的双栏，但仍遵循触摸交互。

## Component hierarchy

L0 Tokens  
L1 Primitives  
L2 Media Atoms  
L3 Composites  
L4 Regions  
L5 Pages

L1–L3 禁主题分支；L4 只允许少量 layoutVariant。

## Tokens

建议：

- 4pt spacing grid；
- 12/13/14/16/20/28 type scale；
- 400/500/600 weight；
- tabular-nums；
- 4/6/8/12/16 radius set；
- 120/200/350ms motion；
- 统一 Artwork 容器和无封面 fallback。

## Theme Delta

允许：

- tokens；
- density；
- Player geometry；
- Aurora Detail slot reorder；
- Aurora ambient background。

禁止：

- TrackRow/MediaCard/Search/Queue 三份结构；
- theme if/else 复制 JSX；
- 第 4 个以上 shell-level layout branch。

## 性能硬规则

- >100 项列表必须虚拟化；
- 滚动容器禁止 backdrop-filter / blur；
- 缩略图独立缓存；
- 滚动期间冻结非必要动画；
- 搜索使用 SQLite FTS；
- 主题切换通过 CSS variables，不重建 React tree；
- Aurora 背景只在内容变化时计算一次；
- 69k 音轨滚动稳定性是验收指标。

## 推荐实施顺序

Token  
→ AppShell  
→ TrackRow/virtualization  
→ Player  
→ MediaCard  
→ Search/Filter/Sort  
→ Queue  
→ Detail/Subtitle  
→ Aurora ambient  
→ Android mapping
