# MVP123 → MVP124 交接

## 版本

`0.162.0-mvp124`

## 新增

- mpv 快速 seek 合并，只发送最终位置。
- 长音频 seek 限制和正确的 `absolute+exact` 参数。
- mpv 意外退出 / IPC 断开后的 HTMLAudio fallback 请求。
- Electron 退出前异步回收 mpv 进程。
- “优先 mpv / 仅 HTMLAudio”偏好。
- 播放提示与设置页最小稳定性诊断。
- 假 mpv 长音频、退出回收和崩溃回退测试。

## 未做

- 未捆绑真实 mpv。
- 未在 Windows 音频设备上人工播放。
- 未修改真实媒体文件。
- 未接 SQLite 或下载器。
