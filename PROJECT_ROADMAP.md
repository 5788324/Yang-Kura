# PROJECT_ROADMAP

> 长期路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`。

## 1. 当前基线

```text
版本：0.169.0-beta.2
Beta 1 / Beta 2：已发布并完成远端资产校验
U34～U38：架构、媒体库和播放器边界完成
U39-A～U39-G：体验、门禁和综合验收完成
U40-A～U40-D：快速维护、全产品验收、UI 收口和真实库稳定性完成
Issue #66：已关闭
当前主线：按需日常维护
大型功能：长期冻结
```

## 2. 产品目标

Yang-Kura 是个人使用的 Windows 本地音频媒体库，覆盖 ASMR/RJ、普通音乐、播放器、字幕、歌单、Queue、History、续播、导入、元数据和资源维护。

```text
媒体库可长期日用
+ 状态可信
+ UI 清晰
+ 数据安全
+ AI 可持续维护
```

## 3. 已完成主线

- U34～U37：统一 IPC、语义 Token、AppShell、正式首页、音声库、RJ 详情和音乐库。
- U38：Queue/Persistence、Player Backend、Subtitle lifecycle 分域完成。
- U39：播放器主题、AI 维护入口、授权持久化、浅色对比度、真实空状态、架构门禁和最终 Windows/打包验收完成。
- U40-A：个人项目风险分级验证和单 PR 收口规则。
- U40-B：全产品自动用户旅程；6/6 套件、635 个可见控件状态、未覆盖 0、运行时错误 0。
- U40-C：浅色维护页、稀疏音乐集合、全屏歌词和窄设置页视觉收口。
- U40-D：Index 读取状态、跨页面一致性、自动化污染、真实库分组、日常设置术语和 Issue #66 收口。

## 4. U40-D 后的维护原则

默认顺序：

1. 修复真实使用 Bug；
2. 处理字幕、播放、搜索、日常 UI 或性能问题；
3. 实现用户明确提出的小型功能；
4. 仅在触碰相关链路时删除剩余历史兼容源码。

不再预排连续内部治理轮次，不为目录整齐进行大规模搬迁。

重大风险优先：数据丢失、Index 损坏、导入回滚失败、双重播放、读取状态不收敛、安装升级失败和进程残留。

## 5. 验收体系

- `U40-B Full Product Acceptance`：全产品页面、控件、播放、字幕、导入、主题、窗口和键盘旅程。
- `U40-C UI Polish`：UI 表层和主题一致性。
- `U40-D Real Library Stability`：共享读取状态、旧测试污染、目录分组、轻量设置、0 导入循环及 U28/U29/U30/U32/U40-B 回归。
- `Branch Validation`：U28～U32、当前行为 verifier、stable regression 和最终 production build。
- `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`：真实 `E:\arsm` 与 `D:\CloudMusic\VipSongsDownload` 实机只读验收。

## 6. 风险分级

### 低风险

```text
TypeScript
→ production build
→ 相关 E2E
→ 定向 verifier
```

### 中风险

播放器后端、真实文件读取、Index 和受控写入增加 Electron E2E、临时目录、失败回滚和重启测试。

### 高风险

Electron Main、安装器、依赖、用户数据目录和正式发布变化执行完整回归、portable、NSIS、首次安装、重复安装、卸载、数据保留和进程回收。

## 7. 历史兼容边界

- 旧 `SettingsPage.tsx`、`DiagnosticsPage.tsx`、历史 MVP verifier 和 package 元数据仅作追溯。
- 不得重新接回生产路由。
- 新领域必须使用独立模块和严格类型。
- 当前相对导入循环为 0；Architecture Guardrails 继续禁止新增循环、显式 `any`、Renderer 裸 IPC 和实现层跨层导入。

## 8. 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号、插件市场和无关大型 Provider。

## 9. 自主管理

用户只接收最终成果。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅执行自动化无法替代的真实 Windows、显示缩放、声卡、驱动和真实媒体库验收。
