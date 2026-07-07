# HANDOFF_MVP60_TO_MVP61

## 当前版本

`0.99.0-mvp61`

## 本轮完成

MVP-61 根据 MVP-60 本机 Codex 报告处理回归阻塞：

- 新增 `dev:electron` alias，解决提示词中脚本不存在的问题。
- 新增 `desktop:setup`，明确 GUI 回归前需要安装 / 修复 Electron binary。
- 新增 `desktop:smoke-check:strict`，检查 Electron CLI 是否能执行 `--version`。
- 强化 `desktop-smoke-check.mjs`，默认 advisory，严格模式可失败。
- 更新桌面启动脚本错误提示，指向 `desktop:setup` 和空闲端口策略。
- 保持 Node 22 / npm 10 正式门禁，不放宽到 Node 24。
- 过滤 `collection.folderPath` 的绝对路径与 `file://` 展示。
- 设置页 / 诊断页增加 MVP-61 本机回归收口说明。

## 下轮建议

让 Codex 在 Node 22 / npm 10 环境重新执行 GUI 回归：

```bash
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

如果 GUI 通过，再决定是否进入 MVP-62。若 GUI 仍失败，MVP-62 继续只修本机回归缺陷。

## 禁止项

继续禁止 SQLite、下载器、元数据抓取、mpv、删除 / 移动 / 重命名真实文件、Renderer absolutePath / file://、真实扫描链路改动、写 index 逻辑改动、播放内核改动、大组件一次性拆分。
