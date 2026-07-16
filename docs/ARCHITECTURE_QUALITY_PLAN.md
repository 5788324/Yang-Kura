# Yang-Kura 架构与代码质量计划

> 文档状态：Beta 2 执行基线 1.0  
> 原则：行为冻结、渐进迁移、持续回归、可回退  
> 禁止：全量重写、长期双轨、为了架构而架构

## 1. 目标

本计划用于解决连续多轮开发后形成的结构性欠账，使后续下载器、SQLite、Provider、转录 Worker、云端 Adapter 或 Player Core 升级可以通过清晰扩展点接入，而不是继续把逻辑堆入页面、Hook、Electron main 或历史 service。

目标不是让目录看起来整齐，而是确保：

- 业务规则可独立测试；
- UI 可以更换而不重写真实数据链；
- Electron main 可以拆分而不改变安全边界；
- 同一状态只有一个事实来源；
- 错误能被分类、恢复和追踪；
- AI 能在有限上下文中安全修改模块；
- CI 能阻止新的跨层依赖、弱类型和历史门禁脆化。

## 2. 现状风险假设

U34 审计必须以源码数据确认以下风险，不得凭感觉直接重构：

- `App.tsx`、页面组件、播放器 Hook 或 Electron main 职责过多；
- UI 与 application service、文件系统和 IPC 边界不清晰；
- Renderer、preload 和 main 对同一数据定义多套类型；
- 播放器、资源库、导入器、设置存在重复状态或 localStorage 分散写入；
- 历史 MVP service 与 verifier 长期留在活跃路径；
- 稳定门禁仍依赖源码字符串、固定版本或旧文案；
- 页面结构、业务行为和工程诊断同时存在于一个组件；
- 大型资源库下存在重复计算、全量渲染或封面加载浪费；
- 异常处理通过字符串、`any`、非空断言和宽泛 catch 传播。

## 3. 目标分层

建议目标结构如下。实际迁移以审计结果为准，不要求一次移动全部文件。

```text
src/
├─ app/
│  ├─ AppShell
│  ├─ routing
│  ├─ providers
│  └─ bootstrap
├─ features/
│  ├─ home
│  ├─ asmr-library
│  ├─ music-library
│  ├─ playlists
│  ├─ importer
│  ├─ settings
│  └─ maintenance
├─ domain/
│  ├─ library
│  ├─ playback
│  ├─ importer
│  ├─ metadata
│  └─ settings
├─ application/
│  ├─ library
│  ├─ playback
│  ├─ importer
│  ├─ metadata
│  └─ maintenance
├─ infrastructure/
│  ├─ electron
│  ├─ index
│  ├─ media
│  ├─ storage
│  └─ providers
├─ shared/
│  ├─ contracts
│  ├─ errors
│  ├─ result
│  ├─ ui
│  ├─ hooks
│  └─ utils
└─ tests/
   ├─ fixtures
   ├─ helpers
   └─ contracts

electron/
├─ main/
├─ preload/
├─ ipc/
├─ library/
├─ playback/
├─ importer/
├─ metadata/
├─ maintenance/
└─ shared/
```

## 4. 依赖方向

允许：

```text
UI / Electron Adapter
        ↓
Application Use Case
        ↓
Domain Rule / Contract
        ↑
Infrastructure implements ports
```

硬规则：

- `domain` 不依赖 React、Electron、Node、DOM、localStorage 或具体 Provider；
- 页面只组合状态和用例，不实现文件事务、Index patch、播放后端或 Provider 解析；
- renderer 不直接访问 `fs`，不接收 absolutePath 或 file://；
- preload 只暴露最小、类型化、可验证的 API；
- Electron main 不直接拼装页面展示模型；
- infrastructure 不反向 import feature 组件；
- feature 之间通过公开 application API 协作，不读取对方内部 store。

## 5. 统一契约

建议建立：

```text
src/shared/contracts/
├─ library.contract.ts
├─ playback.contract.ts
├─ subtitle.contract.ts
├─ importer.contract.ts
├─ metadata.contract.ts
├─ settings.contract.ts
├─ maintenance.contract.ts
└─ ipc.contract.ts
```

### 5.1 Result

```ts
type Result<T, E extends AppError = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

禁止用 `null`、空字符串、任意对象或抛出未分类异常同时表达失败。

### 5.2 错误分类

至少区分：

- `ValidationError`；
- `PermissionError`；
- `FileSystemError`；
- `IndexReadError`；
- `IndexWriteError`；
- `IndexCorruptionError`；
- `PlaybackBackendError`；
- `SubtitleError`；
- `ImportConflictError`；
- `ImportRollbackError`；
- `ProviderError`；
- `ConfigurationError`；
- `UnexpectedInternalError`。

错误对象必须包含：

- 稳定 code；
- 用户可理解 message key；
- 是否可重试；
- 推荐恢复动作；
- 仅维护层可见的 technical details；
- 不包含向 renderer 泄露的绝对路径。

## 6. 状态治理

### 6.1 唯一事实来源

必须明确以下状态的 owner：

- 当前资源库 session；
- 当前播放 track、position、backend 和 queue；
- 当前导入任务及事务状态；
- 设置和主题；
- 元数据覆盖与 Provider preview；
- 维护任务和历史。

禁止页面、Hook、service、localStorage 分别维护同一状态的可写副本。

### 6.2 持久化边界

- 播放状态通过统一 persistence service 写入；
- 设置通过版本化 settings repository 写入；
- library-index 继续作为 Beta 2 媒体库事实来源；
- localStorage 只保存明确允许的非敏感 UI 偏好；
- 绝对路径、file://、临时媒体 URL、IPC 原始 payload 不得持久化到 renderer。

## 7. Electron 与 IPC

### 7.1 IPC 注册

所有 channel 必须集中定义，禁止页面或 preload 使用裸字符串。

每个 IPC 必须声明：

- request schema；
- response schema；
- error schema；
- 调用方向；
- 权限和路径 token 要求；
- 是否允许取消；
- 是否可重试；
- 日志脱敏规则。

### 7.2 运行时校验

TypeScript 类型不能替代运行时边界校验。Renderer 到 main、外部 JSON、Provider 响应和 Index 数据必须验证后再使用。

### 7.3 Main 拆分

不一次重写 `electron/main.ts`。当某个模块进入当前迁移范围时再提取：

- library；
- playback；
- importer；
- metadata；
- maintenance；
- release / updater。

每次提取必须先有现有行为测试，完成后删除旧路径。

## 8. TypeScript 质量策略

分目录逐步启用：

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "useUnknownInCatchVariables": true
}
```

