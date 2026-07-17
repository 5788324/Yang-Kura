# Yang-Kura 当前项目交接

## 当前事实

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
版本：0.169.0-beta.2
平台：Windows x64
技术栈：React + Vite + TypeScript + Electron
索引：Local JSON Index
Beta 2：已发布，Release ID 355486824
U34～U38：完成
U39-A～U39-E：完成
U39-F：增量架构防回退门禁完成
U39-G：最终综合验收完成
U40-A：个人项目快速维护规则完成
U40-B：全产品用户旅程与交互覆盖验收完成
当前任务：按需日常维护
```

必须从最新 `origin/main` 接手。状态见 `PROJECT_STATE.md`，路线见 `PROJECT_ROADMAP.md`，日志见 `AI_HANDOFF/WORKLOG.md`。

## 当前边界

- 播放器 Queue/Persistence、Backend、Subtitle 边界已收口，不再连续拆分。
- root token 授权可跨重启恢复，Renderer 不保存绝对路径。
- 日常设置与 AI 维护已有独立入口；真实检修工具只在触碰对应功能时迁移。
- 浅色主题与日常空状态已完成自动验收。
- `Architecture Guardrails` 禁止新增显式 `any`、Renderer 裸 IPC、实现层跨层导入和相对导入循环。
- 当前存在 1 个历史相对导入环，作为基线保留，触链时再清理。
- U40-B 已覆盖当前已知自动化用户流程；物理声卡、扬声器、真实显示器主观观感和第三方程序界面不在范围。

## 验证

- 播放器：`Player Fast Validation`。
- 设置、主题和页面：`UI Fast Validation`。
- TypeScript / Electron 架构增量：`Architecture Guardrails`。
- U39 历史综合复核：手动运行 `U39 Final Acceptance`。
- 全产品用户旅程复核：手动运行或修改 U40-B 测试时运行 `U40-B Full Product Acceptance`。
- Electron Main、安装器、依赖、用户数据目录和正式发布：完整 Windows 与打包验收。
- 纯文档、普通 UI、Renderer Hook 和低风险状态调整不得默认触发 portable、NSIS、安装/卸载链；只执行与改动风险匹配的定向验证。

## U40-B 证据

```text
工作流：.github/workflows/u40b-full-product-acceptance.yml
主旅程：scripts/test-u40b-full-product-journey.mjs
组合套件：U28 + U29 + U30 + U31 + U32 + U40-B
最终状态：PASS
套件：6 / 6
1 秒 WAV：6
字幕样本：4（LRC / SRT / VTT / ASS）
可见控件状态：635
操作记录：65
用户旅程：14
截图：19
未覆盖：0
运行时错误：0
说明：docs/U40B_FULL_PRODUCT_ACCEPTANCE.md
```

所有真实文件操作都在 Windows runner 临时目录中执行并清理，没有访问用户真实媒体库。U40-B 是按需综合验收，不是普通 PR 的默认门禁。

## 个人项目快速模式

- 用户可见 Bug、体验和明确小功能优先于纯内部整理。
- 一个任务一个 PR；功能、必要文档、工作日志和交接在同一 PR 收口。
- 不创建额外“文档收口 PR”，不为一句历史文案反复运行完整发布门禁。
- 小型、相关、低风险改动可以合并处理；CI 原则上只保留一次最终验证。
- 核心文档集中维护，避免为了镜像一致性同步大量重复历史文件。

## 后续启动条件

不再存在预排的连续内部治理轮次。只有真实 Bug、明确体验问题、用户提出的小型功能、依赖/Windows 兼容变化或触链技术债才启动新任务。Issue #66 保持开放。

## 协作

用户只接收最终成果。ChatGPT 负责开发、自动测试、Git、PR、文档、合并和发布。物理硬件和第三方程序界面不属于默认自动验收范围。

## 冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式集成、云同步、账号和插件市场保持冻结。
