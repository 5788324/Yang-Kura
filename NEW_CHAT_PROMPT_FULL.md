# NEW_CHAT_PROMPT_FULL

你接手的是 Yang-Kura：React + Vite + TypeScript + Electron 的 Windows 本地音频媒体库，支持 ASMR/RJ 与普通音乐。当前使用 Local JSON Index；SQLite 后置。

## 唯一可信来源

- 仓库：`https://github.com/5788324/Yang-Kura.git`
- 代码：最新 `origin/main`
- 路线：`PROJECT_ROADMAP.md`
- 当前状态：`PROJECT_STATE.md`
- 完整交接：`AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`

不要使用旧 ZIP、旧工作区、旧 Round 文档或固定 SHA 作为当前代码事实。

## 当前状态

```text
核心版本：0.167.0-mvp129
U02～U26：已完成
U27 最终结论：NO-GO
当前主线：U28 资源库授权、真实 Index、浏览与播放闭环
阻断问题：MAJ-001、MAJ-002
MVP130：继续冻结，禁止合入
```

U27 真实 `E:\arsm` 补测发现：原生目录选择后，Settings、读取/扫描按钮、浏览页、顶栏和播放器没有使用同一真实状态；AI 维护诊断仍显示 Demo 扫描，不能反映真实授权或 Index。

用户反馈该问题可能已经修复并推送到 Git，但本交接编写时 GitHub `main` 仅看到 U27 NO-GO / U28 范围文档提交，没有可验证的产品修复 PR。你的第一任务是核对最新 Git 事实，而不是直接开发。

## 开始步骤

```powershell
Set-Location "G:\Codex\Yang Kura"
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
git log -15 --oneline --decorate
```

工作区存在未提交改动时立即停止，不要 stash、reset 或覆盖。

检查最新提交、远端分支和 PR，确定修复是否：

1. 已合入 main；
2. 位于未合并分支/PR；
3. 尚未存在。

重点审查 Settings 目录授权、Electron 安全 token/root snapshot、读取 Index 与扫描按钮启用条件、App 资源库水合、顶栏/浏览页/PlayerBar 数据快照、Diagnostics 真实状态来源。

## 决策规则

- 修复已在 main：不重复写代码，直接跑门禁与真实 U28 GUI 复验。
- 修复在分支/PR：审查 diff 和数据安全，跑完整门禁与临时/真实库复验，通过后正式合并。
- 没有修复：从最新 main 创建独立 U28 分支，只修 MAJ-001/MAJ-002。

## U28 完成条件

- 原生目录选择后 Settings 立即识别授权 root。
- “读取已有记录”和“一键扫描并应用”按真实能力启用。
- Index 可读取，或在无 Index 时安全扫描生成。
- 顶栏、Settings、首页、音声库、音乐库和 PlayerBar 使用同一数据快照。
- Diagnostics 读取真实授权/Index 状态，或明确禁用；不得展示 Demo 为当前状态。
- 临时样本完成可写测试与重启恢复。
- 真实 `E:\arsm` 只读完成授权、浏览和播放至少一个音轨。
- U02～U28 verifier、`npm run verify:stable`、`npm run build` 通过。
- 用户配置恢复、Git clean、无残留 Yang Kura/Electron/mpv 进程。

## 安全与 UI 硬规则

- 真实媒体库不执行删除、清理、移动、覆盖、批量写入或元数据改写。
- copy-only 优先；move-only 仅限临时副本并二次确认。
- 不向 Renderer 日常界面暴露绝对路径或 `file://`。
- 日常层只展示用户实际使用的功能；工程、诊断、回归和测试入口集中到 AI 维护。
- 诊断不能用 Demo/静态状态冒充真实用户资源状态。
- 不为了代码整齐重写播放器、Importer、Index 或 Electron 架构。

## 后续路线

```text
U28 资源库闭环
→ U29 播放器与字幕
→ U30 UI、三主题、窗口与 DPI
→ U31 导入器与数据安全
→ U32 Windows 发布候选
→ U33 新 Beta 发布收口
```

U33 完成前禁止启动 MVP130、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 或全局重构。

标准流程：最新 main → 状态核对 → 独立分支 → 有限实现/验收 → 专项 verifier → 完整稳定回归 → Windows 构建与 GUI 证据 → PR → squash merge → 更新状态文档。

用户希望你自主推进，不要反复询问已经明确的事项；但当前明确要求暂停开发，因此先完成接手核对和状态报告，再继续路线任务。