# MVP-31 播放历史与继续播放

## 目标

MVP-31 让 Yang-Kura 在本地保存最近播放记录和播放进度，用于首页“继续播放”和最近播放列表。

## 存储

使用 localStorage：

```text
yang_kura_playback_history_v1
```

保存内容包括：

```text
trackId
title
artist
album
progress
duration
percent
completed
playCount
updatedAt
track snapshot
```

不会保存 `mediaUrl`，不会保存 `file://`，不会保存 absolutePath。

## 恢复规则

```text
进度 < 5 秒：从 0 开始
接近结尾：从 0 开始
已完成：从 0 开始
其他情况：从上次进度继续
```

## 首页行为

首页最近播放优先读取本地播放历史。读取真实 `library-index.json` 后，会用当前 index 中的 Track 替换历史快照，以便重新获得当前 rootPathToken。

## 边界

本轮不做跨设备同步，不写 SQLite，不修改真实媒体文件。
