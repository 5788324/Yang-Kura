# U38-A 播放器会话边界

## 目标

在不改变 mpv、HTMLAudio fallback、续播、字幕、队列和完成策略行为的前提下，将 `useAudioPlayer.ts` 中的 Queue、History 与 Persistence 职责拆出。

## 完成内容

- `playerQueueTransitions.ts`：负责上一首、下一首、随机、开始新队列和去重加入队列的纯状态转换。
- `usePlayerSessionPersistence.ts`：负责队列快照、播放历史、续播点、旧 `last_played_*` 兼容键和节流写入。
- `useAudioPlayer.ts`：继续协调播放后端与 UI 状态，但不直接依赖 Queue/History 持久化服务。
- 旧兼容续播快照改用 `sanitizePersistedPlayerTrack`，不持久化窗口级 `rootPathToken`、`mediaUrl` 或 tokenized cover URL。
- U29 Electron E2E 增加队列、历史和旧兼容快照的数据安全断言。

## 行为冻结

- 上一首、下一首和 shuffle 的索引规则保持不变。
- 新播放队列、重复加入队列和空队列首项行为保持不变。
- 续播阈值、完成判定、5 秒进度差和 5 秒写入间隔保持不变。
- 重启后必须重新授权资源库并读取 Index，持久化层不得保存窗口级 token。
- mpv、HTMLAudio fallback、字幕读取和完成策略不在本轮重写。

## 验收

- TypeScript 与生产构建通过。
- U29 Electron E2E 验证播放、Seek、队列、四种字幕、重启、重新授权、续播、上一首和下一首。
- U29 同时验证 Queue、History 和旧兼容快照均不泄露 token 或媒体 URL。
- `verify:u38a-player-session-boundaries` 验证职责边界和文档事实。

## 下一步

U38-B 拆分 Player Controller 与 mpv / HTMLAudio Backend 协调；不得改变现有 fallback 与真实播放行为。
