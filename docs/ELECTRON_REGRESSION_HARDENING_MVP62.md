# MVP-62 — Electron strict smoke / setup 可靠性修复

版本：`0.100.0-mvp62`

MVP-62 是 Electron strict smoke / setup 可靠性修复轮。它直接处理 MVP-61 本机 Codex 回归报告里的 `NEEDS_FIX / PARTIAL PASS`：

1. `desktop:smoke-check:strict` 在 Windows 下直接 spawn `electron.cmd`，触发 `EINVAL`。
2. `desktop:setup` 成功后 Electron 仍缺 `path.txt / dist/electron.exe`，需要手动 `npm rebuild electron` 才恢复。
3. 文档需要建议使用 Node 22.12+ LTS 小版本做 GUI 回归。

## 1. 脚本修复

### `npm run desktop:setup`

MVP-62 后不再只是调用 `electron:install`。

现在执行：

```bash
npm install electron@^39.8.1 --save-dev
npm rebuild electron
electron --version
```

实现文件：

```text
scripts/setup-electron-desktop.mjs
```

它会检查：

```text
node_modules/electron/path.txt
resolved Electron executable
Windows: dist/electron.exe
```

因此可以覆盖本机报告里 `path.txt / dist/electron.exe` 缺失的问题。

### `npm run desktop:smoke-check:strict`

MVP-62 后 strict smoke 会检查：

```text
Electron CLI wrapper exists
Electron binary metadata path.txt exists
Electron resolved binary exists
Electron CLI launches --version
```

Windows 下不会再直接 spawn `.cmd`，而是通过：

```text
cmd.exe /d /c
```

启动 `electron.cmd --version`，避免 `.cmd` 直接 spawn 的 `EINVAL`。

### `run-electron-preview.mjs`

预览启动也补齐 `.cmd` 包装启动逻辑，和 `run-electron-dev.mjs` 保持一致。

## 2. 推荐本机 GUI 回归流程

建议使用 Node 22.12+ / npm 10.x。

项目正式 engine 仍保持：

```text
Node >=22 <23
npm >=10 <11
```

推荐命令：

```bash
nvm use 22
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

如果 3000 端口占用：

```bash
set YANG_KURA_VITE_DEV_URL=http://127.0.0.1:3001
npm run dev:electron
```

PowerShell：

```powershell
$env:YANG_KURA_VITE_DEV_URL="http://127.0.0.1:3001"
npm run dev:electron
```

## 3. UI 标记

设置页新增：

```text
mvp62-electron-regression-hardening
```

诊断页新增：

```text
mvp62-electron-regression-hardening-review
```

这些区块只说明本机回归启动修复，不进入播放器、扫描或资源库主流程。

## 4. 安全边界

本轮不做：

```text
SQLite
下载器
ASMR.one / DLsite / 网易云元数据抓取
mpv 后端
不删除 / 移动 / 重命名真实媒体文件
absolutePath 暴露
file:// 暴露
真实扫描链路改动
真实播放内核改动
写 index 逻辑改动
字幕读取逻辑改动
打包逻辑改动
大组件一次性拆分
```

Renderer 仍不接收 `absolutePath` 或 `file://`。

## 5. 下一轮测试重点

- Node 22.12+ / npm 10 下 `verify:all` 继续 PASS。
- `npm run desktop:setup` 后 `path.txt / dist/electron.exe` 完整。
- `npm run desktop:smoke-check:strict` 在 Windows 不再 `EINVAL`。
- `npm run dev:electron` 能打开 `Yang-Kura Audio Library`。
