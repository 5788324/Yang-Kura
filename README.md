# Yang-Kura

> 当前公开版本：`1.0.0-rc.1`
> 公开标签：`v1.0.0-rc.1`（GitHub Release + Prerelease）
> 当前 `main`：`72066aa78b2eaa32f0750b115770d6847e5d46c9`
> 当前本地候选：`1.0.0-rc.1`（U41-D + Git Fast Lane v2.3 + U41-E）
> 当前分支：`product/u42-daily-ui-simplification`（Draft PR #94）
> 1.0 发布结论：`NO-GO / WINDOWS VERIFY`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；资源库采用 Local JSON Index。

## 当前事实

- `1.0.0-rc.1` 已发布为 GitHub Release + Prerelease；RC 收尾已合并到 `main@72066aa...`。
- U41-B 真实四步 Importer 与 U41-C Electron 39.8.10 已通过 Windows 和 CI。
- U41-D 已移除冻结 Downloader 生产路由与 bundle，归档 94 个历史源码文件，workflow 17→9、verifier 87→58。
- Git Fast Lane v2.3 已固定：多文件源码只通过真实 clone 与原生 Git 发布。
- U42 日常界面精简进行中（Draft PR #94）：只整理既有功能，不新增能力，不修改版本/Tag/Release。
- 本地 lint、Renderer build、Electron TypeScript build 与 U42 静态/运行时门禁已通过；Electron 可见测试在 Windows CI 执行。

## 当前日常界面

- 常用能力直接显示：播放控制、收藏、歌单、歌词、进度与音量、资源库浏览、导入、搜索。
- 批量操作、移动导入、MPV 手动设置、元数据备份与诊断修复按需展开（进入对应模式或打开“高级”入口），默认界面更精简。
- 功能没有被删除：精简只把低频操作折叠或移入“更多”菜单，底层后端与安全链保持不变。
- RC1 Release 未修改：`v1.0.0-rc.1` 保持原样，U42 尚未合并、未发布。

## 当前生产能力

- Windows Electron、portable 与 NSIS 构建合同；
- ASMR/RJ 与普通音乐双资源库；
- Local JSON Index 写入、读取、备份、恢复与维护；
- HTMLAudio、可选 mpv、Seek、Queue、History、续播与字幕；
- 元数据覆盖、DLsite 单 RJ Provider、外部打开；
- 真实四步 Importer：扫描、检查文件冲突、copy/move、操作记录、失败回滚与资源库记录更新；
- Dark/Light 主题、键盘导航和多档窗口布局。

## 1.0 RC 边界

本轮不会解冻 Downloader、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步或插件市场。只有固定候选 SHA 的 Windows RC 工作流和 Codex 实机验收全部通过后，才允许正式发布 1.0.0。

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
