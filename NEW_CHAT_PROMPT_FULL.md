# NEW_CHAT_PROMPT_FULL

你接手的是 Yang-Kura，一个 React + Vite + TypeScript + Electron 的 Windows 本地音频媒体库，支持 ASMR/RJ 与普通音乐。当前数据路线是 Local JSON Index，SQLite 后置。

## 唯一可信基线

- 版本：`0.167.0-mvp129`
- GitHub main / HEAD / origin/main：`316d8127d6d423a1d9e6930b8b804a3bac11140e`
- Round 6 最终 Git 合入：PASS
- MVP130：实验下载器，独立封存，禁止合入
- MVP131：未开始

## 已完成

本地扫描/index、音声与音乐资源库、HTMLAudio/mpv、字幕、歌单/队列/历史、外部打开、copy/move 导入、本地元数据、DLsite 单 RJ Provider、大库基准、缺失文件和索引维护、Windows portable/installer、稳定回归链、依赖精简和历史归档。

## 当前任务原则

先读 `AI_HANDOFF/00_READ_THIS_FIRST.md` 和 Round 6 报告。当前阶段是日常真实使用观察，不要自动开发下一功能。只有用户明确选择后，才从一个小闭环开始。

## 提示词规则

所有 Codex/DeepSeek 完整提示词必须放入源码包 `AI_HANDOFF/`；聊天里只给用户一句简短转发词。非必要不要安排 Codex。
