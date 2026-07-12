# MVP-19 Electron 真实目录选择 Dialog / Tokenized Root

## 目标

本阶段把 MVP-18 的目录选择 stub 推进为真实 Electron 系统目录选择器，但仍然只做“选择目录 + 生成 token”。换句话说：只选择目录，不扫描目录。

核心流程：

```text
用户点击“选择音声库目录 / 选择音乐库目录”
  ↓
Renderer 调用 window.yangKura.selectLibraryRoot()
  ↓
preload 使用 ipcRenderer.invoke()
  ↓
Electron main 调用 dialog.showOpenDialog()
  ↓
main 侧把真实 absolutePath 存入 rootTokenMap
  ↓
Renderer 只收到 rootPathToken / displayName / libraryType / permissionState
```

## 已实现内容

新增 / 更新：

```text
electron/main.ts
electron/preload.ts
src/types/electron-api.d.ts
src/types/electron-runtime-shim.d.ts
src/services/electronDirectoryDialogMvp19ContractService.ts
src/components/SettingsPage.tsx
src/components/DiagnosticsPage.tsx
scripts/verify-mvp19-directory-dialog-tokenized-root.mjs
```

## Renderer 返回结构

用户选择目录后，Renderer 只能收到：

```ts
{
  ok: true,
  status: 'mvp19-user-selected-tokenized-root',
  rootPathToken: 'yk-root-...',
  displayName: '目录末级名称',
  libraryType: 'asmr' | 'music' | 'mixed',
  permissionState: 'user-selected',
  source: 'mvp19-electron-dialog',
  absolutePathReturned: false,
  fileUrlReturned: false,
}
```

用户取消时：

```ts
{
  ok: false,
  status: 'mvp19-user-cancelled',
  permissionState: 'cancelled',
  absolutePathReturned: false,
  fileUrlReturned: false,
}
```

## 路径安全规则

```text
Renderer 只接收 rootPathToken。
Renderer 只展示 displayName 和 libraryType。
absolutePath 只保留在 Electron main 侧 rootTokenMap。
Renderer 不接收 absolutePath。
Renderer 不接收 file:// URL。
后续 dry-run 必须使用 rootPathToken，不能直接让 Renderer 传 absolute path。
```

## 继续禁止事项

MVP-19 仍然禁止：

```text
不扫描真实目录
不读取真实文件列表
不写 library-index.json
不注册真实 scanner IPC
不接 SQLite
不接真实音频播放
不生成 file:// URL
不删除 / 移动 / 重命名文件
不上传本地路径或媒体内容
```

## UI 语言规则

新增 UI 区块继续中文优先。

允许保留必要技术字段：

```text
rootPathToken
absolutePath
file://
Renderer
Electron main
IPC
```

但标题、按钮、说明、警告应使用中文。

## 验收

```bash
npm ci
npm run verify:env
npm run lint
npm run build:electron
npm run verify:mvp19-directory-dialog-tokenized-root
npm run verify:all
npm run build
npm audit --audit-level=high
```

如果要在本机真实打开 Electron 桌面壳验证目录选择，需要先安装 Electron binary：

```bash
npm run electron:install
npm run desktop:dev
```

当前 CI / 交接环境如未安装 Electron binary，只能验证 TypeScript 构建与静态合同，不能声称已经完成桌面运行实测。

## 下一阶段

下一阶段建议：

```text
MVP-20：基于 rootPathToken 的小样本真实 dry-run 扫描。
```

MVP-20 仍应只读扫描小样本目录，不写 index、不扫完整 E:\\arsm、不做文件变更。
