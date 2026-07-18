# Yang-Kura 工作日志

> 仅记录当前有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34 — 联合审计与交付规则

- PR：#56
- 完成架构审计、依赖图、重构待办和关键行为冻结清单。
- 建立低风险任务批量修改、单一 PR、单次最终门禁规则。

### U35 / U36 — Design System、AppShell 与 IPC 分域

- PR：#57～#61
- 建立统一 IPC 契约、语义 Token、共享 UI、生产 AppShell、Router、Overlay 和 Main IPC 分域。

## 2026-07-17

### U37 — 媒体库正式页面

- PR：#62、#63、#69
- 首页、音声库、RJ 详情和音乐库建立正式页面边界。
- 音乐库支持歌曲、专辑、艺术家和文件夹四视图。
- 搜索、筛选、收藏、多选、批量入队和歌单操作进入正式 UI。

### Beta 2 个人日用版

- PR：#71
- tag：`v0.169.0-beta.2`
- Release ID：`355486824`
- 目标提交：`14bc78a81c827882efc232c6c6c12f0d8ed04542`
- portable、setup 和 `SHA256SUMS.txt` 的远端文件名、大小、SHA-256 与 digest 一致。

### U38-A — 播放器会话边界

- PR：#73
- 合并提交：`345d11555b219ae9eb48be0e1be539eca011b9e6`
- `playerQueueTransitions.ts` 负责队列转换。
- `usePlayerSessionPersistence.ts` 负责 Queue、History、续播和节流持久化。

### U38-B — Controller 与 Backend

- PR：#75
- 合并提交：`4e7105386c2057bdcff95183b45b56aa6ceb5513`
- `usePlayerBackend.ts` 集中 HTMLAudio、mpv、媒体解析、fallback、Seek、音量和状态同步。

### U38-C — 字幕生命周期

- PR：#77
- 合并提交：`bff4ff6641263a002509344216a01c7a79b4163b`
- `usePlayerSubtitles.ts` 集中请求代次、过期结果丢弃、来源变化重载和状态映射。
- U38 连续播放器结构治理收口。

### U39-A — 播放器主题一致性

- PR：#78
- 合并提交：`8431829427dbe3da86b976a18d124a7a119c5e8f`
- PlayerBar、控制、进度条和临时弹层进入语义主题体系。
- 播放后端、Queue、字幕、Seek 和续播未改动。

### U39-B — 设置与 AI 维护入口

- PR：#79
- 合并提交：`f87813cb219f8d298c54eb4fd7793d1038129b5a`
- 设置页提供独立 AI 维护入口。
- 维护概览、性能诊断和完整历史诊断按需加载。

### U39-C — 资源库授权持久化

- PR：#80
- 合并提交：`77f0152a80aea9fdfeaaf33f046d9a47d69f6d2e`
- `RootAuthorizationStore` 在用户数据目录持久化授权记录。
- 重新选择既有资源库时复用记录或接管 Index token。
- U28 / U29 验证重启后无需重选即可读取、播放、续播和加载字幕。

### U39-D — 雾光象牙对比度

- PR：#81
- 合并提交：`5a6411da2a5dbdb90ef143061f293e6f7160c94a`
- 新旧主题变量同步。
- 文字与状态色至少 `4.5:1`，交互边界至少 `3:1`。
- 静态 WCAG、真实 Electron 和 U30 验收通过。

### U39-E — 日常空状态真实性

- PR：#82
- 合并提交：`b0842eb335f937748d580c6e7aee990537307224`
- 空音乐库隐藏无内容的元数据工具容器。
- 导入器未选择来源时明确显示当前没有扫描结果。
- 历史示例统计继续隐藏，不作为当前扫描结果。
- U39-E verifier、U30、U32 和完整 Windows 回归通过。

### U39-F — 增量架构防回退门禁

- PR：#83
- 新增 `.github/workflows/architecture-guardrails.yml`。
- 新增 `scripts/verify-u39f-architecture-guardrails.mjs`，比较 PR base 与 head。
- 禁止新增显式 `any`、Renderer 裸 IPC、Renderer/Electron 实现层跨层导入和相对导入循环。
- 新增 `scripts/test-u39f-architecture-guardrails.mjs`，在临时 Git 仓库注入四类违规并确认门禁失败。
- 当前报告记录 1 个历史相对导入环，0 个本 PR 新增循环。
- 纯门禁变更由 focused scope 委托，不重复执行 U28～U32 或安装包链。
- 未修改产品运行时、播放器、资源库、Index、导入器或安装器。

