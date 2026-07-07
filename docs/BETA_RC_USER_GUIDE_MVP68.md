# MVP-68 — Beta 0.1 RC 使用说明 / 打包说明 / 诊断页折叠计划

版本：`0.106.0-mvp68`

## 已确认真实链路

用户本机已确认：

1. 选择音声库目录。
2. 一键扫描并应用。
3. 音频可播放。
4. 歌词可读取。
5. 图片可打开。
6. 视频可打开。

## 首次使用流程

1. 启动 Yang-Kura。
2. 设置页选择音声库目录或音乐库目录。
3. 第一次使用或资源变化后，点击一键扫描并应用。
4. 回到音声库 / 音乐库。
5. 播放音频；歌词为空时显示明确空状态。
6. 图片 / 视频走系统外部打开。

## 本机验证 / 打包前检查

推荐命令：

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

Node 环境建议：Node 22.x / npm 10.x。

## 诊断页为什么多

诊断页现在承担：

- 回归看板。
- 本地安全边界说明。
- Electron / 打包验证状态。
- 历史 MVP verifier marker。
- 开发阶段错误定位。

因此 Beta 0.1 前继续保留。后续计划折叠为：

- 日常检查。
- 资源库状态。
- 播放与字幕。
- 本地安全边界。
- 开发者详情。
- 历史验证。

## 安全边界

继续保持：

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath 或 file://。
- 不改真实扫描 / 写 index / 播放内核链路。
