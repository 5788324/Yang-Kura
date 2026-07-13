# PROJECT_STATE

## 当前状态

```text
核心版本：0.167.0-mvp129
代码基线：GitHub main
产品化增量：U02～U08 已合入
结构、质量与日常 UI 增量：U09～U26 已合入
Windows GUI 验收：U27 已完成，最终结论 NO-GO
当前任务：U28 修复资源库授权、真实 Index 与浏览状态闭环
阻断问题：MAJ-001、MAJ-002
MVP130：独立实验下载器，继续冻结，禁止合入
```

GitHub `main` 是唯一代码事实来源。长期文档不固定未来基线 SHA；每次验收报告必须记录实际 HEAD。

## 已完成主线

1. Electron 桌面壳、Windows 目录选择和安全 token 边界。
2. Local JSON Index 的写入、读取、备份、恢复和维护基础能力。
3. 音声库、音乐库、详情、收藏、歌单、队列和播放历史。
4. HTMLAudio、mpv、fallback、Seek 和进程回收。
5. LRC、SRT、VTT、ASS 字幕及外部文件打开。
6. copy-only 完整导入闭环和受控 move-only 小样本链。
7. 本地元数据覆盖、恢复和单 RJ DLsite Provider。
8. 50,000 曲目合成数据性能基准。
9. portable、NSIS 和 Windows 自动门禁基础链。
10. U02～U26 产品化、渐进式结构与质量优化、日常 UI 去工程化。

## U02～U26 阶段摘要

- U02～U08：真实空状态、中文界面、键盘焦点、弹窗语义、播放器主题和全屏播放页收口。
- U09～U23：渐进式结构与质量优化；播放器生命周期、歌词时间线、依赖门禁、侧栏导航、三主题和 PlayerBar 结构收口。
- U24：侧栏导航去工程化；下载规划和诊断工具进入默认折叠的 AI 维护。
- U25：历史工程卡、命令行说明和回归状态退出日常视觉层。
- U26：资源库检修使用独立可见性开关安全收口，未移动底层处理逻辑。

## 项目级 UI 硬规则

> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。

底层检修能力可以保留，但不得用 Demo、静态回归或历史状态冒充真实用户资源库状态。

## U27 Windows GUI 实机验收

### 自动与基础 GUI 结果

以下项目通过：

- `verify:env`、TypeScript、Electron 编译、完整稳定回归和生产构建；
- Electron strict smoke 和 portable 打包；
- high / critical 依赖审计为 0，保留 1 个 Electron moderate 观察项；
- 干净首次启动、真实空状态、AI 维护默认折叠、三主题、常规/最大化窗口；
- 关闭后无 Yang Kura、Electron 或 mpv 残留进程；
- 用户原配置已恢复，Git 工作区 clean。

### 最终补测结果

用户通过 Windows 原生目录选择器选择真实音声库后，发现两个 Major：

#### MAJ-001：资源库授权与 Index 状态断裂

- 页面显示“已选择 arsm”，顶栏仍显示已加载 51 条音轨；
- 设置页仍提示需要选择音声库目录；
- “读取已有记录”和“一键扫描并应用”均为 disabled；
- 音声库显示 `0 / 0`，首页、音乐库和队列为空；
- 目录授权、Index 读取、浏览状态和播放器状态没有形成同一真实数据链。

#### MAJ-002：诊断页仍使用 Demo 资源状态

- AI 维护中的资源状态刷新明确显示 Demo 扫描；
- 诊断结果声明不会读取真实磁盘，资源计数为 0；
- 该状态不能用于判断已授权目录或真实 Index。

### U27 最终结论

```text
NO-GO
```

先前空库阶段的 `CONDITIONAL GO` 已被真实资源库补测覆盖。详细证据见 `docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md`。

## 当前阶段

```text
产品质量收口
→ U27 实机验收完成：NO-GO
→ U28 修复 MAJ-001 / MAJ-002
→ 真实目录授权 → Index → 浏览作品 → 播放音轨复验
→ 通过后恢复字幕、导入、窗口和发布验收主线
```

U28 是缺陷修复轮，不再只是验收补测轮。禁止绕过 GUI 授权、手工编辑配置或使用 Demo 状态制造通过结果。

## U28 完成门槛

1. 原生目录选择后，设置页授权状态立即一致。
2. “读取已有记录”和“一键扫描并应用”按真实授权能力正确启用。
3. 可以读取已有 Index，或在无 Index 时执行安全扫描并写入。
4. 顶栏、设置页、音声库、首页和播放器使用同一资源计数与数据快照。
5. 音声库能够浏览真实作品并播放至少一个音轨。
6. 诊断页不得用 Demo 状态冒充真实资源库；应读取真实 Index 状态，或明确标记不可用并禁用操作。
7. 自动门禁和生产构建继续通过。
8. 使用临时样本完成写入测试；真实 `E:\arsm` 只做授权、读取、浏览和播放验证，不执行破坏性操作。

## 后续仍需完成

1. U28：MAJ-001 / MAJ-002 修复与真实资源闭环复验。
2. U29：播放器、Seek、队列、续播和 LRC/SRT/VTT/ASS 全流程。
3. U30：三主题、1040×680、小窗口、DPI、键盘和日常 UI。
4. U31：copy-only、受控 move-only、OperationLog 和数据安全。
5. U32：strict smoke、mpv acceptance、portable、NSIS、安装升级卸载和残留进程。
6. U33：版本号、Release Notes、tag、产物 SHA-256 和新 Beta 发布。

## 自动验证与冻结项

Pull Request 必须继续执行：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
全部 scripts/verify-u*.mjs
npm run verify:stable
npm run build
```

- 禁止为了代码整齐进行全项目重构。
- SQLite、系统媒体控制、批量元数据和字幕 Worker 仅在明确需求后启动。
- MVP130 下载器继续冻结，禁止自动合入主线。