### U39-G — 最终综合验收

- PR：#84。
- 新增 `scripts/verify-u39-final-acceptance.mjs` 与 `.github/workflows/u39-final-acceptance.yml`。
- 同一候选提交执行 U28～U32、U39-A～F、stable regression、portable、NSIS、安装卸载、用户数据保留和页面完整性。
- U39 预排治理轮次收口；Issue #66 继续作为长期触链治理清单。

## 2026-07-18

### U40-A — 个人项目快速维护规则

- PR：#85。
- 再次确认 Yang-Kura 是个人使用项目，测试和门禁按实际风险分级，不采用商业项目式的全量流程。
- 纯文档、普通 UI、Renderer Hook 和低风险状态调整不默认执行 portable、NSIS、安装/卸载验收。
- 一个任务使用一个 PR，功能、必要文档、工作日志和交接在同一 PR 收口。
- 不再创建独立文档收口 PR，不因历史字符串或镜像文档反复运行完整 CI。
- 核心文档继续维护，但避免同步没有现实用途的重复历史文件。

### U40-B — 全产品用户旅程与交互覆盖验收

- PR：#86。
- 新增 `.github/workflows/u40b-full-product-acceptance.yml`、主旅程、汇总器和模块化 CDP/fixture/coverage 测试工具。
- 组合执行 U28 资源库与重启、U29 播放器与字幕、U30 主题/DPI/键盘、U31 导入事务、U32 日常页面视觉审查和 U40-B 全产品旅程。
- 自动生成 6 个 1 秒 WAV、LRC/SRT/VTT/ASS、无字幕音轨、封面和临时目录，不访问真实媒体库。
- 真实启动 Electron，逐页进入首页、音声库、RJ 详情、音乐库四视图、歌单、导入、设置、AI 维护、队列和全屏歌词。
- 记录表单、主题、HTMLAudio 后端、Escape、Tab、Shift+Tab、窗口/DPI、减少动画和 1 秒音频自然结束。
- 最终运行：GitHub Actions Run `29610622943`，Artifact `8418616793`，digest `sha256:23afb0847eb6b043a71da7aa56a8fd5b294e4c2b9b1eee78421cd2742fd554fd`。
- 最终结果：6/6 套件 PASS；635 个可见控件状态；65 条操作记录；14 条用户旅程；19 张截图；未覆盖 0；运行时错误 0。
- 物理扬声器、声卡、真实显示器主观观感和第三方程序界面按用户要求排除。
- U40-B 作为按需综合验收保留，不进入每个普通 PR 的默认门禁。

### U40-C — UI 细节收口

- PR：#87。
- 新增 `src/styles/u40c-ui-polish.css`，集中承载低风险语义样式覆盖，不修改业务逻辑。
- 提升浅色 AI 维护页状态文字、状态标签、次级按钮和禁用态辨识度。
- 专辑、艺术家和文件夹少量结果使用紧凑宽度范围，不再被网格拉伸占满整行。
- 全屏歌词保留沉浸暗色舞台，同时统一主应用圆角、边框、阴影和品牌材质，并移除装饰窗口圆点。
- `1120px` 以下设置页压缩维护入口，四个设置标签保持单行可滚动导航。
- 新增 `scripts/verify-u40c-ui-polish.mjs` 和 `.github/workflows/u40c-ui-polish.yml`。
- 最终 Windows Run `29626125281`：TypeScript、production/Electron build、U40-C verifier、U30、U32 和 U40-B 相关旅程全部 PASS。
- Artifact `8423932306`，digest `sha256:b9c255d9615d2e59d5f2b3c0802d22b6b04f454f6668941831f32bf448724a00`。
- Architecture Guardrails 和 UI Fast Validation 同步通过。
- 没有修改播放器、资源库、Index、导入器、文件操作、安装器或发布版本。

## 当前结论

```text
U34～U36：完成
U37-A～U37-D：完成
U38-A～U38-C：播放器治理完成
U39-A～U39-E：日常体验与审计问题修复完成
U39-F：增量架构防回退门禁完成
U39-G：最终综合验收完成
U40-A：个人项目快速维护规则完成
U40-B：全产品用户旅程与交互覆盖验收完成
U40-C：UI 细节收口完成
当前版本：0.169.0-beta.2
Beta 2：已发布并完成远端资产校验
当前任务：按需日常维护
大型功能：长期冻结
```