规则：

- 不允许一次打开全部选项后用大量断言压平错误；
- 每轮只收紧当前迁移模块；
- 不新增 `any`；
- `unknown as T` 必须配合边界校验或有明确迁移 Issue；
- 非空断言必须有无法通过类型表达的原因；
- `eslint-disable` 必须说明作用范围和移除条件。

## 9. ESLint 与自动架构门禁

应增加：

- 层级 import 边界；
- 循环依赖；
- floating promises；
- renderer 禁止 Node/Electron main import；
- 禁止裸 IPC channel；
- 禁止新增 `any`；
- 禁止无说明 disable；
- 复杂度和文件规模报告；
- 未使用导出和死代码检测。

建议提醒阈值：

| 类型 | 提醒阈值 |
|---|---:|
| 页面组件 | 400 行 |
| 普通组件 | 250 行 |
| Service | 350 行 |
| Hook | 250 行 |
| 单函数 | 60 行 |
| 圈复杂度 | 12 |
| 参数数量 | 5 |

阈值用于触发审查，不机械判定代码错误。

## 10. 测试结构

### 10.1 测试金字塔

- Domain：纯单元测试；
- Application：用例、事务和错误映射；
- Infrastructure：临时目录、fixture、假 mpv、Provider mock；
- IPC：schema、权限和错误合同；
- UI：关键组件与状态；
- Electron E2E：用户主路径；
- Windows packaging：portable、安装、升级、卸载和数据保留。

### 10.2 高价值覆盖

优先覆盖：

- Index 解析、备份、迁移、读回；
- 文件事务和回滚；
- 播放队列和完成策略；
- mpv / HTMLAudio fallback；
- 长音频 Seek 和续播；
- 字幕解析、匹配和时间线；
- 路径 token 与权限；
- Provider 字段映射和选择性应用；
- 设置迁移；
- Beta 1 到 Beta 2 数据兼容。

不追求无意义的全局 100%。Domain / Application 目标覆盖率建议不低于 80%，基础展示组件不强制。

### 10.3 历史 verifier 治理

历史 verifier 分三类：

1. 当前产品安全事实：进入稳定门禁；
2. 历史交付证据：归档，只在需要时运行；
3. 固定文案、固定版本、源码字符串检查：替换为行为或结构合同后移出稳定门禁。

禁止历史 verifier 再次阻止合法版本升级、文档更新或模块提取。

## 11. 性能预算

Beta 2 必须至少记录：

- 冷启动时间；
- 主窗口可交互时间；
- 50,000 曲目 Index 读取时间；
- 音声库首次渲染和筛选响应；
- 搜索输入响应；
- 封面缓存和并发请求；
- PlayerBar 状态更新开销；
- renderer 内存；
- portable / installer 包体。

原则：

- 大列表虚拟化；
- 封面懒加载；
- 搜索和筛选避免每次全量重复派生；
- 页面按需加载；
- 维护模块不得进入日常首屏 bundle；
- 动画只使用 transform / opacity 等低成本属性。

## 12. 文档治理

长期文档建议保留：

- `README.md`：产品入口；
- `PROJECT_STATE.md`：当前事实；
- `docs/BETA2_MASTER_PLAN.md`：当前路线；
- `docs/ARCHITECTURE_QUALITY_PLAN.md`：架构规则；
- `docs/DESIGN.md`：UI 规则；
- `docs/PROJECT_PROGRESS.md`：进度和任务表；
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`：新对话交接；
- `docs/decisions/`：重要 ADR。

历史 MVP、U 编号和发布证据可归档，但不得继续占据日常入口。

## 13. 每轮 Definition of Done

每个重构或 UI 迁移 PR 必须：

- 说明保持不变的行为；
- 说明迁移前后依赖变化；
- 有自动测试覆盖当前风险；
- 不增加公开状态副本；
- 删除被替代的旧路径；
- 通过 TypeScript、Electron、稳定回归和生产构建；
- UI 变更提供深浅主题和窗口矩阵截图；
- 更新相关设计、架构和交接文档；
- 可通过单个 revert 恢复。

## 14. 明确不做

Beta 2 阶段不做：

- 全量重写；
- 微服务；
- 复杂依赖注入框架；
- Redux/MobX 全局迁移，除非审计证明现有方案无法治理；
- SQLite 全面替换 library-index；
- 更换 mpv + HTMLAudio 组合；
- 为每个简单对象建立接口；
- 为覆盖率制造无价值测试；
- 同时修改业务、架构、视觉和数据格式且没有迁移边界。
