# NEXT_CHAT_HANDOFF

## 当前状态

```text
Yang-Kura 0.158.0-mvp120
React + Vite + TypeScript + Electron
Local JSON Index 优先，SQLite 后置
GitHub main 当前正式基线：0.146.0-mvp108 / 2e4a4aa
MVP109～MVP113 为待合入 UI 日常化与审计修复整理包
```

## 已完成

```text
真实资源库选择 / 扫描 / index 写读 / UI 显示
本地音频播放
字幕读取
外部打开
播放历史 / 队列 / 歌单 / 封面基础
copy-only 导入完整闭环
move-only 小样本执行闭环
导入器最终回归清单
MVP108 Codex 命令验收与 GitHub main 推送
MVP109～MVP111 主界面日常化 / 去工程面板感
```

## MVP111 本轮重点

```text
UI cleanup closeout + GitHub baseline sync
新增 uiCleanupCloseoutBaselineSyncService
首页新增 mvp111-ui-cleanup-closeout
设置页新增 mvp111-github-baseline-sync
更新 README / PROJECT_STATE / PROJECT_ROADMAP / RUN_ME_FIRST / NEXT_CHAT_HANDOFF
新增 docs/UI_CLEANUP_CLOSEOUT_BASELINE_SYNC_MVP111.md
新增 verify:mvp111-ui-cleanup-closeout-baseline-sync
```

## 当前不要做

```text
不要开下载器
不要开 SQLite
不要开 mpv
不要接联网元数据 Provider
不要做大批量 move
不要自动删除 / 覆盖 / 清理源目录
不要把工程说明重新堆回主界面
```

## 下一步建议

如果准备合入 GitHub：只做命令验收、提交、推送，不让 Codex 做新功能。

合入后建议进入：

```text
Metadata Override / 本地元数据编辑层
```

第一阶段只做本地编辑，不联网抓取。


## MVP112 UI 审计修复

当前整理包版本为 `0.150.0-mvp112`。已根据 Codex GUI 审计修复绝对路径显示、下载页重复 key、切页滚动、导入器首屏、诊断页默认负载和音乐库无障碍问题。GitHub main 的已知正式基线仍需以实际仓库 HEAD 为准。

## MVP113 无障碍标签热修复

当前整理包版本为 `0.151.0-mvp113`。Codex 对 MVP112 复验时确认主要修复均通过，仅剩音乐库与音声库的可访问标签仍包含 MVP76 工程文案。本轮已将其改为“音乐库歌曲列表”“音乐专辑列表”“音声作品列表”，不改布局或真实业务链路。GitHub main 当前仍为 `0.146.0-mvp108 / 2e4a4aa`，待 Codex 复验后统一提交 MVP109～MVP113。

## 最新开发基线

- 当前源码：`0.158.0-mvp120`
- 新能力：ASMR/音乐本地元数据编辑、音乐单项还原、JSON 备份与恢复。
- 下一步：优先做元数据与搜索筛选联动、ASMR 单项还原；再评估单个 RJ Provider 预览。
- 不要回到连续 UI 清理；只修明确 UI bug。

## MVP119

DLsite 单 RJ 查询已增加 10 分钟内存缓存、5 秒同 RJ 节流、手动重新查询、缓存清除和标准 JSON 回退。候选信息仍不自动保存。


## MVP120：DLsite 查询总截止时间热修复

单个 RJ 查询的默认 12 秒现在是整个查询的总预算。最多 6 个候选 URL 共享剩余时间，不再发生 6 × 12 秒的串行等待。
