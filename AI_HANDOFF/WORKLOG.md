# Yang-Kura 工作日志

> 仅记录当前有效交付。代码与合并事实以 GitHub `main` 和对应 PR 为准。

## 2026-07-16～2026-07-17

- U34～U37：架构、Design System、IPC 分域和正式媒体库页面完成。
- Beta 2：PR #71；tag `v0.169.0-beta.2`；Release ID `355486824`；portable、setup、SHA256SUMS 远端一致。
- U38：Queue/History/Persistence、HTMLAudio/mpv Backend、Subtitle lifecycle 分离。
- U39：日常体验、授权持久化、架构门禁和完整 Windows/打包验收。

## 2026-07-18

### U40-A～U40-C

- PR #85～#87：快速维护规则、全产品用户旅程与 UI 细节收口。
- U40-B：6/6 套件 PASS；635 个可见控件状态；65 条操作；14 条旅程；19 张截图；未覆盖 0；运行时错误 0。

### U40-D～U40-D3

- PR #88：读取协调、跨页面状态、测试污染、真实库分组、轻量设置和 Issue #66 收口。
- PR #89：独立 Profile、单实例、歌单 `$0`、主题同步和导入页工程术语修复；`E:\arsm` 读取为 75 个集合、3540 条轨道；三次重启和进程回收通过。
- PR #90：HTMLAudio 元数据与启动增加 10 秒超时；失败停止伪播放并提示选择 mpv。

### Git Fast Lane v2

- 项目级默认规则写入 `docs/GIT_FAST_LANE_V2.md`、`PROJECT_STATE.md` 和当前交接。
- 一个任务一个分支/PR；1～2 个逻辑提交；一次最终 CI；禁止临时补丁工作流；多文件批量提交；L0～L3 分级验证。
- GPT/AI 项目记忆更新：用户不承担 Git/测试/发布，当前唯一主线为 Beta 3 正式日用发布收口。

### Beta 3 正式日用发布收口 — 进行中

- 目标版本：`0.170.0-beta.3`；tag `v0.170.0-beta.3`。
- 新增独立 Beta 3 发布计划、Release Notes、自动构建/安装/发布工作流和远端资产验证脚本。
- PR 候选只构建验证；合入 main 后自动创建 prerelease。
- Beta 2 发布记录保持冻结；大型功能继续冻结。
- 首次 Codex 专项基线有效：真实音乐目录因无既有 Index 保持只读；临时音声样本扫描、Index 写入、重启后读取和进程回收通过。
- 首次专项发现阻断项 `B3-MAJ-001`：已索引 WAV 点击播放后未进入全局播放器；同时记录根目录作品显示 `root`。报告结论为 `PARTIAL / NO-GO`，因此 PR #91 未合并、Release 未创建。
- 首轮修复完成作品命名和播放状态优先写入，但第二次 Codex 专项仍在正确基线 `0cc9779e...` 上复现：合法 38.009 秒 WAV 显示 1 条可播放音轨，主区域与行尾播放按钮均未进入播放器，队列为 0；结论 `FAIL / NO-GO` 有效。
- 补齐此前缺失的详情页行级真实鼠标 E2E。验证证明点击入口修复后音轨和队列可进入播放器，但 HTMLAudio 已处于 `html-audio` 时真实 duration 仍为 0。
- 根因定位为 `loadedmetadata` 时序竞态：事件早于 `playbackMode = html-audio`，旧回调因此丢弃真实时长。修复按 audio dataset 中的当前 track ID 写回 duration，并在 fallback 完成时再次同步当前音轨和队列。
- 修复提交：行级入口 `94d5ca0a...`；HTMLAudio 时长竞态 `1655bcce...`；最终代码候选 `b5327d68...`。
- Player Fast Validation `29640816385` PASS：两份 Index 时长为 0 的 WAV 通过真实 CDP 鼠标点击两个入口，HTMLAudio 分别回填 8 秒、9 秒，队列均为 2，页面/控制台错误为 0。
- Beta 3 Windows 候选构建 `29640816414` PASS：TypeScript、Renderer/Electron build、focused regressions、portable、NSIS、安装和页面 readiness 全部通过；PR 上发布 Job 按设计跳过。
- 下一证据：只复测最新候选的 B3-MAJ-001；通过后补完临时副本备份、copy/move、冲突、失败回滚、OperationLog 和真实音乐目录只读链。不得重跑全产品或发布打包链。

## 当前结论

```text
U34～U40-D3：完成
公开版本：0.169.0-beta.2
候选版本：0.170.0-beta.3
当前任务：Beta 3 播放阻断最终实机复测
PR #91：开放，禁止提前合并
Beta 3 Release：尚未创建
Issue #66：已关闭
大型功能：长期冻结
```
