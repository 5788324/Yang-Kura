> 当前开发版本：`0.158.0-mvp120`

# Yang-Kura

Yang-Kura 是一个**个人本地音频媒体库**，面向 Windows 桌面端，支持 ASMR/RJ 音声库与普通音乐库。项目不面向商业、不对外发布、不作为开源产品运营；开发优先级是个人可用、数据可回退、AI 易维护。

## 当前状态

```text
当前源码包：0.158.0-mvp120
阶段：单个 RJ Provider 缓存与节流收口
GitHub main 正式基线：0.146.0-mvp108 / 2e4a4aa
技术栈：React + Vite + TypeScript + Electron
数据路线：Local JSON Index 优先，SQLite 后置
```

MVP108 已完成导入器收尾并合入 GitHub main。MVP109～MVP113 完成 UI 审计修复；MVP114～MVP117 完成本地元数据编辑、备份恢复和单 RJ 差异预览；MVP118～MVP119 接入 DLsite 单 RJ 查询、短期缓存与节流。

## 已完成主链路

```text
选择本地目录
→ dry-run 扫描
→ 写入 / 备份 library-index.json
→ 读取 index 到音声库 / 音乐库
→ 本地音频播放
→ LRC / SRT / VTT / ASS 字幕读取
→ 图片 / 视频 / 文件外部打开
→ Windows portable / installer 打包基础
→ 播放历史 / 队列 / 歌单 / 封面基础
→ copy-only 导入闭环
→ move-only 小样本执行闭环
→ 导入器最终回归清单
→ 主界面日常化收口
→ ASMR / 音乐本地元数据编辑与备份恢复
```

## 导入器状态

| 链路 | 状态 | 说明 |
|---|---|---|
| copy-only | 已闭环 | 推荐日常方式；copy、OperationLog、post-copy refresh、index patch、backup、UI refresh 已收口。 |
| move-only | 小样本闭环 | 支持小样本受控 move；必须二次确认、禁止覆盖、失败停止、写日志；不建议直接放开大批量。 |
| MVP108 验收 | PASS | Codex 已完成命令验收、smoke test、GitHub main 推送。 |
| UI | 已简化 | 主页面保留日常入口；工程说明折叠到 AI 维护区 / 诊断页。 |

## 当前不做

```text
不接 SQLite
不接真实下载器
不做全库自动元数据抓取
不接 mpv 后端
不做大批量 move
不做自动删除 / 自动覆盖 / 自动清理源目录
不向 Renderer 暴露 absolutePath / file://
```

## 推荐命令

```bash
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache .npm-cache
npm run lint
npm run build:electron
npm run verify:mvp108-importer-final-regression-checklist
npm run verify:mvp109-ui-engineering-panel-cleanup
npm run verify:mvp110-global-daily-ui-cleanup
npm run verify:mvp111-ui-cleanup-closeout-baseline-sync
npm run verify:mvp112-ui-audit-bugfix
npm run verify:mvp113-accessibility-label-hotfix
npm run verify:mvp114-local-metadata-overrides
npm run verify:mvp115-music-metadata-management
npm run verify:mvp116-metadata-search-restore-preview
npm run verify:mvp117-single-rj-provider-preview
npm run verify:mvp118-dlsite-single-rj-provider
npm run verify:mvp119-provider-cache-throttle
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

## 文档入口

| 文档 | 用途 |
|---|---|
| `PROJECT_STATE.md` | 当前状态。 |
| `PROJECT_ROADMAP.md` | 后续规划。 |
| `RUN_ME_FIRST.md` | 新对话 / 新机器开工前先读。 |
| `NEXT_CHAT_HANDOFF.md` | 下一轮接手摘要。 |
| `docs/PROJECT_OVERVIEW.md` | 项目介绍文档。 |
| `docs/UI_CLEANUP_CLOSEOUT_BASELINE_SYNC_MVP111.md` | MVP111 收口说明。 |

## 关于历史文件

仓库根目录仍保留大量 `HANDOFF_MVPxx_TO_MVPxx.md` 和 `PACKAGE_MANIFEST_MVPxx_HANDOFF.txt`。它们主要服务旧 verifier 与 AI 维护，不是日常阅读入口。不要手动阅读全部历史文件；优先读上面的文档入口。


## MVP112 UI 审计修复

当前整理包版本为 `0.150.0-mvp112`。已根据 Codex GUI 审计修复绝对路径显示、下载页重复 key、切页滚动、导入器首屏、诊断页默认负载和音乐库无障碍问题。GitHub main 的已知正式基线仍需以实际仓库 HEAD 为准。

## MVP113 无障碍标签热修复

当前整理包版本为 `0.151.0-mvp113`。Codex 对 MVP112 复验时确认主要修复均通过，仅剩音乐库与音声库的可访问标签仍包含 MVP76 工程文案。本轮已将其改为“音乐库歌曲列表”“音乐专辑列表”“音声作品列表”，不改布局或真实业务链路。GitHub main 当前仍为 `0.146.0-mvp108 / 2e4a4aa`，待 Codex 复验后统一提交 MVP109～MVP113。

## MVP114：本地元数据覆盖

当前版本 `0.152.0-mvp114` 开始本地元数据管理。音声详情页的人工修改保存到独立版本化覆盖层，重新扫描或重新读取 `library-index.json` 后仍会应用；不会修改真实音频标签，不联网，不接 SQLite。

## MVP117 单个 RJ Provider 预览

- 本地元数据第一阶段已收口。
- 支持粘贴标准化单个 RJ JSON 查询结果并预览字段差异。
- 候选信息只能手动填入编辑表单，仍需用户点击保存。
- 当前不联网、不自动覆盖、不写媒体文件标签。
## MVP118：DLsite 单个 RJ 查询

Electron 桌面端可对当前作品执行一次 DLsite 查询。候选信息先进入差异预览，只有用户手动填入并再次保存后才进入本地覆盖层。当前环境无法访问外网，在线结果仍需 Windows 桌面快检。

## MVP119：Provider 缓存与节流

DLsite 单 RJ 查询增加 10 分钟 Electron 内存缓存与 5 秒同 RJ 请求节流。页面支持优先缓存、手动重新查询、最近查询时间、缓存清除和联网失败后的标准 JSON 回退。候选信息仍不会自动写入本地元数据。


## MVP120：DLsite 查询总截止时间热修复

单个 RJ 查询的默认 12 秒现在是整个查询的总预算。最多 6 个候选 URL 共享剩余时间，不再发生 6 × 12 秒的串行等待。
