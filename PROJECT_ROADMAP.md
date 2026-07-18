# PROJECT_ROADMAP

> 长期路线真源。公开代码事实以 GitHub `main` 为准；Beta 3 候选状态以 PR #91 和最新有效 Codex 报告为准。

## 1. 当前基线

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
PR：#91
候选分支：release/beta3-daily-closeout
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
当前主线：暂停开发并重新诊断 B3-MAJ-001
发布状态：NO-GO
大型功能：长期冻结，按用户明确需求单独启动
```

## 2. 已完成主线

- U34～U37：统一 IPC、语义 Token、AppShell 和正式媒体库页面。
- U38：Queue/Persistence、Player Backend、Subtitle lifecycle 分域。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。
- U40-A～C：快速维护、全产品旅程和 UI 收口。
- U40-D～D3：真实库读取、分组、独立 Profile、单实例、主题、歌单、导入页、mpv 和 HTMLAudio 停滞状态收口。
- Beta 2：已发布并完成远端资产校验。

## 3. 阶段 A：Beta 3 阻断诊断

1. 读取 `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md` 和 `docs/BETA3_BLOCKER_STATUS.md`。
2. 拉取并锁定 PR #91 最新 branch/SHA。
3. 比较 `0cc9779e...` 到当前 HEAD 的播放器、TrackRow、测试和工作流改动。
4. 不使用 v1/v2/v3 本地包作为补丁来源。
5. 让测试在失败时记录完整 PlayerState、renderer console、HTMLAudio 事件、mpv 事件和 IPC 结果。
6. 先判断第二条音轨实际处于未切换、resolving、mpv、html-audio 或 unsupported 中的哪一种。

## 4. 阶段 B：Beta 3 单一最小修复

完成条件：

```text
第一条主区域播放 PASS
第二条行尾按钮播放 PASS
第二条切换后 duration > 0
progress 推进
pause / resume / seek PASS
重启恢复 PASS
进程回收 PASS
```

只允许一个证据驱动的最小修复候选。失败后先分析证据，不连续叠加猜测性补丁。

## 5. 阶段 C：Beta 3 发布前实机范围

播放器专项通过后才执行：

- `%TEMP%\YangKura-Beta3-Acceptance` 中的 Index 备份与恢复；
- copy-only；
- move-only；
- 同名冲突；
- 人为失败和回滚；
- OperationLog；
- `D:\CloudMusic\VipSongsDownload` 真实目录只读核对，禁止写 Index；
- 同步 package 与 lockfile 到 `0.170.0-beta.3`；
- 最终 L3 CI、合并 PR #91、创建 Beta 3 prerelease 并回读资产。

## 6. 阶段 D：1.0 全产品审查

Beta 3 发布后立即进入 1.0 收口，不开展新大型功能。

### 6.1 UI 与入口清单

- 枚举所有生产路由、页面、详情页、弹窗、菜单、工具栏、列表行操作、播放器控件、设置项、快捷键和外部打开入口。
- 对照源码与实际界面建立唯一清单，删除或标记不可达的历史入口。
- 检查中文文案、图标、禁用态、焦点态、加载态、空状态、错误态和恢复动作。

### 6.2 全功能链路审查

每个按钮和交互必须验证：

```text
用户动作
→ Renderer 事件
→ Hook / Store / Service
→ IPC / Electron Main
→ 本地文件系统、Index、播放器或外部程序
→ 成功结果
→ 状态刷新
→ 错误提示、取消、回滚或重试
```

重点覆盖：

- 首页、音声库、RJ 详情、音乐库及分组详情；
- 搜索、筛选、收藏、歌单、Queue、History、续播；
- HTMLAudio、mpv、fallback、Seek、音量、静音、字幕和全屏；
- Index 扫描、读取、备份、恢复、维护和损坏处理；
- copy-only、move-only、冲突、失败回滚和 OperationLog；
- 元数据覆盖、恢复、DLsite Provider；
- 设置、主题、窗口、单实例、快捷键；
- portable、NSIS、安装、升级、重复安装、卸载和用户数据保留。

### 6.3 自动化与缺陷收口

- 扩充可重复的定向 E2E，而不是依赖手工逐页观察。
- Blocker/Major 全部清零；无效按钮、死入口和错误状态必须清理。
- 只有触及 Electron Main、依赖、安装器或数据格式时才执行对应 L3 全链。

## 7. 阶段 E：Codex 1.0 实机验收

自动化和代码审查通过后，由 ChatGPT 生成一次完整 Codex 提示词，用户转发即可。

Codex 必须：

- fetch 指定 branch/SHA，基线不一致时只报告 `BASELINE_INVALID`；
- 在真实 Windows、真实媒体目录、真实 GUI、声卡和文件系统上验证；
- 按页面和功能矩阵记录 PASS/FAIL/NOT TESTED；
- 保存命令、截图、日志、进程状态、安装卸载结果和缺陷清单；
- 不自行开发、不改变需求、不生成未授权补丁。

Codex 报告无 Blocker/Major 且必要项全部 PASS 后，才能进入 1.0 发布。

## 8. 阶段 F：清理与 1.0.0 发布

- 删除不可达旧页面、废弃组件、重复脚本、无效工作流、临时候选、过期报告和构建遗留。
- 删除前确认没有生产路由、测试、构建或发布链引用。
- 更新依赖和版本元数据，但不进行无收益的大规模技术迁移。
- 执行最终 Windows 构建、portable/NSIS、安装升级卸载、数据保留、进程回收和资产校验。
- 发布 `1.0.0` 正式版，回读目标提交、资产名、大小和 SHA-256。
- 同步 README、PROJECT_STATE、PROJECT_ROADMAP、WORKLOG、交接文档和 Release Notes。

## 9. 1.0 后维护模式

默认优先级：

```text
真实 Bug
→ 数据 / Index / 导入 / 播放 / 进程
→ 字幕 / 搜索 / UI / 性能
→ 明确的小功能
→ 修改链路内的必要技术债
```

不制定大型版本路线，不主动解冻大型模块。下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、转录正式接入、云同步、账号和插件市场，只有用户明确提出实际需求后才单独评估和立项。

## 10. 执行工作流

```text
锁定远端基线并拉取一次
→ 本地完成分析、开发、批量修改、自动测试和文档
→ 整理 1～2 个逻辑提交
→ 统一推送一次
→ 运行必要 CI
→ 需要实机时输出 Codex 提示词
→ 用户转发，Codex 按固定 SHA 验收
→ ChatGPT 处理报告、合并和发布
```

禁止逐文件远程提交、边改边推、重复触发 CI 和临时补丁分支。真实 CI 失败时最多追加一次修复推送。