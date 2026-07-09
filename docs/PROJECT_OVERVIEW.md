# Yang-Kura 项目介绍

## 一句话定位

Yang-Kura 是一个个人本地音频媒体库，用来管理和播放 ASMR/RJ 音声、普通音乐、歌单、字幕和本地资源。

## 产品范围

```text
音声库：RJ / ASMR 作品、音轨、封面、字幕、播放进度
音乐库：普通音乐、专辑、歌曲、歌单、歌词
播放器：本地音频播放、队列、最近播放、字幕面板
导入器：已有资源 copy / 小样本 move 到正式仓库
外部打开：视频、图片、文件、文件管理器定位
```

## 技术路线

```text
React + Vite + TypeScript + Electron
Local JSON Index 优先
SQLite 后置
HTMLAudio 当前播放内核，mpv 后置候选
```

## 当前阶段

```text
0.146.0-mvp108
导入器阶段收尾
暂停新增功能，进入整理审查和小样本人工回归
```

## 已完成核心链路

```text
选择目录 → 扫描 → 写/备份 library-index.json → 读取 index → UI 展示
本地音频播放 → 字幕读取 → 外部打开 → 播放历史 / 队列 / 歌单
已有资源导入 → copy-only 闭环 → move-only 小样本 executor
```

## 个人项目边界

项目不商业、不分享、不作为开源产品运营。安全策略不按企业级/公网级设计，但真实文件操作仍要满足：

```text
预览
确认
备份
日志
不覆盖
不自动删除
失败可追踪
不向 Renderer 暴露 absolutePath / file://
```
