# PROJECT_ROADMAP

## 当前冻结点

```text
核心版本：0.167.0-mvp129
代码事实来源：GitHub main
U02～U08：产品化增量已合入
U09～U15：结构与质量增量已合入
U16：播放器临时 UI 生命周期抽离进行中
下载器：冻结；MVP130 独立封存，禁止合入
```

## 阶段 A：核心媒体库稳定化（已完成）

- 本地扫描、Local JSON Index、备份、读取和维护。
- 音声库、音乐库、详情、歌单、队列和播放历史。
- HTMLAudio + mpv 后端、fallback、Seek 和进程回收。
- LRC/SRT/VTT/ASS 字幕与图片、视频、文件外部打开。
- copy-only 导入闭环和受控 move-only 小样本链。
- 本地元数据覆盖、DLsite 单 RJ Provider 和索引维护。
- 50,000 曲目生成数据性能基准。
- portable / NSIS 构建、启动和卸载基线。

## 阶段 B：产品化 UI 与真实性修复（U02～U08，已完成）

- 首次启动真实空状态，不再注入演示媒体。
- 顶栏、首页和一级导航去工程化。
- 中文页面语言、减少动画和可见键盘焦点。
- 弹窗语义、Escape、Tab 圈定与焦点返回。
- 移除 ASMR 详情和全屏播放器的伪造状态。
- 播放器底栏跟随主题 token。
- 全屏播放页键盘入口和退出行为收口。
- Windows Pull Request 自动验证链建立。

## 阶段 C：渐进式结构与质量优化（当前）

原则：只整理正在修改、职责明显拥挤的模块，不做全项目大重构。

### U09：播放器视图生命周期抽离（已完成）

- `useFullPlayerDialog` 管理 Escape、初始焦点和关闭后焦点返回。
- `useVinylMotion` 管理黑胶/唱臂动画及 reduced-motion。
- U07/U08 verifier 改为跨组件和 Hook 验证行为边界。
- `LyricsPanel.tsx` 不再直接持有底层生命周期循环。

### U10：歌词时间线领域逻辑（已完成）

- 抽离 LRC 小数时间戳和单行解析。
- 抽离完整歌词过滤、双语拆分和当前行计算。
- 使用 TypeScript 内存转译与 Node 断言执行行为测试。
- 保持字幕读取、播放、自动滚动和页面布局不变。

### U11：依赖与诊断门禁（已完成）

- PR 自动执行 `npm audit --audit-level=high`。
- high / critical 依赖风险阻止合并。
- moderate Electron 提示继续显式记录但不自动升级。
- 所有 focused verifier 均执行并生成可下载 TSV 结果，不再只暴露首个失败。

### U12：侧栏导航结构与可访问性（已完成）

- 八个导航入口改为类型化只读配置，避免每次渲染重建。
- 日常区和维护区共用 `SidebarNavSection`，删除重复映射代码。
- 分区标题建立 `aria-labelledby` 关系，活动页继续使用 `aria-current="page"`。
- 导航、搜索和清除按钮补齐 `focus-visible` 样式。
- 保持页面名称、顺序、跳转和详情状态清理行为不变。

### U13：三主题合同与旧配置迁移（已完成）

- `SUPPORTED_THEME_IDS` 固定产品实际支持的三种主题及顺序。
- `DEFAULT_THEME_ID` 与干净配置默认值统一为 `acrylic-mist`。
- 本地持久化中的旧主题、缺失值和非法值在水合时归一化。
- 设置页选项由专项 verifier 与合同核对；删除不可达 `light / forest-cabin` CSS。
- 不改变三套现有主题的色板，不执行全局 CSS 重写。

### U14：播放器中性色 token 收口（已完成）

- 继续沿用 U06 的播放器局部桥接，不修改播放器 JSX 和业务逻辑。
- 为底栏局部定义 surface、panel、hover、border 和文字语义别名。
- 补齐半透明弹层、弱背景、弱边框、分隔线和嵌套 hover 状态。
- 保留 sky、pink、rose、amber、indigo、emerald 等功能性强调色。

### U15：播放器底栏纯逻辑抽离（已完成）

- 新增无 DOM 依赖的播放器数学模块，承载时长、时间、Seek、进度和音量计算。
- 浮动歌词复用 U10 的 `lyricsTimeline`，不再维护第二套 LRC 解析。
- 新增真实执行的边界值行为测试，而不是只检查源码字符串。
- 保持播放控制、事件顺序、拖拽提交、浮动歌词和页面布局不变。

### U16：播放器临时 UI 生命周期抽离（当前）

- 使用 `useDelayedVisibility` 管理音量浮层的 800 ms 延迟关闭。
- 使用 `useAutoDismissMessage` 管理 Toast 的 2500 ms 自动消失。
- 使用可注入 scheduler 的 resettable timer 验证重排、取消和清理行为。
- 保持所有调用点、文案、延迟时间和播放器交互不变。

### 后续质量候选

按实际收益逐项选择，不并行展开：

1. 继续从可直接审查的中小型组件中抽离重复展示结构。
2. 继续把新增 verifier 从源码字符串检查升级为行为测试。
3. 对 Settings / Diagnostics 只做按需拆分，保持日常层与维护层隔离。
4. 根据 Windows GUI 结果定向修复三主题对比度和主题割裂。
5. 在最终发布前补齐 Electron strict smoke、portable、NSIS 和安装卸载验收。

## 阶段 D：新 Beta 发布验收（预计 3～5 轮）

1. **状态与版本同步**：完成当前文档和版本记录收口。
2. **Windows GUI 全流程**：干净配置、资源库、浏览、播放、Seek、字幕、队列、歌单、重启、导入、三主题和窗口尺寸。
3. **定向缺陷修复**：只修实机发现的问题。
4. **桌面发布复验**：Electron strict smoke、mpv acceptance、portable、NSIS、安装卸载、残留进程和依赖审计。
5. **发布收口**：版本号、Release Notes、tag、产物 SHA-256 和最终交接。

如果 GUI 验收没有发现明显问题，第 3～5 项可以压缩，最快约 3 轮。

## 候选增强方向

只有用户根据真实使用明确选择后才启动一个方向：

| 方向 | 启动条件 |
|---|---|
| 播放稳定性 / Player Core v2 | 真实使用发现状态结构或后端切换问题 |
| 批量元数据 | 单项编辑稳定且确有批量需求 |
| 字幕与本地转录衔接 | RJ-LRC-Local Worker 准备接入 |
| SQLite | JSON Index 出现真实性能、一致性或并发瓶颈 |
| 系统媒体控制 | 播放主链长期稳定后 |
| 下载器 | 用户明确恢复 MVP130 路线后 |

## 下载器路线

MVP130 只作为独立实验包保存。恢复时必须从独立分支重新审查：

```text
任务持久化
→ Range 断点续传
→ 暂停/继续
→ Provider 合同
→ 单一 RJ Provider
```

Staging 与正式媒体库必须保持分离，不允许下载器自动写正式媒体库。
