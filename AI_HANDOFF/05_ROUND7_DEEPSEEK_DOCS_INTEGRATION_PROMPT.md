# Round 7：最终交接文档合入（DeepSeek）

你是 DeepSeek。当前 Codex 没有额度。只执行文档合入，不开发新功能、不修改业务代码。

## 1. 固定基线

```text
仓库：G:\Codex\Yang Kura
branch：main
期望旧 HEAD = origin/main：316d8127d6d423a1d9e6930b8b804a3bac11140e
版本：0.167.0-mvp129
```

MVP129 已通过 Round 6 并推送。MVP130 是独立实验包，禁止解压或合入。

## 2. 输入包

使用用户提供的 Round 7 最终交接候选源码 ZIP。先计算 SHA-256，并与包内/用户提供的值核对。

在仓库外解压。不要直接覆盖 `.git`。

## 3. 允许变化白名单

只允许新增或更新这些文档类文件：

```text
AI_HANDOFF/**
README.md
00_NEW_CHAT_START_HERE.md
PROJECT_STATE.md
PROJECT_ROADMAP.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
NEW_CHAT_PROMPT.md
NEW_CHAT_PROMPT_FULL.md
docs/PROJECT_STATE.md
docs/NEXT_CHAT_HANDOFF.md
docs/RUN_ME_FIRST.md
docs/CURRENT_ROADMAP_MVP129.md
docs/STABLE_RELEASE_MVP129.md
docs/FINAL_GIT_STATUS_MVP129.md
FINAL_HANDOFF_MANIFEST.json
```

不得修改：

```text
src/**
electron/**
scripts/**
package.json
package-lock.json
electron-builder.config.cjs
任何测试 fixture
```

如果候选包中的非文档文件与仓库不同，立即停止并报告，不要复制。

## 4. 合入前检查

```powershell
Set-Location "G:\Codex\Yang Kura"
git status --short
git branch --show-current
git rev-parse HEAD
git rev-parse origin/main
```

要求：main、HEAD/远端均为 `316d8127d6d423a1d9e6930b8b804a3bac11140e`、工作区 clean。否则停止。禁止 `reset --hard`、`clean -fd`、force push。

## 5. 复制文档

只复制白名单内文件。复制后：

```powershell
git status --short
git diff --stat
git diff --name-only
```

确认 diff 中没有 `src/`、`electron/`、`scripts/`、`package*.json`。

## 6. 验证

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:handoff
npm run verify:stable
npm run lint
npm run build
npm audit --audit-level=high
```

允许 1 个已知 Electron moderate；不允许 high/critical。不运行 `npm audit fix`。

## 7. 安全检查

确认：

- 文档写明 main 已是 MVP129 / `316d8127`。
- Round 6 PASS。
- MVP130 禁止合入。
- 当前阶段是日常使用观察，不自动进入下载器。
- 完整提示词在 `AI_HANDOFF/`；聊天只需短转发词。
- 不包含密钥、真实 library-index、真实媒体路径和用户数据。

## 8. 提交与推送

全部 PASS 后：

```powershell
git add AI_HANDOFF README.md 00_NEW_CHAT_START_HERE.md PROJECT_STATE.md PROJECT_ROADMAP.md NEXT_CHAT_HANDOFF.md RUN_ME_FIRST.md NEW_CHAT_PROMPT.md NEW_CHAT_PROMPT_FULL.md docs/PROJECT_STATE.md docs/NEXT_CHAT_HANDOFF.md docs/RUN_ME_FIRST.md docs/CURRENT_ROADMAP_MVP129.md docs/STABLE_RELEASE_MVP129.md docs/FINAL_GIT_STATUS_MVP129.md FINAL_HANDOFF_MANIFEST.json
git diff --cached --check
git commit -m "docs: finalize MVP129 handoff"
git push origin main
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status --short
```

禁止 force push。

## 9. 输出报告

保存 `ROUND7_FINAL_HANDOFF_REPORT.md`，内容包括：

- 输入 ZIP 与 SHA-256
- 合入前 HEAD/origin/main
- 实际变更文件
- 是否仅文档变化
- verify:handoff / verify:stable / lint / build / audit
- commit 与 push
- 最终 HEAD/origin/main
- 工作区是否 clean
- MVP130 是否仍独立
- 最终 PASS/FAIL

FAIL 时不要推送，列出阻塞原因。
