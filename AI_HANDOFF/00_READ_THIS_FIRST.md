# AI_HANDOFF / 00_READ_THIS_FIRST

这是 Yang-Kura 当前 GitHub 主线的接手入口。

## 当前唯一可信基线

```text
核心版本：0.167.0-mvp129
GitHub branch：main
产品化增量：U02～U08 已合入
当前质量任务：U09 渐进式播放器视图结构优化
MVP130：独立实验下载器，禁止自动合入
```

不要再依赖旧文档中的固定 Git SHA。每次接手先读取 GitHub `main` 最新提交和已合并 PR，再以 `PROJECT_STATE.md` 校对阶段状态。

## 必读顺序

1. 根目录 `PROJECT_STATE.md`
2. 根目录 `PROJECT_ROADMAP.md`
3. 根目录 `README.md`
4. `docs/U09_PLAYER_HOOKS_PROGRESS_BASELINE.md`
5. `01_CURRENT_STABLE_BASELINE.md`
6. `03_PROMPT_POLICY.md`
7. 根目录 `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`

## 当前开发原则

- 核心功能主线已经完成，不根据历史 MVP 待办自动扩展新模块。
- UI、结构和质量采用小范围、可验证、可回退的增量修改。
- 只拆当前正在修改且职责明显拥挤的文件。
- 不为了“代码更漂亮”重写播放、导入、索引和文件操作稳定链。
- 每个 PR 必须通过 Windows 自动门禁后再合并。
- Windows GUI 完整用户流程与发布链仍需在新 Beta 前重新验收。

## 当前 U09 边界

允许：

- 抽离全屏播放器键盘/焦点生命周期 Hook；
- 抽离黑胶与唱臂的 reduced-motion 动画 Hook；
- 更新过期项目状态和路线文档；
- 增加专项 verifier。

禁止：

- 修改播放、Seek、队列、字幕、书签或存储行为；
- 修改 mpv、HTMLAudio、Electron main、Importer 或 Index 写入；
- 合入下载器或启动 SQLite；
- 大规模拆分 `LyricsPanel.tsx` 的全部 UI。

## 当前剩余路线

```text
渐进式结构/质量优化
→ Windows GUI 全流程验收
→ 定向缺陷修复
→ Electron / portable / NSIS 发布链复验
→ 新 Beta 版本和最终交接
```

归档的旧 MVP 文档只用于历史追溯，不作为自动任务来源。
