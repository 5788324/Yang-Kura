# MVP-60 — Beta 0.1 候选包最终整理

Version: `0.98.0-mvp60`

## Goal

MVP-60 将 Yang-Kura 当前阶段整理为 **个人可用 Beta 0.1 候选包**。

本轮只做候选包收口，不新增真实后端能力。

## Added files

- `src/services/betaCandidateCloseoutService.ts`
- `docs/CURRENT_ROADMAP_MVP60.md`
- `docs/BETA_CANDIDATE_CLOSEOUT_MVP60.md`
- `scripts/verify-mvp60-beta-candidate-closeout.mjs`
- `HANDOFF_MVP59_TO_MVP60.md`
- `PACKAGE_MANIFEST_MVP60_HANDOFF.txt`

## UI anchors

- `mvp60-beta-candidate-summary`
- `mvp60-beta-candidate-closeout`

## Service model

`betaCandidateCloseoutService` provides:

- About page candidate summary
- Candidate package use flow
- Diagnostics candidate checklist
- Current safety boundary
- Postponed features
- Next-step options

## Candidate package manual regression

Recommended manual path:

1. 启动应用。
2. 选择资源库或重新选择上次资源库。
3. 读取已有 `library-index.json`，或按设置页流程生成记录。
4. 回到首页 / 音声库 / 音乐库选择音轨。
5. 检查播放、字幕、队列、继续听。
6. 检查视频、图片、文件夹外部打开。
7. 检查设置页 / 诊断页是否仍然中文、清楚、不过度暴露工程信息。

## Safety boundary

MVP-60 keeps the following boundaries:

- 不删除 / 移动 / 重命名真实媒体文件
- Renderer 不接收 `absolutePath`
- Renderer 不接收 `file://`
- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv 后端
- 不做高级文件整理
- 不做大组件一次性拆分

## Verification

Run:

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```
