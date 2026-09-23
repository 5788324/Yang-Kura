# Claude Sonnet 5 Design Proposal — Normalized Capture

来源：用户于 2026-09-23 回传的 Claude Sonnet 5 设计输出。本文是供仓库交接使用的规范化摘录，不替代原始回传文本。

## 核心判断

- 三主题必须在结构层有差异，不能只换配色。
- Music 与 RJ/ASMR 不共享同一 Detail 骨架，但应共享 TrackRow/Chip/Cover 等底层组件。
- 大库 UI 的第一约束是虚拟化下稳定行高和可预测滚动。
- Studio Graphite 被提议为默认主题，理由是日常大库检索/整理占比高。
- PlayerBar / Full Player 的交互契约和展开/收起时序必须跨主题一致。
- Aurora 背景必须 cover-derived，但需要向中性灰混合，避免夜间高饱和疲劳。
- 主列表区禁止用毛玻璃承载数据。
- Android 必须使用移动端正确的底部导航/手势，不得缩小 Desktop。

## 三主题

### Midnight Glass

- 深夜沉浸；
- PlayerBar 半透明悬浮；
- 封面更大；
- 行距较松；
- 动效 250–350ms；
- 不适合批量管理。

### Studio Graphite

- 大库管理；
- 不透明 Surface；
- 常驻 Sidebar；
- 紧凑 TrackRow；
- 多列排序；
- PlayerBar 占布局空间而非悬浮；
- 小窗口优先。

### Aurora Dream

- RJ/ASMR 长音频与字幕体验特化；
- cover-derived 渐变背景；
- 进度/字幕权重更高；
- RJ Detail 与 Music Detail 明显分叉。

## Desktop IA 建议

- Sidebar 可在展开与 Rail 间响应式切换；
- Music / ASMR 一级平权；
- Graphite Home 偏信息列表；
- Glass 可有 Hero；
- RJ 采用 Circle → Series → Work 深层语义；
- Music Detail 与 RJ Detail 两套页面骨架；
- Player 交互位置保持跨主题一致。

## Android 建议

- 底部导航，不用 Drawer；
- Music 与 ASMR 同级；
- Mini Player 常驻；
- Full Player 由 Mini Player 进入；
- Queue / menu / context actions 使用移动端 Sheet；
- Android 继承品牌，不继承 Desktop 的 hover / right click / dock 布局。

## Theme Delta 边界

必须共用：

- Player state / interaction contract；
- TrackRow 核心；
- virtualization engine；
- Search/Filter 逻辑；
- route structure。

允许改：

- surface / radius / spacing / typography density；
- Player floating vs docked；
- Home emphasis；
- grid columns。

禁止：

- 三份播放状态；
- 三份字幕同步；
- 三份数据绑定；
- 三主题各自独立维护生产代码。

## 主要风险

P0：

- 主题退化为换色；
- 数据主列表使用玻璃；
- Player 交互契约按主题改变。

P1：

- Aurora 取色过饱和；
- Android 使用 Drawer 导致 Music/ASMR 平权下降；
- 小窗口 Graphite 过密。

## 给实现端的建议

- 先固定 Theme Delta Matrix；
- Shared UI 先做主题无关逻辑；
- 建议 Studio Graphite 先实现，最容易暴露性能/密度问题；
- Aurora 取色需要缓存；
- Desktop 组件不要强绑定 hover-only 操作。
