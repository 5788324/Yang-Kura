# Yang-Kura U34 架构与质量审计

> 审计基线：`6b610902e44f49a865f62db82ab0296d5b9411d9`  
> 审计范围：Renderer、Electron main/preload、IPC 契约、状态与持久化、测试/CI、历史兼容层。  
> 本阶段只做静态审计、流程修正和文档固化，不修改产品运行行为。

## 1. 执行结论

Yang-Kura 的核心业务并不需要推倒重写。Beta 1 已经具备真实资源库、播放器、字幕、导入事务、元数据、维护和 Windows 发布闭环，现有安全边界也有明显价值。

当前主要问题是**技术债高度集中在少数运行时文件和历史兼容机制中**：

1. `electron/main.ts`、`SettingsPage.tsx`、`DiagnosticsPage.tsx`、`App.tsx`、`useAudioPlayer.ts` 承载过多职责。
2. Renderer 类型声明、preload 和 main 各自维护 IPC 类型与 channel，形成三套事实来源。
3. 历史 MVP 合同、展示模型和字符串 verifier 长期留在活跃源码与 `package.json` 中。
4. TypeScript 当前未开启 strict，仍存在 `any`、`unknown` 强制断言和宽泛对象。
5. CI 将低风险文档变更与完整 Windows 打包、发布验证绑定，导致小任务成本失真。

因此 Beta 2 应采用：

```text
保留已验证业务能力
→ 先建立共享契约和依赖边界
→ 按页面纵向迁移 UI
→ 同步拆分触碰到的运行时模块
→ 最后归档历史兼容层
```

## 2. 当前架构优势

以下内容应视为不可随意推翻的资产：

- Electron 使用 `contextIsolation: true`、`nodeIntegration: false`，Renderer 不直接访问 Node 文件系统。
- 本地真实路径主要保存在 Electron main 的 token map，Renderer 使用 `rootPathToken + relativePath`。
- `library-index.json` 具备写入、备份、读回、健康检查、受控清理、恢复和维护历史。
- copy-only / move-only 导入已经具备不覆盖、失败停止、回滚和 OperationLog。
- mpv 采用外部子进程，失败后可回退 HTMLAudio，并处理退出回收。
- U28～U32 已形成真实 Electron、播放器、UI、导入事务和打包验收链。
- 50,000 曲目合成数据基准已存在，适合作为 UI 重写后的性能回归基线。

## 3. 高风险集中区

| 区域 | 规模/现状 | 风险 | 处理阶段 |
|---|---|---|---|
| `electron/main.ts` | 约 4,800 行级；窗口、协议、扫描、Index、维护、mpv、Provider、导入和 IPC 共存 | 修改任一功能都可能扩大回归面；裸 channel 和手工 payload 校验集中 | U35～U39 渐进拆分 |
| `src/components/SettingsPage.tsx` | 3,500 行以上；主题、播放后端、目录、扫描、Index、备份、维护和历史记录共存 | 日常设置与 AI 维护耦合，状态数量过多，难以独立测试 | U35/U39 优先拆分 |
| `src/components/DiagnosticsPage.tsx` | 3,400 行以上；大量历史 MVP 展示和 fixture 合同进入运行时 | 产品页面被当作项目历史数据库，bundle 和理解成本持续增加 | U35/U39 归档历史层 |
| `src/App.tsx` | 约 850 行；路由、资源库状态、元数据、歌单、队列、播放器和弹层共存 | 顶层组合器同时承担用例和状态业务 | U35/U36 拆 App Shell 与用例 |
| `src/hooks/useAudioPlayer.ts` | 700 行以上；HTMLAudio、mpv、fallback、队列、历史、字幕和持久化共存 | 播放器任何修改都触碰中央状态机 | U38 按控制器/后端/持久化/字幕拆分 |
| `src/types/electron-api.d.ts` | 大型全局声明，和 preload/main 重复 | 三端契约漂移，变更需要手工同步 | U35/U36 建立共享契约 |
| `src/services/index.ts` | 400 行以上 export barrel；运行时服务与历史模型混合 | 隐式依赖、无效打包和错误导入更难识别 | U35/U40 按域拆 barrel |
| `package.json` | scripts 与大量 MVP 元数据混合 | 包配置成为历史数据库，稳定回归需临时改写版本 | U40 归档历史元数据 |

## 4. 具体问题

### 4.1 Renderer 顶层状态来源过多

当前同时存在：

- React state；
- `useLocalStorage`；
- `sessionStorage`；
- `librarySessionService`；
- `window` 自定义事件；
- `window.yangKura` IPC；
- base refs 与 metadata override 叠加层。

