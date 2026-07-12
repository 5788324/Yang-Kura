# PLAYER EXPERIENCE MVP-34

## 目标

MVP-34 将播放器从“演示播放器 UI”推进到“日常可用播放器体验”。核心不是大改视觉，而是补足长音频使用需要的结束策略，并减少播放器表层的演示残留。

## 新增文件

```text
src/services/playerExperienceService.ts
scripts/verify-mvp34-player-experience.mjs
docs/CURRENT_ROADMAP_MVP34.md
docs/PLAYER_EXPERIENCE_MVP34.md
```

## 修改文件

```text
src/types.ts
src/hooks/useAudioPlayer.ts
src/App.tsx
src/components/PlayerBar.tsx
src/components/LyricsPanel.tsx
package.json
package-lock.json
README.md
PROJECT_STATE.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
docs/PROJECT_STATE.md
docs/NEXT_CHAT_HANDOFF.md
docs/RUN_ME_FIRST.md
```

## 播放结束策略

新增类型：

```ts
PlaybackCompletionMode = 'continue-queue' | 'stop-after-track' | 'stop-after-work'
```

对应中文：

```text
continue-queue      → 列表续播
stop-after-track    → 播完当前轨停止
stop-after-work     → 播完当前作品停止
```

`stop-after-work` 的判断规则：

1. ASMR / RJ 音轨优先按 `rjId` 判断是否同一作品。
2. 普通音乐按 `artist + album` 判断是否同一专辑。
3. 如果没有可靠作品键，则保守停止。
4. 手动点“下一首”不受此策略限制；策略只影响自动播放结束。

## 播放器文案收口

本轮清理了播放器表层最容易误导的残留：

- `VIP` → `本地`
- 假点赞数 `10W+` → `喜欢`
- `Seek Preview` → `跳转预览`
- `DESKTOP LYRICS SYNCING` → `桌面歌词同步`
- 固定 `无损 Hi-Res FLAC | Stereo | 24bit` → `本地音频 / 字幕同步 / 队列播放`

仍然允许在诊断页和文档中保留工程词。

## 安全边界

MVP-34 不处理真实路径，不解析 `file://`，不修改媒体文件。播放策略只使用已有的 `PlayerState`、队列和 tokenized track 元数据。

## 验证

```bash
npm run lint
npm run verify:mvp34-player-experience
npm run verify:all
npm run build:electron
npm run build
npm audit --audit-level=high
```
