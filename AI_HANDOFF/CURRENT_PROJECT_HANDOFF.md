# Yang-Kura 当前项目交接

> **用途：新对话、ChatGPT、Codex 或其他 AI 接手 Yang-Kura 时的当前权威交接。**
>
> 代码事实以最新 GitHub `main` 为准；当前状态见 `PROJECT_STATE.md`，长期顺序见 `PROJECT_ROADMAP.md`，固定分工见 `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`。

## 1. 项目

```text
仓库：https://github.com/5788324/Yang-Kura.git
主分支：main
核心版本：0.167.0-mvp129
应用：React + Vite + TypeScript + Electron
平台：Windows
用途：ASMR/RJ 与普通音乐的本地音频媒体库
当前索引：Local JSON Index
```

必须从最新 `origin/main` 接手。不要使用旧 ZIP、历史 MVP 包、旧工作区副本或文档中的旧固定 SHA 作为代码来源。

## 2. 必读顺序

1. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
2. `PROJECT_STATE.md`
3. `PROJECT_ROADMAP.md`
4. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`
5. `docs/U28_LIBRARY_RECONCILIATION_IMPLEMENTATION.md`
6. `docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md`
7. `docs/UI_DAILY_SURFACE_RULES.md`
8. `RUN_ME_FIRST.md`
9. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

不要从 `archive/legacy-mvp-history/`、旧 Round 报告或历史 NO-GO 推导当前任务。

## 3. 固定协作分工

用户只接收最终成果，不测试、不排错、不运行命令、不维护 Git。

ChatGPT 负责：

- 项目计划、架构和任务边界；
- 编写产品代码；
- 专项 verifier、集成测试、Windows Electron/CDP UI 自动化；
- 临时样本、截图审查、稳定回归和生产构建；
- Git 分支、PR、文档、diff 审查、合并与最终交付；
- 发现问题后继续修复并从头复测。

Codex 只处理 GitHub runner 无法替代的真实本机、硬件、驱动、商业软件、安装器或系统集成测试。Codex 只测试，不修改产品代码；结果返回后仍由 ChatGPT 修复和管理。

不得把可自动化的测试交给用户或 Codex。

## 4. 已完成主线

```text
U02～U08：产品化与真实性
U09～U23：渐进式结构与质量
U24～U26：日常 UI 去工程化
U27：Windows GUI 验收，历史结论 NO-GO
U28：资源库授权、真实 Index、浏览与播放闭环
U29：播放器、Seek、队列、续播与字幕全流程
```

### U28 事实

- 原生目录授权、当前窗口 token、设置、Index、首页、资源库、PlayerBar 和诊断共享同一会话。
- 合法空 Index、读取失败和损坏 JSON 明确区分。
- 多编码 Index 读取与真实媒体协议完成。
- MAJ-001、MAJ-002 已关闭。
- Windows Electron E2E 已成为永久回归。

### U29 事实

- HTMLAudio/mpv 使用真实续播位置。
- Seek 限制到音轨时长。
- 队列、历史和歌单不持久化当前窗口 token 或媒体 URL。
- 重新授权并读取 Index 后，持久化队列使用新 token。
- 未授权本地音轨不会退化成示例播放。
- 首页区分播放、暂停、等待授权和历史状态。
- 短音轨中途不会误判完成，旧错误历史会自动迁移。
- LRC、SRT、VTT、ASS、双语和无字幕已通过 Windows Electron E2E。

## 5. 当前任务：U30

```text
日常 UI、三主题、窗口、DPI、键盘与可访问性
```

范围：

- 首页、音声库、音乐库、详情、歌单、设置、PlayerBar、全屏播放器和 AI 维护；
- 1040×680、常规窗口和最大化；
- 100%、125%、150% DPI；
- 三主题；
- Tab、Enter/Space、Escape、焦点返回和 reduced-motion；
- 无黑屏、横向溢出、遮挡、不可点击区域、文本对比或状态文案矛盾。

默认使用 Windows Electron/CDP 自动生成截图矩阵和 DOM 布局断言，并由 ChatGPT 审查。只有真实显示器/DPI/驱动无法由 CI 覆盖时才交给 Codex。

## 6. U30 完成门槛

1. 关键页面在最小、常规和最大化窗口无布局断裂。
2. 三主题均无不可读文本、透明层错误或错误硬编码颜色。
3. 100%/125%/150% DPI 的关键区域可见且可操作。
4. 键盘和焦点行为满足既有合同。
5. reduced-motion 不出现持续装饰动画。
6. U28/U29 Electron E2E、全部 verifier、稳定回归和最终生产构建通过。
7. AI 审查所有关键截图，没有未解释 Blocker/Major。
8. 临时测试资产清理，最终 diff 只包含 U30 正式改动。

## 7. 后续唯一顺序

```text
U30：日常 UI、三主题、窗口、DPI、键盘
U31：导入器与数据安全
U32：Windows 发布候选、实际 mpv、portable、NSIS、安装升级卸载
U33：版本、Release Notes、tag、SHA-256、新 Beta
```

U33 前继续冻结：

- MVP130 正式下载器；
- 完整 AI Agent；
- SQLite 全面迁移；
- OpenList/WebDAV；
- Player Core v2；
- 全局 CSS 或全项目架构重写。

## 8. 每轮标准流程

```text
最新 main
→ 独立分支
→ 有限范围实现
→ 专项 verifier
→ Windows Electron E2E
→ 截图视觉审查
→ 完整稳定回归
→ 二次生产构建
→ 清理临时脚本
→ 最终 diff 审查
→ Ready
→ squash merge
→ 更新状态与交接
```

编译通过或字符串检查通过不能单独作为交付依据。关键链路必须验证最终 DOM、真实后端状态和截图。

## 9. 安全边界

- 真实媒体库默认只读。
- 可写测试只使用临时目录、合成样本或副本。
- 不删除、移动、覆盖、重命名或批量修改真实文件。
- Renderer 不暴露绝对路径、`file://` 或安全 token。
- 高风险导入、迁移、安装和发布必须独立验收。
