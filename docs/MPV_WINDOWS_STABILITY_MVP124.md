# MVP124 mpv Windows 播放稳定性

版本：`0.162.0-mvp124`

## 本轮目标

把 MVP122/MVP123 的 mpv 最小后端推进到可长期验证的稳定性基线：

- 长音频 seek 合并与边界限制。
- mpv 运行中断后请求 HTMLAudio fallback。
- 应用退出前等待 mpv 进程回收。
- 用户可选择“优先 mpv”或“仅 HTMLAudio”。
- 设置页提供最小运行诊断，不显示真实路径。

## 长音频 seek

快速拖动进度条时，不把每一个中间位置都发送给 mpv。后端在 50ms 窗口内只发送最后一个位置，并使用：

```text
seek <seconds> absolute+exact
```

位置会限制在 `0..duration`；未取得 duration 时保留 30 天硬上限，避免异常数字进入播放器。

## 运行失败回退

mpv 进程意外退出、IPC 断开或 seek 失败时，Electron main 发出 `fallback-requested`，包含最后已知播放位置。Renderer 使用同一 tokenized track 从该位置启动 HTMLAudio，并显示非致命“播放提示”。

## 进程退出回收

应用退出时：

```text
发送 quit
→ 等待 700ms
→ 未退出则 terminate
→ 非 Windows 最后允许 SIGKILL
→ 再退出 Electron
```

不使用 shell 字符串或 `exec()`。

## 后端偏好

设置页支持：

- 优先 mpv，失败自动回退。
- 仅使用 HTMLAudio。

偏好只包含枚举值，保存在 Renderer localStorage；不包含媒体路径或 mpv 安装路径。

## 边界

- Renderer 不接收 absolutePath / file://。
- 不修改媒体文件。
- 不接 SQLite。
- 不移除 HTMLAudio fallback。
- 不自动下载或捆绑 mpv。
