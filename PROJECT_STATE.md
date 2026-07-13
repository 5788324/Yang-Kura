# PROJECT_STATE

## 当前状态

```text
核心版本：0.167.0-mvp129
代码基线：GitHub main
产品化增量：U02～U08 已合入
结构与质量增量：U09～U21 已合入
当前任务：U22 播放器事件与浮动歌词派生状态抽离
MVP130：独立实验下载器，继续冻结，禁止合入
```

不再在长期文档中固定某个 Git SHA。GitHub `main` 与最近合并的 PR 是唯一代码事实来源，避免文档在每次小型质量提交后立即过期。

## 已完成主线

1. Electron 桌面壳、目录选择和安全 token 边界。
2. 本地扫描、Local JSON Index 写入、备份和读取。
3. 音声库、音乐库、详情、歌单、队列和播放历史。
4. HTMLAudio、mpv 后端、fallback、Seek 合并和进程回收。
5. LRC、SRT、VTT、ASS 字幕与外部文件打开。
6. copy-only 完整导入闭环和 move-only 小样本闭环。
7. 本地元数据编辑、备份恢复和单 RJ DLsite Provider。
8. 50,000 曲目生成数据性能基准。
9. 缺失文件检查、受控索引清理、备份恢复和维护历史。
10. Windows portable / NSIS installer 发布链。
11. 依赖精简、稳定回归链和历史资料归档。

## U02～U08 产品化增量

- U02：干净配置不再注入演示媒体；首页、顶栏和一级导航产品化。
- U03：中文页面语言、键盘焦点和系统减少动画基线。
- U04：旧弹窗的语义、Escape、Tab 圈定与焦点返回。
- U05：移除 ASMR 详情页伪造的播放进度和字幕关联。
- U06：播放器底栏映射现有主题 token。
- U07：移除全屏播放器演示书签；黑胶动画响应减少动画设置。
- U08：全屏播放页增加 dialog 语义、Escape 和焦点进入/返回。
- CI：Pull Request 在 Windows runner 上自动执行专项 verifier、稳定回归和生产构建。

## 渐进式结构与质量增量

### U09（已完成）

- 从 `LyricsPanel.tsx` 抽离全屏弹窗键盘/焦点生命周期；
- 抽离黑胶与唱臂的 reduced-motion 动画循环；
- 修正 U07/U08 verifier 对实现文件位置的耦合；
- 修正项目文档和 handoff verifier 的旧 Round 6 / 固定 SHA 基线。

### U10（已完成）

- 把 LRC 时间戳解析、双语拆分和当前歌词行计算移入纯函数模块；
- 用可执行断言验证实际输入输出，不再只检查源码字符串；
- 修正 U09 verifier 对路线文档固定措辞的耦合；
- 保持字幕加载、自动滚动、播放进度和 UI 行为不变。

### U11（已完成）

- Windows Pull Request 门禁增加 `npm audit --audit-level=high`；
- high / critical 依赖风险直接阻止合并；
- 既有 Electron moderate 提示继续按非阻塞风险记录，不执行自动修复；
- CI 保存每份 `verify-u*.mjs` 的结果报告，便于定位专项失败。

### U12（已完成）

- 把侧栏日常导航和维护导航改为类型化只读配置；
- 使用共享 `SidebarNavSection` 消除两套重复 JSX；
- 增加导航分区语义、键盘焦点样式和 reduced-motion 显式处理；
- 保持八个入口的名称、顺序、页面跳转和详情状态清理行为不变。

### U13（已完成）

- 建立 `dark / acrylic-mist / ocean-drops` 三主题合同和统一默认主题；
- 旧版、缺失或非法 `currentTheme` 在本地配置水合时迁移到默认主题；
- 设置页三项选择与统一合同保持一致，现有标签和预览不变；
- 删除不可达的 `light / forest-cabin` CSS，不重新设计现有三套主题。

### U14（已完成）

- 为底部播放器定义局部 surface、panel、hover、border 和文字 token 别名；
- 补齐半透明弹层、弱白背景、弱边框、分隔线和嵌套 hover 的主题映射；
- 保留播放、进度、错误和状态类功能性色，不执行播放器视觉重设计；
- 不修改 `PlayerBar.tsx` 的交互、状态或播放逻辑。

### U15（已完成）

- 抽离播放器底栏的时长保护、时间格式化、Seek 坐标和进度/音量计算；
- 浮动歌词复用 `lyricsTimeline`，删除第二套内联 LRC 解析；
- 使用 TypeScript 内存转译与 Node 断言执行真实边界值测试；
- 保持播放命令、Seek 提交、队列、歌词浮窗和播放器 JSX 行为不变。

