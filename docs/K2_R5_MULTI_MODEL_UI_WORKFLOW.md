# K2-R5 Multi-Model UI Workflow

更新日期：2026-09-23  
状态：**ACTIVE**

## 目标

为 Kura 建立一套可同时覆盖 Desktop 与未来 Android 的 Design Language，并完成至少 3 套**结构和交互也不同**的 Design Modes，而不是单纯换色主题。

当前可用模型：

- GPT-6：主开发 / 最终集成 / 设计裁决；
- Claude Sonnet 5：高价值视觉方向与截图审查；
- Kimi K3：长上下文视觉探索与 Design System 一致性审查；
- Gemini 3.8 Flash：低成本批量视觉 QA、差异检查与规格核对。

额度原则：Claude / Kimi / Gemini 用在高信息密度工作，不用于重复编码。GPT-6 承担绝大多数实现与返工。

## 三个 Design Modes

### A. Midnight Glass

定位：默认主题 / 深夜沉浸 / 平衡音乐与 RJ。

不是换色，结构特征包括：

- 低饱和玻璃层；
- 浮动 Player；
- 大封面和环境光；
- 中等信息密度；
- 页面转场柔和；
- Desktop Sidebar + TopBar；
- Android Adaptive bottom navigation / mini player。

### B. Studio Graphite

定位：8TB+ 大库整理 / 高频管理 / 音乐库浏览。

结构特征：

- 更少透明与动态背景；
- 更紧凑列表和表格；
- Filter / Sort / Facet 更突出；
- Player 更扁平、占用更少；
- Desktop 高密度信息；
- Android 更偏 compact list / sheets；
- Motion 更克制。

### C. Aurora Dream

定位：RJ / ASMR 夜间沉浸与作品体验。

结构特征：

- Cover-derived ambient background；
- 更柔软的层次、圆角和空间；
- Subtitle / Lyrics / Progress 权重更高；
- RJ Detail 更像长音频阅读器而非文件夹；
- Player / Detail 允许更强沉浸状态；
- Android 更强调手势、单手和全屏播放。

三个 Mode 共用：

- 信息架构；
- Media Identity；
- 播放状态；
- Catalog Query；
- 组件 API；
- Typography scale 基础；
- Accessibility；
- MediaCard / TrackRow / Player 的核心语义。

允许变化：

- layout density；
- material；
- surface hierarchy；
- corner treatment；
- Player geometry；
- background behavior；
- navigation presentation；
- animation personality；
- artwork treatment。

## 模型职责

| 模型 | 主要职责 | 不负责 |
|---|---|---|
| GPT-6 | 主架构、最终设计裁决、React/Electron实现、未来Compose实现、Git集成 | 不独占审美判断 |
| Claude Sonnet 5 | 主题概念、页面层级、Typography/Spacing/Material、关键截图审查 | 不做整仓重复编码 |
| Kimi K3 | 独立主题方案、长上下文Design System检查、Desktop/Android映射 | 不直接改main |
| Gemini 3.8 Flash | 批量截图QA、组件一致性、可访问性/溢出/密度检查 | 不做最终设计裁决 |

## 开发工作流

### Stage 0 — Brief Lock

GPT-6 维护唯一 brief：

- `docs/K2_R5_DESIGN_SYSTEM.md`
- 本文；
- `AI_HANDOFF/K2_R5_UI_MULTI_MODEL_HANDOFF.md`

所有模型必须从同一 brief 开始，不允许根据旧聊天自由发挥。

### Stage 1 — 双设计师并行探索

只调用一次 Claude 和一次 Kimi。

两者独立输出：

1. 三个 Design Modes；
2. Desktop Shell；
3. Android Shell；
4. Home；
5. Music Library；
6. ASMR Library；
7. MediaCard / TrackRow；
8. Player / Full Player；
9. Design tokens；
10. Theme delta matrix。

**禁止先写完整代码。**

目的：得到两套真正独立的设计思路，避免模型互相抄答案。

### Stage 2 — Gemini 低成本批量审查

输入 Claude + Kimi 的方案。

Gemini 只做：

