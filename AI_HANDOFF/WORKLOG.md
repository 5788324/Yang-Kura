# Yang-Kura 工作日志

> 仅记录当前有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16

### U34～U36 — 架构、Design System 与 IPC 分域

- PR：#56～#61。
- 完成联合审计、关键行为冻结、统一 IPC、语义 Token、共享 UI、AppShell、Router 和 Main IPC 分域。

## 2026-07-17

### U37 — 正式媒体库页面

- PR：#62、#63、#69。
- 首页、音声库、RJ 详情和音乐库进入正式生产边界；音乐库支持歌曲、专辑、艺术家和文件夹四视图。

### Beta 2 个人日用版

- PR：#71；tag `v0.169.0-beta.2`；Release ID `355486824`。
- portable、setup 和 `SHA256SUMS.txt` 远端校验一致。

### U38 — 播放器结构治理

- PR：#73、#75、#77。
- Queue/History/Persistence、HTMLAudio/mpv Backend、Subtitle lifecycle 分离完成。

### U39 — 日常体验、门禁与最终验收

- PR：#78～#84。
- 完成播放器主题、AI 维护入口、授权持久化、浅色对比度、真实空状态、增量架构门禁和完整 Windows/打包验收。

## 2026-07-18

### U40-A — 个人项目快速维护规则

- PR：#85。
- 建立风险分级验证、单 PR 收口和核心文档集中维护规则。

### U40-B — 全产品用户旅程与交互覆盖

- PR：#86。
- 组合 U28～U32 与全产品 Electron 旅程。
- 结果：6/6 套件 PASS；635 个可见控件状态；65 条操作记录；14 条用户旅程；19 张截图；未覆盖 0；运行时错误 0。

### U40-C — UI 细节收口

- PR：#87。
- 收口浅色维护页、稀疏音乐集合、全屏歌词和窄设置页视觉问题。
- Windows Run `29626125281` 通过；Artifact `8423932306`。

### U40-D — 真实资源库稳定性与 Issue #66 收口

- PR：#88。
- 修复 U40-B01：Index 读取进入共享协调器，支持 15 秒超时、明确失败、重试、迟到成功和中断恢复。
- 修复 U40-B02：设置、顶栏、首页、音声库和音乐库统一使用同一读取会话状态。
- 修复 U40-B03：自动化 profile 隔离；日常启动清理旧测试队列、历史、歌单和缓存；真实库加载后移除无效旧队列与历史。
- 修复 U40-M01：旧版超大一级目录集合按 RJ 或实际作品/专辑目录重新分组，空集合移除。
- 修复 U40-M02：生产路由切换到轻量日常设置；旧工程设置和旧完整诊断退出运行时。
- U40-O01 保持环境 Observation；HTMLAudio 回退由 U29 验证。
- 消除 `fixtureLibraryScanner` 与 `virtualLibraryPathParser` 的历史相对导入循环；当前循环为 0。
- 新增 `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`，指定 `E:\arsm` 和 `D:\CloudMusic\VipSongsDownload` 的只读真实库全链路验收。
- 最终候选提交：`189c5a65cb024838cb288874e7c78f8e07b0671c`。
- U40-D Run `29628604275`，Artifact `8424721819`，digest `sha256:d577eed18e51ce8686149e6ac04c1eb9f6341e30b72d9462c3960ed93d244f37`。
- Documentation、Architecture、UI Fast、U40-C、U40-D、Branch Validation 和 U32 Packaging 全部 PASS。
- Issue #66 完成并关闭；旧设置/诊断源码只保留历史追溯，不再进入运行时。

## 当前结论

```text
U34～U40-D：完成
当前版本：0.169.0-beta.2
Beta 2：已发布并完成远端资产校验
Issue #66：已关闭
当前任务：按需日常维护
大型功能：长期冻结
```
