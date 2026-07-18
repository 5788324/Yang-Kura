# PROJECT_ROADMAP

> 长期路线真源。代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`。

## 1. 当前基线

```text
公开版本：0.169.0-beta.2
下一版本：0.170.0-beta.3
U34～U40-D3：核心能力、真实库稳定性和缺陷收口完成
Issue #66：已关闭
Git Fast Lane v2：已生效
当前主线：Beta 3 正式日用发布收口
大型功能：长期冻结
```

## 2. 产品目标

Yang-Kura 是个人使用的 Windows 本地音频媒体库，覆盖 ASMR/RJ、普通音乐、播放器、字幕、歌单、Queue、History、续播、导入、元数据和资源维护。

## 3. 已完成主线

- U34～U37：统一 IPC、语义 Token、AppShell 和正式媒体库页面。
- U38：Queue/Persistence、Player Backend、Subtitle lifecycle 分域。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。
- U40-A：风险分级验证与单 PR 收口。
- U40-B：6/6 全产品旅程、635 个可见控件状态、未覆盖 0、运行时错误 0。
- U40-C：UI 细节收口。
- U40-D～D3：真实库读取/分组、独立 Profile、单实例、主题/歌单/导入页、mpv 和 HTMLAudio 停滞状态收口。

## 4. Beta 3 正式日用发布收口

1. 固化 `0.170.0-beta.3` 发布合同、Release Notes 和资产名称；
2. PR 候选完成 U28/U29/U31、portable/NSIS 和安装验收；
3. Codex 只读验证 `D:\CloudMusic\VipSongsDownload`；
4. Codex 在 `%TEMP%` 小型副本验证 Index、备份恢复、copy/move、失败回滚和 OperationLog；
5. 合入 `main` 后创建 prerelease；
6. 回读目标提交、资产名、大小和 SHA-256；
7. 发布事实同步后进入真实日用观察。

## 5. 验收体系

- 普通维护按 `docs/GIT_FAST_LANE_V2.md` 的 L0～L2 分级。
- Beta 3 属于 L3，只执行一次完整 Windows 打包与发布链。
- `Personal Beta 3 Release` 是本轮自动化真源。
- `docs/CODEX_BETA3_RELEASE_ACCEPTANCE.md` 只覆盖自动化不可替代的真实音乐库和临时写入链。

## 6. 发布后维护

默认顺序：真实 Bug → 数据/Index/导入/双重播放/进程问题 → 字幕/播放/搜索/UI/性能 → 明确小型功能 → 触链技术债。不预排连续治理轮次。

## 7. 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号、插件市场和无关大型 Provider。

## 8. 自主管理

用户只接收最终成果。ChatGPT 负责实现、测试、文档、PR、合并和发布；Codex 仅执行自动化无法替代的真实 Windows、显示、声卡、第三方程序和真实媒体库验收。
