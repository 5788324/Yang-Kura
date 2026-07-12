# NEXT_CHAT_HANDOFF

## 必须先知道

```text
当前稳定主线：0.167.0-mvp129
GitHub main / HEAD / origin/main：316d8127d6d423a1d9e6930b8b804a3bac11140e
Round 6 最终 Git 合入：PASS
MVP130：实验下载器，独立保存，禁止合入
当前阶段：真实日常使用观察；不是自动开发新功能
```

## 接手顺序

1. 打开 `AI_HANDOFF/00_READ_THIS_FIRST.md`。
2. 查看 `AI_HANDOFF/ROUND6_FINAL_GIT_INTEGRATION_REPORT.md`。
3. 运行 `npm run verify:stable` 前先确认版本和 Git 状态。
4. 用户未明确选择新功能时，只处理实际使用中出现的明确问题。

## 当前验证命令

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
npm run desktop:setup
npm run desktop:smoke-check:strict
npm audit --audit-level=high
```

## 提示词规则

完整 Codex/DeepSeek 任务提示词放在 `AI_HANDOFF/`。聊天中只给一句简短转发词。非必要不要安排 Codex；Codex 无额度时由 DeepSeek按同一文件执行。

## 安全边界

- 不暴露 `absolutePath` / `file://` 给 Renderer。
- 不自动删除、覆盖或整理真实媒体文件。
- move-only 仅限受控小样本和二次确认。
- 索引写入/恢复必须备份、SHA 复核和读回验证。
- 不接 SQLite，除非真实瓶颈成立且用户批准。
- 不合入 MVP130，除非用户明确恢复下载器路线并建立独立分支。

## 已完成的发布阶段锚点

- Round 4 Windows 发布门禁：PASS。
- Round 5 清理与依赖精简：PASS。
- Round 6 最终 Git 合入：PASS。
