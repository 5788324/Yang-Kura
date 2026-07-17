# U39-F 增量架构防回退门禁

## 目标

阻止新的高风险耦合继续进入 Yang-Kura，同时不要求一次性清空全部历史技术债。

门禁比较 Pull Request 的 base 与 head，只阻断新增问题。已有显式 `any`、旧导入关系或既存依赖环作为当前基线保留，后续在修改对应链路时逐步消除。

## 规则

### 1. 禁止新增显式 `any`

检查新增 TypeScript 行中的显式类型标注、断言、泛型容器和泛型默认值，例如：

- `value: any`
- `value as any`
- `Promise<any>`
- `Record<string, any>`

`unknown`、明确领域类型和受控类型守卫不受影响。

### 2. Renderer 禁止裸 IPC

`src/` 中禁止新增：

- `ipcRenderer`
- `ipcMain`
- `contextBridge`
- 直接导入 `electron`

Renderer 必须通过 `window.yangKura` 与 Preload 合同调用桌面能力。

### 3. 禁止新增跨层导入

- `src/` 不得通过相对路径进入 `electron/`；
- `electron/` 不得导入 `src/app`、`src/components`、`src/features`、`src/hooks` 或 `src/shared/ui`；
- Electron 与 Renderer 的共享事实应进入合同或领域类型层，而不是互相引用实现。

### 4. 禁止新增相对导入循环

脚本分别建立 base 与 head 的 `src/`、`electron/` 相对导入图，并使用强连通分量识别循环。

只阻断 head 新出现的循环；既有循环数量写入报告，便于后续渐进清理。

## CI

`.github/workflows/architecture-guardrails.yml` 在相关 TS/TSX 或门禁文件变化时运行：

1. 检出完整 Git 历史；
2. 执行规则解析器自测；
3. 比较 PR base 与 head；
4. 输出 `artifacts/u39f-architecture-guardrails/report.json`；
5. 有新增违规时以文件、行号和规则名阻止合并。

该工作流不安装 npm 依赖，目标是在数分钟内完成。

## 非范围

- 不自动修改代码；
- 不一次性消除历史 `any` 或全部历史依赖环；
- 不替代 TypeScript、U28～U32、stable regression 或安装包验收；
- 不对产品运行时、播放器、资源库、Index、导入器或安装器产生行为变化。
