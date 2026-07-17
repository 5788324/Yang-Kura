# U38-C 播放器字幕加载与状态边界

## 目标

在不改变播放器后端、队列、续播和现有字幕显示行为的前提下，将字幕请求生命周期、结果归一和当前曲目/Queue 状态同步从 `useAudioPlayer.ts` 移入独立 Hook。

## 完成结构

- `useAudioPlayer.ts`：继续负责播放器 Controller、队列操作、播放完成策略和用户操作。
- `usePlayerBackend.ts`：继续负责 HTMLAudio、mpv、媒体解析和 fallback。
- `usePlayerSessionPersistence.ts`：继续负责 Queue、History、续播和兼容快照。
- `usePlayerSubtitles.ts`：负责字幕请求代次、过期结果丢弃、来源变更重载、格式结果映射，以及当前曲目和 Queue 的字幕状态同步。

## 关键行为

- 切换曲目、重新授权资源库或字幕来源列表变化时，旧请求立即失效。
- 过期 Promise 即使稍后返回，也不能覆盖当前曲目的字幕。
- 开始新请求时清除旧歌词和旧来源，避免同一音轨重新绑定字幕后继续显示旧内容。
- LRC、SRT、VTT、ASS 继续由 Electron 侧统一归一为 LRC 行。
- `loaded`、`missing`、`error` 状态通过同一映射函数生成。
- 当前曲目和 Queue 中同 ID 音轨保持一致。
- Renderer 不新增 absolutePath、`file://` 或临时媒体路径持久化。

## 快速验证策略

普通播放器 Renderer Hook 改动使用 `Player Fast Validation`：

```text
TypeScript
→ Renderer/Electron build
→ U38-C 定向 verifier
→ U29 播放器 Electron E2E
```

portable、NSIS、安装和卸载只在 Electron Main、安装器、依赖、打包配置或正式发布发生变化时运行。

## 后续原则

U38 播放器连续结构治理到此收口。后续优先真实 Bug、字幕实际体验、UI 和用户可感知功能，不再为了目录整齐继续拆分播放器。
