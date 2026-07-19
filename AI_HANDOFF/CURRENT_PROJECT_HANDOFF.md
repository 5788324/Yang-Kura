# Yang-Kura 当前项目交接

## 0. 当前结论

Beta 3 当前为 `PARTIAL / NO-GO`。远端 R5 基线和全部 CI 已通过，Windows 实机已关闭播放、mpv 缺失回退和重启黑屏；但实机使用的 TrackRow 直接点击加固尚未提交，真实多专辑封面与导入事务门禁仍未完成。

```text
仓库：https://github.com/5788324/Yang-Kura.git
公开主分支：main
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
PR：#91（Draft）
候选分支：release/beta3-daily-closeout
PR 当前远端 HEAD：84e3caabec37a8de3843a51068b15bce76385524
真实资源库：E:\arsm
当前任务：交付 R6 TrackRow 直接点击加固，并完成封面与导入事务定向门禁
发布状态：PARTIAL / NO-GO
```

## 1. 用户确认的验收边界

- 允许直接扫描和读取 `E:\arsm`。
- 允许创建、覆盖和备份 `library-index.json`。
- 用户仍在持续下载资源，因此索引、作品数和音轨数可以变化。
- 资源库较大，读取超过 25 秒不单独判定失败。
- 必须保护音频、字幕、封面和专辑目录，不得删除、覆盖、异常移动或损坏。
- 用户不执行 Git、构建、测试或排错，只转发 ChatGPT 提供的实机提示词。

## 2. 最新 Windows R5 报告

基线：

```text
branch = release/beta3-daily-closeout
remote HEAD = 84e3caabec37a8de3843a51068b15bce76385524
fresh clone = 84e3caabec37a8de3843a51068b15bce76385524
local acceptance delta = TrackRow 直接 onClick，加固尚未提交
```

实机通过：

- `E:\arsm`：137 个作品或专辑、6979 条音轨；
- RJ00331318：14 条可播放音轨、14 条字幕音轨；
- 第一条主区域 queue=14、duration=3:12、progress 正常；
- 暂停/恢复、Seek 到约 1:16；
- 第二条行尾 duration=14:43、progress 正常；
- 上一首/下一首、音量 75%、静音/取消静音；
- HTMLAudio 后端，无错误；
- 同 Profile 重启后自动读取真实库并从第二条约 3:00 继续；
- 正常关闭后 Electron/mpv 进程为 0；
- 音频 8086、字幕 11149、封面 4895、专辑目录 267，均未减少。

门禁结论：

| 项目 | 状态 |
|---|---|
| B3-MAJ-001 duration/progress | PASS |
| B3-MAJ-002 mpv 缺失回退 | PASS |
| B3-MAJ-003 同 Profile 重启黑屏 | PASS |
| B3-MAJ-004 多专辑封面 | PARTIAL，自动化 PASS，真实视觉证据待补 |
| TrackRow 直接点击加固 | 待 R6 进入远端 |
| 导入事务 | 待真实小样本验收 |

声音输出只由播放状态、duration 和 progress 证明；文本自动化无法替代人耳确认物理声卡。

## 3. 本轮根因与候选修复

### 播放

- `yang-kura-media://` 不再依赖 `net.fetch(file://)`；改为明确的 MIME、Content-Length、Accept-Ranges、206 Range、416 和流式文件响应。
- 新 Profile 默认使用 HTMLAudio；mpv 作为用户显式启用的可选增强后端。
- 启动 mpv 前检查安装状态，未安装时直接回退，不再产生 `ENOENT` 子进程错误。

### 重启与大 Index

- 不再把映射后的 7000+ 音轨数组重复写入 `sqlite_rj_works` / `sqlite_music_albums` localStorage。
- 完整读取结果超过 2 MB 时仅保留内存态和轻量会话摘要，避免 localStorage 同步解析拖垮 Renderer。
- 应用重启后使用持久化 root token 重新读取真实 `library-index.json`。
- 大库读取等待上限调整为 120 秒。

### 封面

精确根因：上级 umbrella collection 拆分成多个 RJ 作品时，旧规范化逻辑把同一个 `collection.cover` 扩散到所有子专辑。

候选修复：

- 每个拆分后的 RJ collection 只从自身目录内的 cover/image 候选选择封面；
- 支持 cover/folder/front/jacket、RJ 编号、作品目录名及中日文封面名称；
- 结合目录深度、扩展名、文件尺寸和 icon/logo/banner 排除规则评分；
- 没有匹配封面时清空继承 cover，使用各专辑独立占位图；
- `CoverArtwork` 在 `src` 改变时重置失败状态。

## 4. 自动验证状态

远端 `84e3caab...` 已通过：Documentation、Architecture、Branch、Player Fast、U40-B、U40-D、U32、Personal Beta 3 Release scope 等全部 9 条工作流。

R5 Windows 工作区在 TrackRow 直接点击加固后通过：

- TypeScript lint、Renderer build、Electron build；
- Beta 3 详情页物理点击 E2E；
- Beta 3 runtime-hardening；
- handoff、U40-D focused、U28、U30；
- MVP126 50,000 音轨、MVP129 Index maintenance；
- 完整 `verify:stable`；
- U40-B full-product Journey。

R6 E2E 新增对 `data-track-row-activation=direct` 的明确断言，避免旧 capture 实现回归。

## 5. Git 工作方式

```text
锁定 branch/SHA 并只读拉取一次
→ ChatGPT 在本地批量完成代码、测试和文档
→ 交付完整源码包、补丁和自测报告
→ Codex / DeepSeek 创建一个 commit 并推送一次
→ ChatGPT 只读检查定向 CI
→ Codex 固定新 SHA 做 Windows 真实库验收
```

- 一个任务只使用一个分支、一个 PR。
- 不逐文件提交，不反复触发 CI。
- ChatGPT 只读拉取 GitHub，在本地完成开发、自动测试、文档和源码包；不创建 Blob、Commit，不更新分支或 PR。
- Codex / DeepSeek 负责把完整源码包应用到固定 SHA，创建单一提交并推送；Codex 继续负责 Windows GUI、真实媒体、声卡、mpv 和重启验收。
- PR #91 继续保持 Draft，实机必要项通过前不得合并。

## 6. 下一步

1. Codex / DeepSeek 从 `84e3caab...` 应用 R6 完整源码包，只创建一个提交并推送一次。
2. ChatGPT 只读核对新 SHA 和定向 CI。
3. Codex 只做短版固定 SHA 复核：第一条主区域、第二条行尾、进程回收。
4. 抽查至少 12 个不同真实专辑的封面，保存截图或可核对路径。
5. 使用 `%TEMP%` 小样本验证 copy/move、冲突、失败回滚和 OperationLog。
6. 全部 PASS 后才允许同步版本、合并 PR #91 和创建 Beta 3 prerelease。
7. Beta 3 后执行全项目 UI、功能和按钮全链路审查，清理遗留并正式发布 1.0.0。

## 7. 禁止事项

- 不提前合并 PR #91 或创建 Beta 3 Release。
- 不把自动 E2E 替代真实声卡、真实长音频和重启验收。
- 不删除或修改真实媒体本体。
- 不恢复巨型派生数组 localStorage 持久化。
- 不叠加已作废的旧补丁包。
- 不解冻下载器、SQLite、云同步、账号或插件市场等大型功能。
