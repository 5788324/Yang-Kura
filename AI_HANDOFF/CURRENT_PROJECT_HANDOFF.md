# Yang-Kura 当前项目交接

## 固定事实

```text
repository: 5788324/Yang-Kura
public version: 0.170.0-beta.3
public tag: v0.170.0-beta.3
main: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
PR #92: merged
local candidate: 1.0.0-rc.1
current cumulative scope: U41-D + Git Fast Lane v2.3 + U41-E
remote candidate branch/PR: NOT CONFIRMED / DO NOT CLAIM
RC tag/release: NOT CREATED
1.0.0: NO-GO / WINDOWS VERIFY
```

## 候选内容

### U41-D

- Downloader 退出生产路由、Sidebar、Router、源码和 bundle；
- 94 个历史源码文件进入 archive，生产不可达实现为 0；
- workflow 17→9；verifier 87→58；
- Importer、播放器、Index schema 和真实媒体行为不变。

### Git Fast Lane v2.3

- ChatGPT 负责开发、测试、文档、diff、完整源码包和 patch；
- 多文件源码只允许真实 clone + 原生 Git；
- 原生发布一次正常尝试、最多一次同根因重试；
- 仍失败立即交给 Codex / DeepSeek；
- 禁止 Contents API 逐文件提交和 Git Data API 拼 blob/tree/commit；
- GitHub 连接器只用于只读审核、PR 元数据、Ready 和合并。

### U41-E

- 候选版本 `1.0.0-rc.1`；
- 新增 7 路由 × 1280/1024/800 的溢出、控件边界、最小尺寸和键盘焦点检查；
- About 必须显示 RC 版本，Downloader 不得恢复；
- 现有 U32 workflow 升级为单一 Windows RC 门禁，避免增加第 10 条重复 workflow；
- 门禁复用 U28/U29/U30/U31/U40-B/U41-B，并包含 portable/NSIS、安装升级卸载、数据保留和进程回收。

## 本地证据

- `npm ci`：PASS；
- lint：PASS；
- Renderer build：PASS / 1781 modules；
- Electron TypeScript build：PASS；
- U41-D focused verifier：PASS；
- U41-E static verifier：PASS；
- npm audit moderate：PASS / 0 vulnerabilities；
- 完整 `verify:stable`：PASS；
- Electron 可见 RC 测试：NOT RUN，本地无法下载 Electron binary；
- Windows 打包/安装：NOT RUN；
- RC tag / Release：未创建。

## 发布任务

```text
parent: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
branch: release/u41e-rc1-candidate
commit: release: prepare Yang-Kura 1.0.0-rc.1
push: exactly once
PR: Draft
```

Codex 必须在干净 clone 中核对父 SHA，应用完整累积包，确认只有预期文件变化，运行任务书规定的本地验证，形成一个提交并一次推送。ChatGPT 随后只读核对远端 SHA、diff、CI 和实机证据。
