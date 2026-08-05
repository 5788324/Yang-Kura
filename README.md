# Yang-Kura

> 当前公开版本：`0.170.0-beta.3`
> 公开标签：`v0.170.0-beta.3`
> 当前 `main`：`18ada58b76a3aa0828506d2d02c57ecd22fbc587`
> 当前本地候选：`1.0.0-rc.1`（U41-D + Git Fast Lane v2.3 + U41-E）
> RC 标签与 Release：`NOT CREATED`
> 1.0 发布结论：`NO-GO / WINDOWS VERIFY`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；资源库采用 Local JSON Index。

## 当前事实

- Beta 3 已发布；PR #92 已合并到 `main@18ada58b...`。
- U41-B 真实四步 Importer 与 U41-C Electron 39.8.10 已通过 Windows 和 CI。
- U41-D 本地候选已移除冻结 Downloader 生产路由与 bundle，归档 94 个历史源码文件，将不可达实现降为 0，并把 workflow 17→9、verifier 87→58。
- Git Fast Lane v2.3 已固定：多文件源码只通过真实 clone 与原生 Git 发布；正常尝试和同路径重试均失败后立即交给 Codex，不再使用 GitHub Contents/Git Data API 拼装提交。
- U41-E 将版本提升为 `1.0.0-rc.1`，复用 U28/U29/U30/U31/U40-B/U41-B，并新增 1280、1024、800 三档窗口与键盘最终门禁。
- 本地 lint、Renderer build、Electron TypeScript build和 U41-E 静态门禁已通过；Electron 可见测试、portable/NSIS 与安装升级卸载严格为 `NOT RUN / WINDOWS CI`。

## 当前生产能力

- Windows Electron、portable 与 NSIS 构建合同；
- ASMR/RJ 与普通音乐双资源库；
- Local JSON Index 写入、读取、备份、恢复与维护；
- HTMLAudio、可选 mpv、Seek、Queue、History、续播与字幕；
- 元数据覆盖、DLsite 单 RJ Provider、外部打开；
- 真实四步 Importer：扫描、冲突预检、copy/move、OperationLog、失败回滚与 Index patch；
- Dark/Light 主题、键盘导航和多档窗口布局。

## 1.0 RC 边界

本轮不会解冻 Downloader、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步或插件市场。只有固定候选 SHA 的 Windows RC 工作流和 Codex 实机验收全部通过后，才允许创建 `v1.0.0-rc.1`。

## 发布工作流

```text
ChatGPT：开发 → 测试 → 文档 → 完整源码包/patch/diff
Codex：干净 clone → 固定父 SHA → 单一提交 → 一次推送 → Draft PR
ChatGPT：只读审核 SHA、diff、CI、Windows 证据 → Ready / 修复 / 合并
```

详见：

- `docs/GIT_FAST_LANE_V2.md`
- `docs/U41D_LEGACY_CLEANUP.md`
- `docs/U41E_RC_FINAL_ACCEPTANCE.md`
- `docs/RELEASE_NOTES_1.0.0-rc.1.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
