# PROJECT_STATE

当前权威状态见根目录 `PROJECT_STATE.md`，完整交接见 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`。

```text
核心版本：0.168.0-beta.1
代码事实来源：最新 origin/main
U02～U32：已完成
当前任务：U33 Beta 发布
目标 tag：v0.168.0-beta.1
目标发布：Yang-Kura 0.168.0 Beta 1
MVP130：继续冻结，禁止自动合入
```

U27 的历史 `NO-GO`、MAJ-001 和 MAJ-002 已在 U28 关闭。接手者必须先同步最新 main，并检查开放 PR、Actions、tags 和 Releases，再继续完成 U33 的 PR 门禁、squash merge、main-only prerelease 发布、发布资产回读和最终交接。

不要依赖旧固定 SHA、旧 Round、旧 ZIP 或历史 MVP 文档。用户不承担测试、排错、构建、Git 或发布工作；Codex 默认只负责自动化无法替代的真实本机测试，不修改产品源码。
