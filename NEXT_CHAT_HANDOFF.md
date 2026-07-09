# NEXT_CHAT_HANDOFF

## 当前状态

```text
Yang-Kura 0.146.0-mvp108
React + Vite + TypeScript + Electron
Local JSON Index 优先，SQLite 后置
导入器阶段已收尾，当前暂停开发并审查
```

## 已完成

```text
真实资源库选择 / 扫描 / index 写读 / UI 显示
本地音频播放
字幕读取
外部打开
播放历史 / 队列 / 歌单 / 封面基础
copy-only 导入完整闭环
move-only 小样本执行闭环
导入器日常 UI 简化
导入器最终回归清单
```

## 本轮整理结果

```text
更新 README / PROJECT_STATE / PROJECT_ROADMAP / RUN_ME_FIRST / NEXT_CHAT_HANDOFF
新增 docs/PROJECT_OVERVIEW.md
新增 docs/PROJECT_FILE_CLEANUP_MVP108.md
新增 docs/IMPORTER_SMOKE_TEST_MVP108.md
新增 scripts/smoke-importer-file-ops.mjs
新增 npm script: test:importer:smoke
新增 .gitignore
移除源码包内 .npm-cache
```

## 导入器 smoke test

已新增并验证：

```bash
npm run test:importer:smoke
```

测试范围：临时目录内 copy-only、index backup/patch、move-only、operation log。不会触碰真实媒体库。

## 下一步建议

不要马上继续新功能。先做人工小样本检查：

```text
1. copy-only 小样本导入
2. move-only 小样本导入
3. 首页 / 音声库 / 音乐库刷新
4. 播放 / 字幕 / 外部打开回归
5. 打包版启动与导入器页面检查
```

## 禁止插队

```text
下载器
SQLite
mpv
元数据全库自动抓取
大批量 move
自动删除 / 自动覆盖 / 自动清理源目录
```

Codex 非必要不安排。需要 Codex 时，必须同一轮直接给完整提示词。
