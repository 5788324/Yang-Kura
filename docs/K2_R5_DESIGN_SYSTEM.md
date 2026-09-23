# K2-R5 Desktop 2.0 Design System

更新日期：2026-09-23

## Visual Direction — Midnight Glass

Kura Desktop 2.0 不直接复制网易云红黑皮肤，也不继续旧版“工程面板 + 卡片堆叠”。

方向：

- 深夜黑蓝基底；
- 低饱和玻璃层；
- 少量紫 / 粉 / 蓝品牌光；
- 封面与内容成为最高视觉权重；
- 控件降低边框噪音；
- Player 保持全局稳定、像悬浮控制台；
- 音声与音乐是 Sidebar 中唯一两个一级媒体入口。

### 双核心语义

```text
音声库
RJ / ASMR / Voice
偏暖紫粉提示

音乐库
Songs / Albums / Artists
偏冷蓝紫提示
```

这是同一 Design System 的两个语义面，不创建两套割裂主题。

## K2-R5.1 App Shell

本批只改变视觉框架，不改变：

- Player state；
- Queue；
- Library Index；
- SQLite；
- Importer；
- Settings；
- 路由语义；
- 媒体文件。

新增：

- Desktop 2.0 shell token；
- ambient gradient background；
- glass TopBar；
- first-class ASMR / Music nav cards；
- quieter secondary navigation；
- glass main stage；
- upgraded Player dock；
- responsive shell density；
- grid `content-visibility` 基础保护。

## 下一批

K2-R5.2：

- Shared Surface / Button / MediaCard / TrackRow 统一视觉；
- 首页重构为成熟播放器 Home；
- 音声 / 音乐页面头部、工具栏、空状态统一；
- 建立 Grid visual hierarchy。

K2-R5.3：

- Full player / immersive artwork background；
- album / RJ detail visual polish；
- transition / motion final pass。

视觉验收需要 Windows 实际截图，不把静态 CSS 测试等同于“惊艳度 PASS”。
