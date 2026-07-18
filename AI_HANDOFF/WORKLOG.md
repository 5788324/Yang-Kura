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
- Codex 范围压缩为真实音乐库只读链和 `%TEMP%` 临时副本写入/回滚链。
- Beta 2 发布记录保持冻结；大型功能继续冻结。

## 当前结论

```text
U34～U40-D3：完成
公开版本：0.169.0-beta.2
候选版本：0.170.0-beta.3
当前任务：Beta 3 正式日用发布收口
Issue #66：已关闭
大型功能：长期冻结
```
