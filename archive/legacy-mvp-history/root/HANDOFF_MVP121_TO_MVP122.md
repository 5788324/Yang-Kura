# MVP121 → MVP122

MVP122 开始播放器内核增强：Electron main 控制 mpv 子进程，Renderer 保持 tokenized path 边界；mpv 不可用时回退 HTMLAudio。

验证重点：

1. 未安装 mpv 时原有 MP3/FLAC 播放不被阻断。
2. 安装 mpv 后播放模式进入 mpv，并同步进度、时长、暂停、seek。
3. Renderer 不出现 absolutePath / file://。