### U16（已完成）

- 抽离音量悬停延迟关闭和 Toast 自动消失的临时 UI 生命周期；
- 通过可注入 scheduler 的 resettable timer 执行真实定时器行为测试；
- Hook 卸载或状态变化时取消未完成定时器，避免组件残留回调；
- 保持所有现有文案、延迟时间、事件入口和播放器行为不变。

### U17（已完成）

- 把歌单下拉框、音量浮层和 Toast 抽成纯展示组件；
- 歌单写入、状态判断、文案选择和临时 UI Hook 继续由 PlayerBar 编排；
- 补齐歌单关闭按钮、音量范围和 Toast 的基础无障碍语义；
- 保持布局、颜色、交互结果、延迟时间和播放器业务行为不变。

### U18（已完成）

- 一次抽离进度预览、空播放器状态和歌词浮窗三个低风险展示块；
- Hover 计算、歌词解析、当前行选择和开关状态继续由 PlayerBar 编排；
- 为播放进度、歌词开关和歌词浮窗补齐基础语义；
- 保持 Seek、可见文案、布局、颜色、动画类和播放器业务行为不变。

### U19（已完成）

- 一次抽离音轨摘要、喜欢按钮和中央传输控制两大展示区；
- 收藏变更、Toast、播放命令、循环切换和队列开关仍由 PlayerBar 编排；
- 为封面/标题入口、喜欢、播放、队列、歌单和静音补充键盘与 ARIA 语义；
- 保持播放、Seek、收藏存储、布局、颜色和后端行为不变。

### U20（已完成）

- 抽离完成策略、歌单、歌词浮窗、音量和更多操作的辅助控制区；
- 收口重复图标按钮样式并统一装饰图标的 aria-hidden；
- 集中保留 MVP59/MVP79 历史兼容标记，避免继续散落在 PlayerBar；
- 所有状态、Toast、歌单写入和播放器回调继续由 PlayerBar 编排。

### U21（已完成）

- 抽离进度轨道 JSX 与 Hover/拖拽 Seek 交互生命周期；
- 点击仍立即 Seek，拖拽仍只在鼠标或触摸结束时提交一次；
- 复用 U15 纯计算，不复制时长、坐标或夹取逻辑；
- 收口播放器局部可见状态命名，不修改播放结果。

### U22（当前）

- 抽离收藏、歌单、Toast、歌词浮窗和更多操作的播放器事件 Hook；
- 抽离浮动歌词时间线与当前行派生 Hook；
- 用纯决策函数验证只读歌单、重复条目、成功添加和提示文案；
- 统一 `hasTrack` 与完成策略能力判断，保持公开 PlayerBar props 不变。

## 当前阶段

项目已越过主体功能开发期，进入：

```text
产品质量收口
→ 渐进式代码结构优化
→ Windows GUI 用户流程验收
→ 定向缺陷修复
→ 重新打包形成新 Beta 基线
```

禁止为了代码整齐进行全项目重构。只拆分当前正在维护、已有明确职责拥挤的模块。

## 自动验证

Pull Request 自动门禁当前覆盖：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
全部 scripts/verify-u*.mjs
逐 verifier TSV 报告与 Actions artifact
npm run verify:stable
npm run build
```

`verify:stable` 内含 TypeScript lint、Electron 编译、MVP112～129 稳定链、mpv 运行时测试、导入器 smoke、50,000 曲目基准和索引维护测试。

核心 MVP129 历史基线还曾通过 Electron strict smoke、portable、NSIS、mpv fixture 和依赖审计；U02 之后需要在最终发布前重新执行完整桌面发布链。

## 仍需完成

1. Windows 真实 GUI 完整用户流程验收。
2. 1040×680、常规窗口和最大化布局检查。
3. 三主题对比度与交互一致性检查。
4. 实际 mpv/HTMLAudio、字幕、队列、重启恢复和 copy-only 流程复验。
5. `build:electron`、strict smoke、portable、NSIS、安装卸载和残留进程复验。
6. 根据实机结果修复明确缺陷并形成新 Beta 发布记录。

## 长期观察与冻结项

- 继续观察真实多小时播放、真实超大媒体库和 named-pipe 长期稳定性。
- SQLite、系统媒体控制、批量元数据和字幕 Worker 集成只有出现明确需求时再启动。
- 下载器继续冻结；不得把 MVP130 或历史实验包自动合入主线。
