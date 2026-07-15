# NEXT_CHAT_HANDOFF

## 当前必须先知道

```text
项目：Yang-Kura
代码事实来源：最新 origin/main
核心版本：0.168.0-beta.1
U02～U32：已完成
当前任务：U33 Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
MVP130：继续冻结，禁止自动合入
```

完整交接见：

```text
AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md
```

## 接手第一步

```powershell
git status --short
git fetch origin --prune
git checkout main
git pull --ff-only origin main
git rev-parse HEAD
git log -15 --oneline --decorate
```

随后核对开放 PR、Actions、tags 和 Releases：

- 工作区不干净时停止，不要 stash、reset 或覆盖。
- 不以提交标题代替源码、测试和发布证据。
- U27 的历史 `NO-GO`、MAJ-001 和 MAJ-002 已在 U28 关闭，不得重新当作当前阻断项。
- 当前发布参数以 `release/u33-release-plan.json` 为唯一计划来源。

## U33 当前顺序

```text
PR 版本与文档一致
→ Branch Validation、U33 Preflight、Windows 打包与安装验收
→ squash merge 到 main
→ main-only 工作流创建 tag 与 prerelease
→ 回读资产名、体积、SHA-256、下载 URL 和目标提交
→ 更新 PROJECT_STATE 与最终交接
```

用户不测试、不排错、不运行命令、不维护 Git。ChatGPT 负责代码、自动测试、Git、PR、合并和发布；Codex 默认只负责自动化无法替代的真实本机测试，不修改产品源码。

U33 发布成功前，不启动 MVP130 下载器、完整 AI Agent、SQLite、OpenList/WebDAV、Player Core v2 或全项目重构。发布后先进入个人 Beta 观察期，只处理真实使用中可复现的 Blocker/Major，再重新评估下一条主线。
