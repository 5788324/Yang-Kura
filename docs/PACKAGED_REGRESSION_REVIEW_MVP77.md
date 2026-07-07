# MVP-77 — 打包版回归验收清单 / UI 布局审查

Current version: `0.115.0-mvp77`

## 目标

MVP-77 不新增真实能力，目标是让 MVP71～MVP76 的 UI 收口有一份可交给用户、Codex 或 DeepSeek 的回归验收清单。

## 机器验证

建议运行：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp77-packaged-regression-review
npm run build
npm audit --audit-level=high
```

如果 `npm run verify:all` 在当前环境超时，记录超时点，不要乱改；按阶段分段补跑后半段 verifier。

## 人工验收主链路

回住所后优先验证：

```text
选择音声库目录
→ 一键扫描并应用
→ 音声库 / 音乐库显示真实资源
→ 音频播放
→ 歌词 / 字幕显示
→ 图片 / 视频 / 文件外部打开
```

## UI 布局检查

- 首页：继续播放、最近播放、最近加入、音声库、音乐库、歌单入口优先。
- 播放栏：进度条不越界、不 NaN；按钮不拥挤；状态 chip 不压缩主操作。
- 音声库：卡片列宽安全，封面保持正方形，长标题两行截断。
- 音乐库：歌曲行窄屏换行，按钮不挤压标题；专辑卡底部信息稳定。
- 诊断页：MVP 历史、verifier、Contract、IPC、Scanner 信息默认折叠。

## 安全边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 absolutePath。
- 不向 Renderer 暴露 file://。
- 不改真实扫描 / 写 index / 播放内核链路。
