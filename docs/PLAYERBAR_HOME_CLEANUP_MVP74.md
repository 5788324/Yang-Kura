# MVP-74 播放器底栏 / 首页日常入口收口

版本：`0.112.0-mvp74`

## 目标

MVP-71 到 MVP-73 已经把主界面、设置页、诊断页和播放器大页逐步从工程面板收成日常软件。MVP-74 继续处理两个仍然偏拥挤的位置：

1. 底部播放器状态过多。
2. 首页存在多个阶段性入口区块，信息重复。

## 本轮 UI 原则

```text
用户每天看到的界面只放听音频需要的内容。
工程、verifier、MVP 历史、Electron、IPC、Scanner、Contract 信息继续后置到诊断页或 sr-only marker。
```

## 底部播放器处理

可见区域保留：

- 当前封面
- 当前音轨标题
- 作者 / 社团 / 专辑
- 播放 / 暂停
- 上一首 / 下一首
- 队列
- 喜欢
- 收藏到歌单
- 歌词浮窗
- 音量
- 播放结束策略

可见区域压缩：

- 不再显示多组旧状态 chip。
- 不再把 Beta / Regression / Compact Line 作为可见信息。
- 旧 marker 不删除，只后置为 `sr-only`。

新增 marker：

```text
mvp74-playerbar-daily-control-strip
mvp74-playerbar-maintenance-markers
```

## 首页处理

首页继续突出：

- 继续播放
- 最近播放
- 最近加入
- 音声库入口
- 音乐库入口
- 歌单入口
- 资源库状态入口

后置为隐藏维护信息：

- `mvp59-home-beta-polish`
- `mvp39-media-overview`

新增 marker：

```text
mvp74-home-daily-entry-cleanup
mvp74-home-maintenance-markers
```

## 本轮未做

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 absolutePath
- 不向 Renderer 暴露 file://
- 不改真实扫描 / 写 index / 播放内核链路
