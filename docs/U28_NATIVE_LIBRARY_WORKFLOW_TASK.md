# U28 — 资源库授权与真实 Index 闭环修复任务书

## 1. 任务性质

U28 是 U27 `NO-GO` 后的定向缺陷修复轮，允许修改产品代码，但范围只限：

```text
Windows 原生目录授权
→ Electron 安全 token / root snapshot
→ Settings 授权与按钮状态
→ Local JSON Index 读取或扫描
→ App 资源库状态
→ 首页 / 音声库 / 音乐库 / PlayerBar
→ AI 维护真实诊断状态
```

禁止顺带重构播放器、导入器、主题、下载器或全局状态架构。

## 2. 已确认问题

### MAJ-001：授权、Index 与浏览状态断裂

真实复现：

1. 用户通过原生目录选择器选择 `E:\arsm`。
2. 页面显示“已选择 arsm”。
3. 顶栏仍显示“已加载 51 条音轨”。
4. 设置页仍提示需要选择音声库目录。
5. “读取已有记录”和“一键扫描并应用”均为 disabled。
6. 音声库为 `0 / 0`，首页和队列为空。

### MAJ-002：诊断页仍使用 Demo 状态

AI 维护中的资源刷新显示 Demo 扫描，明确声明不会读取真实磁盘，资源计数为 0，无法反映真实授权与 Index。

## 3. 唯一代码来源

```text
https://github.com/5788324/Yang-Kura.git
```

从最新 `origin/main` 创建独立分支。执行前阅读：

```text
PROJECT_ROADMAP.md
PROJECT_STATE.md
docs/UI_DAILY_SURFACE_RULES.md
docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md
docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md
```

## 4. 根因定位要求

必须先画出真实状态链，不允许直接在按钮上硬编码 `disabled={false}`：

1. 原生目录选择器返回什么值。
2. Electron main 如何生成 root token、display name 和授权 snapshot。
3. Renderer/Store 如何保存当前授权 root。
4. Settings 如何判断：
   - 已选择目录；
   - 可以读取已有 Index；
   - 可以执行扫描；
   - 正在运行；
   - 当前 root 与上次 Index 是否匹配。
5. App 顶栏“51 条音轨”来自哪里。
6. 音声库 `0 / 0` 来自哪里。
7. 诊断页 Demo 数据由哪个 service 或 fixture 提供。
8. 重启后授权、Index 和 UI 状态如何水合。

报告中必须明确根因，不得只描述现象。

## 5. 修复合同

### 5.1 授权状态

原生目录选择成功后：

- 设置页立即显示已授权 root 的安全名称；
- 不暴露真实绝对路径或 `file://`；
- root token/snapshot 成为读取和扫描能力的唯一来源；
- 不允许“页面显示已选择，但按钮仍认为未选择”。

### 5.2 Index 读取与扫描

- 已存在兼容 Index：允许“读取已有记录”。
- 没有 Index：允许“一键扫描并应用”。
- Index 不兼容或损坏：显示可理解错误，并允许安全重建，不静默回退 Demo。
- 扫描与读取期间按钮状态正确，结束后恢复。
- 不得通过写死计数或导入旧 mock 数据制造成功。

### 5.3 单一资源快照

以下界面必须来自同一当前资源快照：

- 顶栏资源数量；
- 设置页上次资源库和当前授权状态；
- 首页最近/继续播放；
- 音声库和音乐库数量；
- PlayerBar 当前曲目与队列；
- AI 维护诊断摘要。

发现旧缓存时必须定义明确优先级和失效条件。

### 5.4 诊断页

可接受两种实现之一：

**方案 A：真实诊断**

- 读取当前授权 root、Index 元数据、作品数、音轨数和最近错误；
- 显示数据来源是当前 Index/Store；
- 刷新后与浏览页计数一致。

**方案 B：暂时禁用**

- 明确显示“真实资源诊断尚未接入”；
- 禁用刷新操作；
- 不显示 Demo 计数为当前用户状态。

禁止保留“刷新成功”但实际只执行 Demo 的行为。

## 6. 数据安全边界

- 真实 `E:\arsm` 只允许授权、读取、浏览和播放验证。
- 不对真实库执行清理、move、覆盖、批量元数据写入或删除。
- 写入、扫描重建和损坏 Index 测试只使用仓库外临时样本目录。
- 禁止使用脚本、配置文件、开发者工具或手工修改 Store 绕过原生目录授权。
- 禁止运行 `npm audit fix`。
- MVP130 下载器继续冻结。

## 7. 自动测试要求

新增 U28 专项 verifier，至少覆盖：

1. 目录选择结果映射到授权 snapshot。
2. 有授权 root 时读取和扫描能力为 true。
3. 无授权 root 时核心按钮为 disabled。
4. 有 Index / 无 Index / 损坏 Index 的决策。
5. 顶栏、库页面和诊断使用同一快照或明确适配层。
6. 诊断页不再引用 Demo 扫描作为真实状态。
7. 不暴露绝对路径和 `file://`。
8. TypeScript 转译和关键纯决策函数真实输入输出。

完整门禁：

```powershell
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
npm run verify:all
npm run verify:stable
npm run build
```

## 8. Windows 实机复验

### 8.1 临时样本库

使用仓库外临时目录：

```text
G:\Codex\YangKuraAcceptance\U28\
├── asmr-library\
├── music-library\
├── screenshots\
├── logs\
└── report\
```

由用户只在 Windows 原生对话框中选择目录。其余操作由 Codex 完成。

必须验证：

1. 选择目录后设置页授权状态一致。
2. 无 Index 时扫描按钮可用。
3. 扫描生成或更新 Index。
4. 读取并应用后音声库/音乐库出现真实样本。
5. 顶栏计数与库页面一致。
6. 播放至少一个音轨。
7. 关闭应用、无残留进程、重新启动后状态可恢复。
8. 诊断页显示真实状态或明确禁用。

### 8.2 真实 `E:\arsm` 只读验证

必须验证：

1. 原生授权后设置页不再提示未选择。
2. “读取已有记录”或“一键扫描并应用”至少一个根据真实情况可用。
3. 音声库能够显示真实作品。
4. 顶栏、音声库和诊断计数一致或有明确解释。
5. 播放一个音轨。

不得执行破坏性操作。

## 9. 问题分级

| 等级 | 定义 |
|---|---|
| Blocker | 数据损坏、误删、应用无法启动 |
| Major | 授权、Index、浏览或播放主链不可用/不一致 |
| Minor | 单项文案、布局或低频状态问题 |
| Observation | 环境限制或非阻塞风险 |

## 10. 完成条件

U28 只有在以下项目全部满足时才能合并：

- MAJ-001 关闭。
- MAJ-002 关闭，或改为明确禁用且不再误导。
- 临时样本完成授权 → Index → 浏览 → 播放 → 重启恢复。
- 真实 `E:\arsm` 只读链完成授权 → 浏览 → 播放。
- U02～U28 专项 verifier 全通过。
- 完整稳定回归和生产构建通过。
- 用户原配置恢复。
- Git 工作区 clean。
- 无 Yang Kura / Electron / mpv 残留进程。

完成后输出根因、修改文件、自动门禁、实机证据和 GO / CONDITIONAL GO / NO-GO。不得在同一轮继续字幕、导入器或发布功能。
