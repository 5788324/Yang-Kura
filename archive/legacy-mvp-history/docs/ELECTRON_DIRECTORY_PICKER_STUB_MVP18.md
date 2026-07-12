# MVP-18 Electron 目录选择 Stub / Tokenized Root Selection

## 目标

本阶段把 `selectLibraryRoot()` 的返回结构提前定死，但仍然不打开真实目录选择器。

核心目的：

```text
Electron preload stub
  ↓
selectLibraryRoot()
  ↓
rootPathToken / displayName / libraryType
  ↓
Renderer 不接收 absolutePath
```

## 当前实现

新增：

```text
src/services/electronDirectoryPickerStubContractService.ts
```

更新：

```text
electron/preload.ts
src/types/electron-api.d.ts
src/services/electronStubSmokeCheckService.ts
src/components/DiagnosticsPage.tsx
src/components/SettingsPage.tsx
```

## 返回结构

MVP-18 的 `selectLibraryRoot()` 返回 tokenized root stub：

```ts
{
  ok: true,
  status: 'mvp18-tokenized-root-stub',
  rootPathToken: 'yk-root-stub-asmr-001',
  displayName: '示例音声库（Stub，不是真实路径）',
  libraryType: 'asmr',
  permissionState: 'stub-only',
  source: 'mvp18-stub',
  absolutePathReturned: false,
  fileUrlReturned: false,
}
```

注意：

```text
absolutePath 不返回给 Renderer
file:// URL 不返回给 Renderer
真实路径未来只能保留在 Electron main 侧
```

## UI 语言规则

从 MVP-18 开始，新增 UI 区块应以中文为主。
技术字段可以保留英文，例如：

```text
rootPathToken
absolutePath
file://
dry-run
IPC
Renderer
Electron main
```

但按钮、标题、说明、警告应使用中文优先。

## 禁止事项

本阶段仍禁止：

```text
不打开真实目录选择器
不读取真实目录
不返回 absolutePath
不返回 file:// URL
不写 library-index.json
不注册真实 scanner IPC
不删除 / 移动 / 重命名文件
不接 SQLite
```

## 后续阶段

下一阶段可以进入：

```text
MVP-19：真实目录选择 dialog，但只返回 rootPathToken/displayName，不扫描目录
```

MVP-19 仍不应实现真实扫描。真实扫描至少应等目录选择 token 模型稳定后再做。
