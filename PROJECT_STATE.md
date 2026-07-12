# PROJECT_STATE

## 当前状态

```text
版本：0.167.0-mvp129
状态：稳定主线，已合入并推送 GitHub main
GitHub main：316d8127d6d423a1d9e6930b8b804a3bac11140e
HEAD = origin/main：是
Round 6 最终 Git 合入：PASS
MVP130：实验性下载器，独立封存，禁止合入
MVP131：未开始
```

## 发布与验收

- `verify:stable`：PASS。
- Windows mpv fixture：PASS。
- Electron 严格 smoke：PASS。
- portable 构建与实际启动：PASS，无黑屏。
- NSIS installer 构建、安装、启动、卸载：PASS。
- 卸载后安装目录移除；用户 `%APPDATA%\Yang-Kura` 按配置保留。
- Yang Kura / Electron 残留进程：0。
- 依赖审计：0 high/critical；1 Electron moderate 非阻塞项。
- Git 工作区：Round 6 报告中为 clean。

## 已完成主线

1. Electron 桌面壳、目录选择和安全 token 边界。
2. 本地扫描、Local JSON Index 写入/备份/读取。
3. 音声库、音乐库、详情、歌单、队列和播放历史。
4. HTMLAudio、mpv 后端、fallback、Seek 合并和进程回收。
5. LRC/SRT/VTT/ASS 字幕与外部文件打开。
6. copy-only 完整导入闭环和 move-only 小样本闭环。
7. 本地元数据编辑、备份/恢复和单 RJ DLsite Provider。
8. 50,000 曲目生成数据性能基准。
9. 缺失文件检查、受控索引清理、备份恢复和维护历史。
10. Windows portable / installer 发布链。
11. 依赖精简、稳定回归链和 476 份历史资料归档。

## 当前阶段

先进行真实日常使用观察，只修明确 Bug。不要根据旧待办表自动进入下载器、SQLite 或大重构。

仍需长期观察：真实多小时播放、真实超大媒体库、named-pipe 长期稳定性。当前 50,000 曲目为生成数据基准。

## 历史阶段说明

`MVP129 稳定候选`阶段已经结束；当前状态是已合入 GitHub main 的 MVP129 稳定主线。
