# MVP-69 · Beta 0.1 Release Candidate 整包确认

## 目标

把 Yang-Kura 当前阶段固定为 **Beta 0.1 Release Candidate**。

本轮基于用户本机真实样本确认：选择音声库目录 → 一键扫描并应用 → 音频、歌词、图片、视频均可播放或打开。

## RC 能力边界

当前 RC 能力包括：

- Local JSON Index 数据层
- 选择资源库目录
- dry-run 扫描
- 一键扫描并应用
- 写入 / 备份 `library-index.json`
- 音声库 / 音乐库读取 index
- 本地音频播放
- LRC / SRT / VTT / ASS 字幕读取或空状态
- 图片 / 视频 / 文件夹外部打开
- 播放历史 / 继续播放
- 队列 / 歌单持久化
- 本地封面显示
- 设置页日常流程
- 诊断页回归与安全边界说明

## 已知非阻塞项

- Electron moderate advisory 仍存在，但 `npm audit --audit-level=high` 通过。
- Vite chunk size warning 仍存在，不阻塞 Beta 0.1 RC。
- 诊断页内容较多，这是开发阶段用于回归、安全边界和历史 verifier 的正常现象。
- 普通 `desktop:smoke-check` 在未运行 `desktop:setup` 前可能显示 Electron WARN，这是 advisory，不是源码失败。

## 推荐验证命令

```bash
node -v
npm -v
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

## 冻结边界

MVP-69 后不应直接进入：

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv 后端
- 删除 / 移动 / 重命名真实媒体文件
- Renderer 暴露 `absolutePath` 或 `file://`
- 改真实扫描 / 写 index / 播放内核链路
- 大组件一次性拆分

## 后续推进

下一步优先做：

1. Beta 0.1 RC 可用包确认。
2. 用户真实样本缺陷小修。
3. Beta 0.1 发布说明。
4. Beta 0.1 后再做诊断页折叠和体验增强。
