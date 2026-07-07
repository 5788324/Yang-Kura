# LOCAL_REGRESSION_FIX_MVP61

## 定位

MVP-61 是本机回归阻塞修复轮。它接收 MVP-60 本机 Codex 报告中的 PARTIAL PASS 结论，并修复最直接影响 GUI 回归的脚本、安装和检查问题。

## 新增脚本

| 脚本 | 作用 |
|---|---|
| `npm run dev:electron` | 新增兼容入口，等价于 `npm run desktop:dev`。 |
| `npm run desktop:setup` | GUI 回归前安装 / 修复 Electron binary，当前等价于 `npm run electron:install`。 |
| `npm run desktop:smoke-check:strict` | 严格桌面 smoke check，会执行 Electron `--version`。 |
| `npm run verify:mvp61-local-regression-fix` | MVP-61 专项 verifier。 |

## 推荐本机流程

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

如果 `3000` 端口已占用，可以关闭占用进程，或设置：

```bash
set YANG_KURA_VITE_DEV_URL=http://127.0.0.1:3001
npm run dev:electron
```

PowerShell 可用：

```powershell
$env:YANG_KURA_VITE_DEV_URL="http://127.0.0.1:3001"
npm run dev:electron
```

## smoke check 策略

`npm run desktop:smoke-check` 默认仍是 advisory，不会因为缺少 Electron binary 直接失败。这样普通源码验证可以继续在无 GUI 环境运行。

`npm run desktop:smoke-check:strict` 用于真实本机 GUI 回归。它必须能执行 Electron CLI 的 `--version`，否则失败并提示先运行 `npm run desktop:setup`。

## Node/npm 门禁

正式验证继续使用：

- Node `>=22 <23`
- npm `>=10 <11`

不为 Node 24 / npm 11 放宽正式 `verify:env`。Node 24 只能用于临时 smoke，不用于 Beta 候选包最终判定。

## 路径安全复核

MVP-61 对 `libraryIndexAdapter.ts` 中 `collection.folderPath` 的展示做收口：

- 只展示相对/集合记录。
- 拒绝盘符绝对路径，例如 `G:/...` 或 `G:\...`。
- 拒绝 Unix 绝对路径。
- 拒绝 `file://`。
- Renderer 仍不接收 `absolutePath` 或 `file://`。

## 不变边界

- 不接 SQLite。
- 不接下载器。
- 不接 ASMR.one / DLsite / 网易云元数据抓取。
- 不接 mpv 后端。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不改真实扫描链路。
- 不改写 index 逻辑。
- 不改播放内核。
- 不做大组件一次性拆分。

## UI 锚点

- 设置页：`mvp61-local-regression-fix`
- 诊断页：`mvp61-local-regression-fix-review`