这些机制本身均可使用，但缺少明确的“谁是权威状态源”规则。后续应按域明确：

```text
资源库快照：Library application service
播放器：Player controller
设置：Settings repository
元数据覆盖：Metadata repository
页面临时状态：组件本地 state
```

### 4.2 IPC 契约重复

同一能力目前可能同时声明在：

1. `electron/main.ts`；
2. `electron/preload.ts`；
3. `src/types/electron-api.d.ts`。

同时 preload/main 使用裸字符串 channel，例如 `yang-kura:index:*`、`yang-kura:import:*`。这会导致：

- channel 拼写只能在运行时发现；
- request/result 类型可能漂移；
- main 侧频繁使用 `request as Partial<T>`；
- 新增功能需要修改多个文件。

U35/U36 必须建立 `src/shared/contracts` 或独立 `shared/contracts`，由 Renderer、preload 和 main 共用。

### 4.3 历史 verifier 侵入运行时

当前可见特征包括：

- 组件顶部大量 `Legacy verifier marker`；
- 隐藏 DOM/SR-only 文案用于字符串断言；
- 多个 `mvpXX...Service` 仍被 Settings/Diagnostics 导入；
- `package.json` 保存大量历史版本说明；
- 稳定回归运行时临时把 `package.json.version` 改回 `0.167.0-mvp129`。

这些兼容层短期不能一次删除，但从 U34 起执行：

- **禁止新增隐藏 verifier 锚点**；
- 新验收优先验证行为和输出；
- 历史 verifier 只允许修复、归档或替换；
- U40 统一移出日常运行时。

### 4.4 TypeScript 边界偏宽

当前 `tsconfig.json`：

- 未启用 `strict`；
- `allowJs: true`；
- `skipLibCheck: true`；
- 未显式启用 `noImplicitAny`、`noUncheckedIndexedAccess` 等。

发现的代表性问题：

- `icon: any`；
- `toArray<T = any>`；
- 多处 `unknown[]` 与强制断言；
- 核心 `types.ts` 同时保存 UI、Domain、未来 Index 和下载模型；
- Renderer 模型中仍存在可选 `absolutePath/fileUrl` 字段，和实际路径隐私目标不完全一致。

不建议一次开启全仓 strict。建议 U35 起对新目录和迁移目录逐步启用。

### 4.5 CI 验证强度与风险不匹配

当前 Branch Validation 对所有 PR 执行完整 Windows 链：

- 安装依赖、audit、Electron rebuild；
- Renderer/Electron 构建；
- U28～U32 E2E；
- 全部 focused verifier；
- stable regression；
- 再次生产构建。

U32/U33 工作流此前还会因普通状态/路线/交接文档变化而打包 portable、NSIS 或重建 Beta 资产。

这正是本次“低风险文档任务耗时过长”的直接工程原因。U34 同步调整为：

```text
纯文档/交接：轻量文档门禁
产品代码：Branch Validation
打包相关代码或发布计划：U32/U33 发布门禁
```

## 5. 不可破坏行为清单

Beta 2 每个纵向迁移 PR 必须保持：

1. 目录选择后只向 Renderer 返回 token/显示名，不暴露绝对路径。
2. Index 写入前确认与备份；读取、健康检查、受控清理和恢复仍可用。
3. HTMLAudio、mpv、fallback、Seek、队列、历史和续播行为不退化。
4. LRC/SRT/VTT/ASS 与双语字幕读取不退化。
5. copy-only 保留源文件且不覆盖；move-only 保留确认、上限、失败停止和回滚。
6. OperationLog 不写真实绝对路径。
7. 本地元数据覆盖和 DLsite 单 RJ 预览不自动覆盖用户数据。
8. portable/NSIS、安装/卸载、用户数据保留和进程回收不退化。
9. 50,000 曲目场景不出现明显搜索、渲染或内存回归。
10. 中文日常界面不重新暴露 MVP、verifier、命令行和内部 token。

## 6. U35 入口条件

U34 完成后，U35 第一批实际改动限定为：

1. 建立共享 IPC channel/contract 目录；
2. 建立新的语义 Design Token 基础；
3. 拆出 App Shell 与路由组合层；
4. 拆 Settings 的外观、播放、资源库和 AI 维护边界；
5. 不同时重写资源库、播放器和导入器业务。

## 7. 审计结论

```text
结论：GO
方式：渐进式结构优化 + UI 纵向迁移
禁止：全项目推倒重写、先搬目录后补行为、继续新增历史字符串锚点
下一阶段：U35 架构边界与 Design System 基础
```
