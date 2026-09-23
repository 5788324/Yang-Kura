# K2-R5 Multi-Model UI Prompts

更新日期：2026-09-23

所有模型统一项目事实：

- 项目：Kura Desktop 2.0；
- Desktop：React + TypeScript + Electron；
- 未来 Android：Kotlin + Jetpack Compose / Material 3；
- Kura 是私人 RJ/ASMR + Music 双核心媒体库；
- 真实库约 10TB，约 268k 文件、69k 音频；
- 音乐不是附属功能；
- UI 必须成熟、好看、长期可用；
- 三套主题必须是 Design Modes，不只是换色；
- Desktop 当前主线先做，Android 当前只做设计适配规范；
- 业务逻辑和大库 Core 已存在，不推倒重写；
- 现有主方向 Midnight Glass 只是候选/基线，允许挑战，但需要明确理由。

---

## Claude Sonnet 5 — Visual Director

你是 Kura 项目的外部视觉设计总监。不要写完整生产代码，先解决视觉与交互方向。

请为 Kura Desktop 2.0 + 未来 Android 设计 3 套真正不同的 Design Modes：

1. Midnight Glass：深夜沉浸、玻璃层、封面优先；
2. Studio Graphite：高密度、大库整理、专业播放器；
3. Aurora Dream：RJ/ASMR 情绪沉浸、长音频、字幕/进度优先。

硬约束：

- 不是简单换色；
- 三套 Theme 要在 Material、Density、Player geometry、Navigation、Card/TrackRow、Background behavior、Motion personality 上存在明确差异；
- Music 和 RJ/ASMR 必须并列一级；
- Desktop 不得做成网页 Dashboard；
- Android 不得只是“缩小版 Desktop”；
- 避免典型 AI UI：过度卡片、无意义渐变、每块都玻璃、巨量圆角、装饰性 glow；
- 设计必须适合 10TB / 数万 Track 的真实大库；
- 需要同时考虑 list / grid / search / filter / queue / lyrics/subtitle / long audio resume；
- 保持 Kura 私人、安静、成熟的产品气质。

请输出：

1. Kura 的 5～8 条核心视觉原则；
2. 三个 Design Mode 的完整定义；
3. Theme Delta Matrix；
4. Desktop：
   - App Shell
   - Home
   - Music Library
   - ASMR Library
   - Detail
   - PlayerBar
   - Full Player
5. Android：
   - Navigation
   - Home
   - Library
   - Detail
   - Mini Player
   - Full Player
6. Typography / spacing / radius / elevation / surface / motion 建议；
7. 哪些组件三主题共用结构，哪些允许结构变化；
8. 你认为当前 Midnight Glass 最容易犯的 10 个审美问题；
9. 最终推荐的默认主题及理由；
10. 给实现模型的明确 Do / Don't。

不要只给形容词。尽量写成实现团队能直接采用的 Design Spec。

---

## Kimi K3 — Independent UI System Designer

你是独立于 Claude 的第二设计师。不要参考 Claude 的结论，也不要为了“不同而不同”。

项目是 Kura：私人 10TB+ RJ/ASMR + Music 双核心媒体库。
Desktop 为 Electron/React；未来 Android 为 Kotlin/Compose。

任务：独立提出一套可长期维护的 Kura Design System，并验证以下 3 个 Design Modes 是否应该保留、重命名或重构：

- Midnight Glass
- Studio Graphite
- Aurora Dream

重点不是做漂亮概念图，而是回答：

- 10TB 大库下什么 UI 才真的好用；
- Desktop 的高信息密度和沉浸播放如何共存；
- Music 与 RJ 两套内容模型如何共享 Design Language 但不强行共用页面模板；
- Android 如何保留品牌感，同时使用移动端正确的 Navigation / Gesture / Bottom Sheet / Mini Player；
- 三主题如何做到真正的结构差异，又不让代码维护成本失控。

请输出：

1. 你自己的产品视觉定位；
2. 三主题的重新定义；
3. Desktop/Android 各页面 IA；
4. Component hierarchy；
5. Design tokens 分层：Core Tokens / Semantic Tokens / Theme Tokens；
6. Theme delta 应该控制在哪些层；
7. MediaCard / TrackRow / Filter / Search / Queue / Player / Lyrics / Subtitle 的组件规范；
8. 大库 performance-aware UI 规则；
9. Android Compose 映射建议；
10. 与“网易云式播放器”应该学什么、不要学什么；
11. 20 条最容易产生 AI 味的 UI 反模式；
12. 一个实施优先级表。

不要写完整应用代码。输出必须足够详细，便于 GPT-6 将其融合成唯一 Design System。

---

## Gemini 3.8 Flash — UI QA / Critic

你不是主设计师，也不要重新发明第三套方案。

我会给你：
- Claude 的方案；
- Kimi 的方案；
- Kura 当前 Design System；
- 后续也可能给你 Desktop/Android 截图。

你的任务是做低成本、严格、可执行的审查。

请检查：

1. 三个主题是不是其实只有颜色不同；
2. 是否存在典型 AI Dashboard / Card soup / Glass soup；
3. Desktop 是否有“网页感”而不像成熟桌面播放器；
4. Android 是否只是 Desktop 缩小；
5. Music 与 RJ 是否真的同等级；
6. 10TB 大库下信息密度是否合理；
7. Search / Filter / Sort / Queue 是否容易到达；
8. Typography 层级；
9. spacing / alignment / visual rhythm；
10. 长文本、超长 RJ 名、无封面、中文/日文混排；
11. 1024×720 等小窗口；
12. accessibility / focus / touch target；
13. Player 与页面内容是否抢层级；
14. 三主题是否导致组件维护爆炸；
15. 哪些差异应该保留，哪些应该收敛。

输出格式必须是：

- P0：会让产品明显难用或破坏主题目标；
- P1：明显影响成熟度；
- P2：视觉打磨；
- Theme Matrix；
- Desktop / Android 分开；
- 最后给 GPT-6 一份“必须改 / 可以不改”清单。

不要直接改代码，不要给泛泛赞美。

---

## GPT-6 — Lead / Integrator

你是 Kura 的唯一主集成者和最终实现负责人。

输入会包括：

- Kura 当前仓库；
- Claude Sonnet 5 UI proposal；
- Kimi K3 UI proposal；
- Gemini QA；
- 当前 Midnight Glass 实现。

你的职责不是简单投票，而是形成唯一可执行 Design System。

必须：

1. 读取当前源码和事实文档；
2. 区分产品事实、设计意见和模型偏好；
3. 从 Claude/Kimi 中保留真正改善层级、密度、交互的部分；
4. 拒绝只为了炫技增加的复杂度；
5. 保证 3 Theme 是 Design Modes，不是 3 套完全分叉的应用；
6. 定义 Core Component Contract；
7. 形成 Theme Delta Matrix；
8. Desktop 先实现；
9. Android 只形成 Compose mapping，正式开发继续冻结；
10. 每个代码批次集中修改、一次 commit/push、一次 CI；
11. CI 失败才允许集中修复；
12. 阶段结束必须更新 HANDOFF / STATE / TASKS / WORKLOG。

优先级：

```text
成熟度
> 高频操作效率
> 大库性能
> 视觉层级
> 主题差异
> 动效炫技
```

实现顺序：

```text
Shared UI
→ Home
→ Music
→ ASMR
→ Detail
→ Player / Full Player
→ Theme Runtime
→ Screenshot QA
```

不要让任何设计模型直接成为 main 的代码真源。所有外部设计输出先保存到 docs/ui-lab/k2-r5，再由你裁决和实现。
