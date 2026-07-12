# HANDOFF MVP122 → MVP123

MVP123 在 MVP122 mpv 最小播放链路上增加：

1. Electron main 私有保存 mpv 可执行文件路径。
2. 设置页选择、检测、清除 mpv。
3. 显示来源、版本、运行和 HTMLAudio fallback 状态。
4. `test:mpv:windows` 只读小样本验证工具。
5. 不向 Renderer 返回绝对路径。

下一轮不应重新设计播放器；应直接处理 Windows 实机播放稳定性和进程生命周期。
