# CURRENT_ROADMAP_MVP72

```text
version: 0.110.0-mvp72
阶段：Beta 0.1 后 UI 日常化收口
基线：MVP-71 / 0.109.0-mvp71
```

## 本轮目标

MVP-72 继续加快收口主界面：在 MVP-71 已经把工程信息后置的基础上，把可见文案进一步改成正常媒体库语言。

## 完成内容

```text
1. 首页日常入口继续保留，但可见标签不再显示 MVP 阶段名。
2. 设置页日常区改成“设置页精简”，突出资源库入口和个人使用流程。
3. 诊断页新增“日常诊断”摘要，普通用户优先看健康状况、资源库扫描、命名检查、文件状态、重复资源。
4. AI 维护区、开发者合同、MVP 历史、verifier marker 继续默认折叠。
5. 新增 dailySurfaceCleanupService，集中描述日常界面和维护区分层规则。
6. 更新 README / PROJECT_STATE / NEXT_CHAT_HANDOFF / RUN_ME_FIRST。
```

## 下一步

```text
MVP-73：播放器大页视觉继续精修 / 黑胶与歌词页媒体感增强。
MVP-74：首页重复入口清理与最近播放卡片继续减法。
MVP-75：诊断页 MVP 历史按阶段分组折叠。
回住所后：推送 MVP70 / MVP71 / MVP72 到 GitHub。
```

## 安全边界

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```
