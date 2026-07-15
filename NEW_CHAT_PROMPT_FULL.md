# NEW_CHAT_PROMPT_FULL

你接手的是 Yang-Kura：React + Vite + TypeScript + Electron 的 Windows 本地音频媒体库，支持 ASMR/RJ 与普通音乐。当前使用 Local JSON Index；SQLite 后置。

## 唯一可信来源

- 仓库：`https://github.com/5788324/Yang-Kura.git`
- 代码：最新 `origin/main`
- 当前状态：`PROJECT_STATE.md`
- 长期路线：`PROJECT_ROADMAP.md`
- 完整交接：`AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- 固定分工：`AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`

不要使用旧 ZIP、旧工作区、旧 Round 文档或固定 SHA 作为当前代码事实。

## 当前状态

```text
核心版本：0.168.0-beta.1
U02～U32：已完成
当前阶段：U33 Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
发布后：个人 Beta 观察与定向修复
MVP130：继续冻结，禁止自动合入
```

U27 的历史 `NO-GO`、MAJ-001 和 MAJ-002 已在 U28 关闭。U29 完成播放器、队列、续播和字幕；U30 完成三主题、窗口、DPI、键盘和可访问性；U31 完成导入事务与失败回滚；U32 完成发布候选 UI、portable、NSIS、安装、重复安装、卸载、用户数据保留、fallback 和 SHA-256 验收。

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

工作区存在未提交改动时立即停止，不要 stash、reset 或覆盖。随后核对开放 PR、Actions、tags 和 Releases，以判断 U33 位于以下哪个状态：

1. 发布 PR 仍开放：审查 diff 和门禁，修复后完成 squash merge；
2. PR 已合并、发布工作流运行中：检查 main-only publish 结果；
3. prerelease 已创建：回读 tag、目标提交、资产名、体积、SHA-256 和下载 URL；
4. U33 已完成：更新状态和交接，进入个人 Beta 观察期。

## U33 发布合同

发布参数以 `release/u33-release-plan.json` 为唯一计划来源：

```text
version：0.168.0-beta.1
tag：v0.168.0-beta.1
title：Yang-Kura 0.168.0 Beta 1
prerelease：true
assets：portable / setup / SHA256SUMS.txt
```

PR 阶段必须通过 Branch Validation、U33 Release Preflight、U33 Beta Release build、U32 打包与安装验收。PR 阶段不得创建 tag 或 Release。只有 squash 合入 `main` 后的 main-only publish job 可以创建 prerelease，并必须回读验证发布结果。

## 固定分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git、不创建 tag 或 Release。

ChatGPT 负责计划、产品代码、自动测试、Windows CI、Electron/CDP、文件系统临时样本、截图审查、Git、PR、合并、发布、回读验收和最终交付。

Codex 默认只负责 GitHub runner 无法替代的真实本机、硬件、驱动、系统权限或安装集成测试，不修改产品源码。后续诊断、修复和 Git 管理仍由 ChatGPT 负责。

## 安全与 UI 硬规则

- 真实媒体库可读取、浏览和播放；测试性删除、移动、覆盖和批量写入只使用临时目录或副本。
- Renderer 不接收真实绝对路径或 `file://`。
- 日常层只展示用户实际使用的功能；工程、诊断、回归和测试入口集中到 AI 维护或隐藏兼容层。
- 不为了代码整齐重写播放器、Importer、Index、Electron 或全项目架构。
- 安装、卸载、数据保留和发布资产必须保留专项验收。

## 发布后路线

```text
U33 完成
→ 个人 Beta 观察期
→ 只处理真实使用中可复现的 Blocker/Major
→ 重新评估下一条主线
```

MVP130 下载器、完整 AI Agent、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和全局架构重写在发布成功前继续冻结；发布后也不得自动启动。
