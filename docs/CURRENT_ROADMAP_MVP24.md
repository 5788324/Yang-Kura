# Yang-Kura 当前路线：MVP-24

当前版本：`0.62.0-mvp24`

## 当前主线

```text
React + Vite + TypeScript
Electron 桌面壳
Local JSON Index 优先
SQLite 后置
中文本地音频媒体库
```

## 已完成闭环

```text
选择目录
→ rootPathToken
→ 只读 dry-run 扫描
→ write-index preview
→ 用户确认写入 library-index.json
→ 读取 library-index.json
→ 映射到音声库 / 音乐库 UI
```

## 当前真实能力

| 能力 | 状态 |
|---|---|
| Electron 目录选择 | 已有 |
| root token 化 | 已有 |
| 只读 dry-run 扫描 | 已有 |
| 写入 library-index.json | 已有 |
| 读取 library-index.json | 已有 |
| UI 显示真实 index | 起步完成 |
| 真实音频播放 | 未做 |
| LRC 正文读取 | 未做 |
| SQLite | 后置 |
| Windows 打包 | 后置 |

## UI 策略

主界面要继续向媒体播放器靠拢：

```text
首页：继续播放 / 最近播放 / 最近加入 / 歌单
播放器：参考网易云黑胶、歌词、沉浸背景、底部控制栏
音声库：作品封面墙 + RJ 信息 + 字幕/进度状态
音乐库：专辑墙 + 歌曲列表
诊断页：集中所有 Scanner / IPC / Contract / Dry-run 信息
```

## 下一轮建议

MVP-25：本地音频播放 MVP。

建议合并任务：

```text
1. 设计 rootPathToken + relativePath 的播放请求
2. Electron main 生成受控媒体 URL 或读取策略
3. HTMLAudio adapter 播放 mp3 / wav / flac / m4a
4. 播放失败提示
5. 进度先写 localStorage，不写 SQLite
```
