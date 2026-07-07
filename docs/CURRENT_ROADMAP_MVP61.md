# CURRENT_ROADMAP_MVP61

## 版本

`0.99.0-mvp61`

## 本轮目标

MVP-61 只处理 MVP-60 本机 Codex 回归报告暴露的启动与验收阻塞，不新增播放器能力。

## 处理范围

- 新增 `npm run dev:electron`，作为 `npm run desktop:dev` 的兼容入口。
- 新增 `npm run desktop:setup`，用于 GUI 回归前安装 / 修复 Electron binary。
- 新增 `npm run desktop:smoke-check:strict`，通过 `electron --version` 检查 Electron CLI 是否真正可启动。
- 强化 `scripts/desktop-smoke-check.mjs`：默认 advisory，严格模式可失败。
- 修正 `scripts/run-electron-dev.mjs` / `scripts/run-electron-preview.mjs` 的本机提示。
- 继续要求 Node 22 LTS / npm 10.x，不为 Node 24 / npm 11 放宽正式验证。
- 复核 `libraryIndexAdapter.ts` 中 `collection.folderPath` 的展示边界，过滤盘符绝对路径与 `file://`。
- 新增设置页 / 诊断页 MVP-61 本机回归收口说明。

## 不做

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv 后端。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不让 Renderer 接收 `absolutePath` 或 `file://`。
- 不改真实扫描链路。
- 不改写 index 逻辑。
- 不改播放内核。
- 不做大组件一次性拆分。

## 下一步

MVP-61 后应让 Codex 在 Node 22 / npm 10 环境重新执行本机 GUI 回归：

```bash
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```