- 重复/冲突点；
- AI味模板化问题；
- Desktop → Android 不合理照搬；
- 三主题是否只是换色；
- 大库信息密度；
- 可访问性；
- 组件不一致；
- 用户高频流程。

输出问题矩阵，不做最终方案。

### Stage 3 — GPT-6 设计裁决

GPT-6 将 Claude/Kimi/Gemini 结果融合成唯一：

- `KURA_DESIGN_SYSTEM_V2`
- 3 Theme delta matrix；
- Desktop component contract；
- Android component mapping；
- 页面级 wireframe/spec；
- R5.2 / R5.3 实施顺序。

此后设计真源只有仓库文档，不再引用聊天内容。

### Stage 4 — Desktop 实现

GPT-6：

1. Shared UI primitives；
2. Home；
3. Music Library；
4. ASMR Library；
5. Detail；
6. Player / Full Player；
7. 3 Theme runtime；
8. regression / CI。

Git 规则：

```text
集中读取
→ 一个实现批次
→ 本地/静态自检
→ 一个 commit/push
→ 一次 CI
→ 只有 CI 真失败才允许集中修复
```

### Stage 5 — Screenshot Review

Windows 生成固定尺寸截图：

- 1440×900；
- 1280×800；
- 1024×720；
- 至少 Home / Music / ASMR / Detail / Player；
- 每个 Theme 至少关键页面一套。

分工：

- Claude：只做高价值视觉总审；
- Kimi：只做 Design System 一致性审查；
- Gemini：批量逐图检查布局、对齐、裁切、密度；
- GPT-6：合并问题并修复。

### Stage 6 — Android Design Translation

现在只做设计规范，不启动 Android 正式开发。

输出：

- Desktop component → Compose component mapping；
- Sidebar → NavigationRail / NavigationBar；
- PlayerBar → MiniPlayer；
- Hover → press/gesture；
- context menu → bottom sheet；
- responsive grids；
- three-theme Compose token mapping。

Desktop 2.0 稳定后再由 GPT-6 主实现 Android；Claude/Kimi只审关键页面。

## 额度分配

建议一轮：

- Claude Sonnet 5：2 次高价值调用
  - 1 次完整主题探索；
  - 1 次最终截图审查。
- Kimi K3：2 次高价值调用
  - 1 次独立主题/Android适配；
  - 1 次 Design System 一致性审查。
- Gemini 3.8 Flash：可多次
  - 初稿差异审查；
  - 批量截图检查；
  - 规格/页面 checklist。
- GPT-6：主工作模型
  - 所有集成、代码、测试、Git、交接。

如果额度紧：

```text
Claude 1次设计 + 1次最终审图
Kimi 1次设计
Gemini 多次便宜QA
GPT-6 全程实现
```

## 输出保存规则

任何模型输出都不能只留在聊天里。

统一保存：

```text
docs/ui-lab/k2-r5/
├─ 01_CLAUDE_DESIGN_PROPOSAL.md
├─ 02_KIMI_DESIGN_PROPOSAL.md
├─ 03_GEMINI_REVIEW.md
├─ 04_GPT6_DESIGN_DECISION.md
├─ 05_THEME_DELTA_MATRIX.md
├─ 06_ANDROID_MAPPING.md
└─ screenshots/
```

如果模型不能直接写仓库，用户把完整输出回传给 GPT-6，由 GPT-6 入库。

## 交接要求

每次阶段结束必须同步：

1. `PROJECT_STATE.md`
2. `TASKS.md`
3. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
4. `AI_HANDOFF/K2_R5_UI_MULTI_MODEL_HANDOFF.md`
5. `AI_HANDOFF/WORKLOG.md`

新对话读取顺序：

```text
START_HERE
→ CURRENT_PROJECT_HANDOFF
→ K2_R5_UI_MULTI_MODEL_HANDOFF
→ PROJECT_STATE
→ TASKS
→ PROJECT_ROADMAP
→ 需要历史时再看 WORKLOG
```

模型输出如果没有写入上述事实源，视为“未交接”，不得作为后续唯一依据。
