# Yang-Kura CURRENT ROADMAP — MVP-62

版本：`0.100.0-mvp62`

MVP-62 是 Electron strict smoke / setup 可靠性修复轮。

## 本轮目标

- 修复 Windows 下 `desktop:smoke-check:strict` 直接 spawn `electron.cmd` 触发 `EINVAL` 的问题。
- 将 `desktop:setup` 从单纯 `electron:install` 升级为 install + `npm rebuild electron` + `electron --version` 验证。
- 强化 strict smoke：检查 wrapper、`path.txt`、resolved Electron binary、`electron --version`。
- 文档建议本机 GUI 回归使用 Node 22.12+ / npm 10.x；项目正式门禁仍是 Node `>=22 <23` / npm `>=10 <11`。
- 不新增播放器、扫描、下载、元数据或数据库能力。

## MVP-62 后建议

让 Codex 在本机重新跑 GUI 回归：

```bash
nvm use 22
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```
