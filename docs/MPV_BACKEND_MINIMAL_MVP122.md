# MVP122 mpv 播放后端最小闭环

版本：`0.160.0-mvp122`

## 目标

- Electron main 侧启动一个受控 mpv 子进程。
- Renderer 只发送 `rootPathToken + relativePath + trackId`。
- 支持播放、暂停、恢复、seek、停止、音量和静音。
- mpv 启动失败或未安装时自动回退现有 HTMLAudio fallback。
- 不向 Renderer 返回 absolutePath 或 file://。

## 可执行文件

默认查找：

- Windows：`mpv.exe`（PATH）
- 其他平台：`mpv`（PATH）

也可通过环境变量指定：

```text
YANG_KURA_MPV_PATH=C:\Tools\mpv\mpv.exe
```

MVP122 不捆绑或下载 mpv。

## 安全边界

- 只接受用户已授权 `rootPathToken` 下的已识别音频相对路径。
- 使用 `spawn(executable, args)`，不使用 shell 命令拼接。
- mpv 的真实文件路径只在 Electron main 内部使用。
- 不修改、移动、删除或重命名媒体文件。
- 不写音频标签，不接 SQLite。

## 后续

MVP122 是最小后端，不包含：

- 自动下载 mpv
- 播放器设置页选择可执行文件
- 系统媒体控制
- 音频设备切换
- 均衡器/音效
- 视频内嵌播放
