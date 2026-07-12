# NEW_CHAT_PROMPT_FULL

你接手的是 Yang-Kura，一个 React + Vite + TypeScript + Electron 的 Windows 本地音频媒体库，支持 ASMR/RJ 与普通音乐。当前数据路线是 Local JSON Index，SQLite 后置。

## 基线

- 稳定候选：`0.167.0-mvp129`
- GitHub main：`0.158.0-mvp120 / 55e33b3`
- Round 4 Windows 发布门禁：PASS
- MVP130：实验下载器，单独封存，禁止合入
- MVP131：停止

## 主要完成能力

本地扫描/index、音声与音乐资源库、HTMLAudio/mpv、字幕、歌单/队列/历史、外部打开、copy/move 导入、本地元数据、DLsite 单 RJ Provider、大库基准、缺失文件和索引维护、Windows portable/installer。

## 当前任务

完成 MVP129 稳定化清理、复验、最终源码包和 Git 提交。不要扩展功能。当前发布门禁是 `npm run verify:stable`；`verify:all` 是兼容别名。历史 MVP01～MVP111 快照已归档。

## 后续原则

Git 合入后先真实日常使用，按实际问题做最小修复。SQLite、批量元数据、系统媒体控制、下载器等必须由用户明确重新排序，不能沿旧待办表自动推进。
