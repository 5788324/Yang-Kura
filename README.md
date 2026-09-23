# Yang-Kura

> 当前公开版本：`1.0.0-rc.1`
> U42 / PR #94：已合并
> 当前战略阶段：**Kura Desktop 2.0 · K2-R1 真实审计**
> 仓库策略：**main 唯一长期主线；历史通过 Git 追溯，不在当前树堆 archive/MVP 副本。**
> K2-R0 已收口：用户确认 `codex/k2-r0-validation-hygiene` 是上周最新可识别源码分支；审查未发现额外业务源码，仅包含验证卫生与交接修复。合并后 GitHub `main` 恢复为唯一代码真源。

Yang-Kura 是个人使用的 Windows 音频媒体库，面向 **ASMR/RJ 音声 + 普通音乐**。当前技术栈为 React、Vite、TypeScript、Electron；已经具备本地资源库、播放、字幕、歌单、导入、元数据和 Windows 打包等能力。

## 2026-09 项目重新定位

项目不再按“继续给 1.x 堆功能”的方式推进，而进入 **Kura Desktop 2.0**：

- 面向 **8TB+ 且持续增长** 的音声资源规模；
- ASMR/RJ 与音乐均为一级核心产品，不把音乐当附属功能；
- UI/UX 为硬指标：要求好看、惊艳、流畅、成熟，避免工程面板感；
- 优先复用成熟开源项目和已验证的工程思路，不从零重造播放器、WebDAV、移动端基础设施；
- 个人非商业项目：安全边界保持实用级，重点防误删、数据损坏、覆盖错误和不可恢复状态，不做企业级复杂权限体系。

## 当前优先级

1. **K2-R1：审计当前 Desktop 与真实 8TB+ 媒体库，确定瓶颈和保留/重做边界。**
2. Desktop 2.0 大库 Core：SQLite/FTS、增量扫描、缩略图缓存、分页/虚拟列表。
3. Desktop 2.0 UI/UX：重新设计 App Shell、音乐库、音声库和播放器体验。
4. 用真实 8TB+ 媒体库做性能与日常使用验收。
5. Desktop 2.0 稳定后，再进入 OpenList / Android.

Android、OpenList、Downloader、转录集成等暂不同时展开。

## 核心文档

新对话或新执行器必须按以下顺序读取：

1. `START_HERE.md`
2. `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
3. `PROJECT_STATE.md`
4. `TASKS.md`
5. `PROJECT_ROADMAP.md`
6. `AI_HANDOFF/WORKLOG.md`（仅用于历史追溯）

> 代码事实以 Git/GitHub 为准。不要在文档中把某个 `main` SHA 写成长期不变的“当前 HEAD”；需要 SHA 时实时读取 Git。
