# MVP125 播放器验收辅助与状态同步收口

## 目标

将真实 Windows mpv 验收所需的进度恢复、暂停/跳转、队列切歌和退出残留检查合并为一个只读命令。

## 命令

```powershell
$env:YANG_KURA_MPV_PATH = "C:\Tools\mpv\mpv.exe"
$env:YANG_KURA_MPV_TEST_AUDIO = "C:\Temp\sample-1.mp3"
$env:YANG_KURA_MPV_TEST_AUDIO_2 = "C:\Temp\sample-2.mp3" # 可选，验证队列切歌
$env:YANG_KURA_MPV_TEST_RESUME_SECONDS = "10" # 可选，验证进度恢复
npm run test:mpv:acceptance
```

## 验证内容

- 真实 mpv 启动和 ready/time 事件。
- 进度恢复、暂停、恢复和精确 seek。
- 可选第二音频的队列切歌与 activeTrackId 同步。
- dispose 后 mpv 进程、IPC 和活动音轨均被回收。

## 安全边界

- 只读取用户显式指定的小样本。
- 不扫描资源库。
- 不修改、移动、删除或重命名媒体文件。
- 输出只显示文件名，不打印真实目录。
- 未提供测试音频时安全跳过。
