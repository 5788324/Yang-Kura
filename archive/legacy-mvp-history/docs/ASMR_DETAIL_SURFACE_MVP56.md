# MVP-56 — 音声详情页摘要模型抽离

Version: `0.94.0-mvp56`

## 目标

本轮对音声详情页做低风险结构清理：

```text
先抽 service
先收口文案
不一次性拆 AsmrDetail.tsx
不破坏播放 / 字幕 / 队列 / 资源库链路
```

## 新增锚点

- `mvp56-asmr-detail-summary`
- `mvp56-asmr-track-summary`
- `mvp56-asmr-detail-surface-review`

## 新增服务

```text
src/services/asmrDetailSurfaceService.ts
```

该服务集中提供：

- 作品听音摘要
- 音轨列表状态
- 本地记录 / 资源库记录文案
- 字幕状态标签
- 诊断页收口模型
- 本轮安全边界和后置项

## UI 收口

音声详情页现在优先显示：

- 音轨数量
- 总时长
- 本地资源状态
- 字幕状态
- 已听完 / 未听完
- 本地记录

并继续把真实扫描、路径解析、写入 index、技术状态放在设置高级区或诊断页。

## 路径表达收口

已避免继续使用默认 `F:\ASMR\...` 示例。

主界面表述改为：

```text
资源库记录
本地记录
<资源库记录>/RJ...
```

而不是：

```text
文件路径
物理路径
真实绝对路径
```

## 安全边界

本轮没有做：

- SQLite
- 下载器
- 元数据抓取
- mpv
- 真实扫描链路改动
- index 写入 / 读取链路改动
- 播放内核改动
- 字幕读取链路改动
- 打包逻辑改动
- 删除 / 移动 / 重命名真实媒体文件
- Renderer 暴露 `absolutePath` 或 `file://`
- AsmrDetail 一次性大拆分

## 后置

- 音轨行组件拆分
- 作品信息表拆分
- 详情页右侧栏更细视觉 polish
- 下载器
- SQLite
- mpv 后端

## 明确不接

- 不接 SQLite
- 不接下载器
- 不接元数据抓取
- 不接 mpv
- 不删除 / 移动 / 重命名真实媒体文件
