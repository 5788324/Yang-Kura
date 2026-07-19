# Yang-Kura 当前项目交接

## 0. 当前结论

Beta 3 仍为 `FAIL / NO-GO`。本轮已经从诊断阶段进入四个真实库阻断的合并修复阶段；候选尚未推送，不能视为验收完成。

```text
仓库：https://github.com/5788324/Yang-Kura.git
公开主分支：main
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
正式稳定版目标：1.0.0
PR：#91（Draft）
候选分支：release/beta3-daily-closeout
本轮 CI 修复父 SHA：6caf3ce347ea094d465856800d5071736e2ac159
真实资源库：E:\arsm
当前任务：修复 U40-D 工作流范围与 U40-B 旧 fixture，完成 CI 后进入固定 SHA 实机复测
发布状态：NO-GO
```

## 1. 用户确认的验收边界

- 允许直接扫描和读取 `E:\arsm`。
- 允许创建、覆盖和备份 `library-index.json`。
- 用户仍在持续下载资源，因此索引、作品数和音轨数可以变化。
- 资源库较大，读取超过 25 秒不单独判定失败。
- 必须保护音频、字幕、封面和专辑目录，不得删除、覆盖、异常移动或损坏。
- 用户不执行 Git、构建、测试或排错，只转发 ChatGPT 提供的实机提示词。

## 2. 最新正式 Windows 报告

固定基线：

```text
branch = release/beta3-daily-closeout
HEAD = origin = 1f839e5298d96a61ceaf8e4621b17244c0f8946a
tracked diff = 0
cached diff = 0
```

通过项：

- `E:\arsm` 扫描收敛：137 个作品或专辑、7145 条音轨；
- RJ00331318 详情页、14 条可播放音轨、14 条字幕；
- 第一条主区域与第二条行尾入口都能改变当前播放器状态；
- Queue=14、上一首/下一首、字幕和全屏歌词；
- 音频、字幕、封面、专辑目录数量未减少；
- 最终进程回收完成。

阻断项：

| 编号 | 证据 |
|---|---|
| B3-MAJ-001 | HTMLAudio 回退后 duration 长期为 `0:00`，progress 不推进，seek disabled |
| B3-MAJ-002 | `spawn mpv.exe ENOENT` |
| B3-MAJ-003 | 同 Profile 第二次启动长期“正在打开首页”，随后黑屏 |
| B3-MAJ-004 | 多个实际作品显示同一专辑封面 |

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

本地已通过：

- TypeScript `lint`；
- Renderer production build；
- Electron TypeScript build；
- 诊断探针语法、表达式和伪 CDP 自检；
- Range/MIME、封面候选唯一性、umbrella collection 独立封面运行时 verifier；
- U29 Player reliability；
- 当前字幕边界 verifier；
- 修改工作流 YAML 解析。

当前运行环境因 GitHub DNS 无法下载 Electron binary，所以真实 Electron GUI/E2E 留给 GitHub Actions 和 Windows 实机。

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

1. 使用本轮完整源码包覆盖固定父 SHA `6caf3ce347ea094d465856800d5071736e2ac159`。
2. Codex / DeepSeek 创建一个提交并推送到现有 PR 分支；ChatGPT 只读取 CI 结果和日志。
3. CI 全绿后由 Codex 使用固定新 SHA 执行纯 Windows 实机验收。
4. CI 通过后，使用新固定 SHA 在 `E:\arsm` 复测四个 B3-MAJ。
5. 播放、重启和封面通过后，再完成导入事务、冲突、失败回滚和 OperationLog。
6. 发布 Beta 3 后执行全项目 UI、功能和按钮全链路审查，清理遗留并正式发布 1.0.0。

## 7. 禁止事项

- 不提前合并 PR #91 或创建 Beta 3 Release。
- 不把自动 E2E 替代真实声卡、真实长音频和重启验收。
- 不删除或修改真实媒体本体。
- 不恢复巨型派生数组 localStorage 持久化。
- 不叠加已作废的旧补丁包。
- 不解冻下载器、SQLite、云同步、账号或插件市场等大型功能。
