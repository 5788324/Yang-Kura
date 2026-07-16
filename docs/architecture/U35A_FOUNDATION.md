# U35-A 共享契约与 Design System 基础

## 状态

```text
阶段：U35-A
性质：增量基础设施
产品行为：不变
下一步：U35-B App Shell 与主题接线
```

## 本轮目标

U34 已确认主要风险来自巨型运行时文件、三套重复 IPC 类型和页面内视觉常量。本轮不在巨型文件中进行大规模搬迁，而是先建立后续迁移可以依赖的稳定合同。

## 已建立内容

### 1. IPC 单一注册表

权威文件：

```text
electron/ipc/contracts.ts
```

内容包括：

- 所有现有 `yang-kura:*` channel 的分域注册表；
- `IpcChannel` 联合类型；
- `IpcResult<T>`、`IpcError`、`IpcErrorCode`；
- root token、相对路径和 track-scoped 请求基础类型；
- `ipcOk` / `ipcFail` 结果构造器。

Renderer 通过以下入口消费同一合同：

```text
src/shared/ipc/index.ts
```

本轮尚未批量修改 `electron/main.ts` 和 `electron/preload.ts` 的调用点。原因是两者属于当前高风险主链，应该在 U36 以可回归的域级切片逐步替换，而不是一次性全文件重写。

### 2. 语义 Design Token

权威文件：

```text
src/styles/design-tokens.css
```

已定义：

- 字体与字号；
- 间距；
- 圆角；
- 控件高度；
- Motion 时长与缓动；
- z-index 层级；
- Canvas、Surface、Border、Text、Accent、Feedback、Focus、Shadow 语义颜色；
- reduced-motion 行为。

正式 Beta 2 主题合同：

```text
.theme-dusk-amber  暮夜琥珀
.theme-mist-ivory  雾光象牙
```

当前三个生产主题获得 `--yk-*` 语义别名，但视觉值保持不变。新主题在 U35-B 接入设置和 App Shell 后才成为用户可选项。

### 3. 基础 UI Primitive

```text
src/shared/ui/Button.tsx
src/shared/ui/Dialog.tsx
src/shared/ui/Feedback.tsx
src/shared/ui/Surface.tsx
src/shared/ui/index.ts
```

规则：

- 只使用 `--yk-*` 语义 Token；
- 不允许 Tailwind 具体色阶或硬编码颜色；
- Button 覆盖 loading、disabled、size、variant 和图标槽；
- Dialog 覆盖 Escape、焦点进入、焦点返回、aria-modal 和 backdrop；
- Feedback 使用 status/alert 语义；
- Surface 统一容器材质、padding 和 elevation。

## 自动门禁

```text
scripts/verify-u35a-foundation.mjs
```

验证：

- 所有 runtime `yang-kura:*` channel 均存在于权威注册表；
- channel 值无重复；
- 错误模型和结果模型存在；
- 两套正式主题及核心 Token 完整；
- Renderer 入口加载 Design Token；
- shared UI 不出现硬编码颜色或具体 Tailwind palette utility。

该 verifier 使用 `verify-u*.mjs` 命名，会被现有 Branch Validation 自动执行。

## U35-B 接线顺序

1. 将 ThemeType 升级为稳定主题 ID，并添加一次旧主题迁移。
2. App Shell 使用 `--yk-*` Token，接入暮夜琥珀和雾光象牙。
3. 先迁移 Sidebar、TopBar、全局 Dialog/Drawer，再迁移页面。
4. 按域把 preload/main 裸 channel 替换为 `IPC_CHANNELS`。
5. 新 IPC 使用 `IpcResult<T>`；旧响应在 Adapter 层转换，不要求业务页面理解历史 MVP status。
6. 新增代码不得定义第二套 IPC channel 或颜色常量。

## 不可破坏边界

- Renderer 仍不得接收绝对路径或 `file://`；
- 不改变现有 Index、播放、字幕、Provider、导入和维护行为；
- 不移除历史兼容代码；
- 不启用下载器、SQLite、OpenList/WebDAV 或 Player Core v2；
- 不在本轮修改真实媒体文件。
