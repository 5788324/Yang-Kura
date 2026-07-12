# MVP123 mpv 路径设置、安装检测与 Windows 小样本工具

版本：`0.161.0-mvp123`

## 用户功能

设置页新增“播放后端”：

- 检测 mpv 是否可用。
- 显示检测来源、可执行文件名、版本和当前运行状态。
- 通过系统文件选择器选择 `mpv.exe`。
- 清除手动选择，恢复环境变量或系统 PATH 检测。
- mpv 不可用时明确显示 HTMLAudio fallback。

## 路径与隐私

- 真实 mpv 路径只保存在 Electron main 的 `userData/mpv-settings.json`。
- Renderer 只收到文件名、来源、版本和可用状态。
- 不返回 absolutePath 或 file://。
- `YANG_KURA_MPV_PATH` 的优先级高于手动选择。

## 检测方式

Electron main 使用参数数组执行：

```text
mpv --version
```

不使用 shell 字符串拼接。检测超时为 4 秒。

## Windows 小样本验证

只检查 mpv：

```powershell
npm run test:mpv:windows
```

指定 mpv 和一条小音频：

```powershell
$env:YANG_KURA_MPV_PATH = "C:\Tools\mpv\mpv.exe"
$env:YANG_KURA_MPV_TEST_AUDIO = "C:\Temp\sample.mp3"
npm run test:mpv:windows
```

样本测试只进行 0.5 秒 `--ao=null` 无声解码，不修改媒体文件。输出只显示文件名，不打印真实绝对路径。

## 边界

- 不自动下载 mpv。
- 不捆绑第三方二进制。
- 不修改媒体文件。
- 不改变 HTMLAudio fallback。
- 不接 SQLite。
