# U38-B 播放器 Controller 与 Backend 边界

## 目标

在不改变用户可见播放行为的前提下，把 `useAudioPlayer.ts` 中的 mpv、HTMLAudio、本地媒体解析和 fallback 副作用集中到独立 Backend Hook。U38-B 不重写播放器内核，也不提前拆字幕。

## 完成结构

- `useAudioPlayer.ts`：播放器 Controller，负责队列操作、播放完成策略、用户操作、会话持久化协调和字幕状态协调。
- `usePlayerBackend.ts`：唯一播放后端副作用边界，负责 HTMLAudio 生命周期、mpv 事件与命令、本地媒体 URL 解析、自动 fallback、Seek、音量、静音、暂停/继续和模拟播放时钟。
- `playerRuntimePolicy.ts`：提供 tokenized local track 类型守卫、Seek 限制和播放起点策略。
- `usePlayerSessionPersistence.ts`：继续独立负责 Queue、History、续播和兼容快照，不重新并入 Backend。

## 依赖方向

```text
UI / App
  -> useAudioPlayer Controller
      -> playerQueueTransitions
      -> usePlayerSessionPersistence
      -> usePlayerBackend
          -> mpv preload API
          -> HTMLAudio
          -> media URL resolver
      -> subtitle loader（U38-C 待拆）
```

Controller 不得直接创建 `Audio`，不得直接调用 mpv start/command/event 或媒体 URL 解析接口。Backend 不负责 Queue/History 持久化，也不读取播放历史决定下一首。

## 行为冻结

- mpv 自动优先和“仅 HTMLAudio”用户偏好保持不变。
- mpv 启动失败或运行中断后切换 HTMLAudio，并从原续播点继续。
- Seek 必须限制到有效时长；音量、静音、暂停和继续同步到当前后端。
- loop-one、继续队列、播完停止和播完当前作品策略保持不变。
- Queue、History、续播、兼容快照和重启重新授权行为保持不变。
- LRC、SRT、VTT、ASS 与双语字幕仍由现有 Controller 协调，留待 U38-C。
- Renderer 不持久化当前窗口 root token、临时 media URL 或 tokenized cover URL。

## 自动验收

- TypeScript、Renderer 和 Electron 构建。
- U29 Electron E2E：真实后端、Seek、暂停、Queue、四种字幕、重启、重新授权、续播、上一首和下一首。
- U38-B verifier：Controller 不再持有后端副作用，Backend Hook 保留完整 fallback 契约。
- U28～U32 current E2E/视觉/事务链、stable regression 和最终生产构建。
- portable、NSIS、安装、重复安装、卸载、数据保留和页面完整性。

## 下一步

U38-C 拆分 Subtitle loader 与字幕状态更新；不得修改已经通过 U29 的播放后端、fallback、Queue、History 或续播行为。
