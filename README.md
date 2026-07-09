# Yang-Kura

Yang-Kura 是一个**个人本地音频媒体库**，面向 Windows 桌面端，支持 ASMR/RJ 音声库与普通音乐库。项目不面向商业、不对外发布、不作为开源产品运营；开发优先级是个人可用、数据可回退、AI 易维护。

## 当前状态

```text
当前基线：0.146.0-mvp108
阶段：导入器阶段收尾 / 暂停新增功能 / 进入整理审查
技术栈：React + Vite + TypeScript + Electron
数据路线：Local JSON Index 优先，SQLite 后置
```

## 已完成主链路

```text
选择本地目录
→ dry-run 扫描
→ 写入 / 备份 library-index.json
→ 读取 index 到音声库 / 音乐库
→ 本地音频播放
→ LRC / SRT / VTT / ASS 字幕读取
→ 图片 / 视频 / 文件外部打开
→ Windows portable / installer 打包基础
→ 播放历史 / 队列 / 歌单 / 封面基础
→ copy-only 导入闭环
→ move-only 小样本执行闭环
→ 导入器日常 UI 收口
```

## 导入器状态

| 链路 | 状态 | 说明 |
|---|---|---|
| copy-only | 已闭环 | 推荐日常方式；copy、OperationLog、post-copy refresh、index patch、backup、UI refresh 已收口。 |
| move-only | 小样本闭环 | 支持小样本受控 move；必须二次确认、禁止覆盖、失败停止、写日志；不建议直接放开大批量。 |
| UI | 已简化 | 主页面保留日常入口；工程说明折叠到 AI 维护区 / 诊断页。 |

## 当前不做

```text
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv 后端
不做大批量 move
不做自动删除 / 自动覆盖 / 自动清理源目录
不向 Renderer 暴露 absolutePath / file://
```

## 推荐命令

```bash
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache .npm-cache
npm run lint
npm run build:electron
npm run verify:mvp108-importer-final-regression-checklist
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

## 文档入口

| 文档 | 用途 |
|---|---|
| `PROJECT_STATE.md` | 当前状态。 |
| `PROJECT_ROADMAP.md` | 后续规划。 |
| `RUN_ME_FIRST.md` | 新对话 / 新机器开工前先读。 |
| `NEXT_CHAT_HANDOFF.md` | 下一轮接手摘要。 |
| `docs/PROJECT_OVERVIEW.md` | 项目介绍文档。 |
| `docs/PROJECT_FILE_CLEANUP_MVP108.md` | 本轮文件整理说明。 |
| `docs/IMPORTER_SMOKE_TEST_MVP108.md` | 导入器自动化 smoke test 说明。 |

## 关于历史文件

仓库根目录仍保留大量 `HANDOFF_MVPxx_TO_MVPxx.md` 和 `PACKAGE_MANIFEST_MVPxx_HANDOFF.txt`。它们主要服务旧 verifier 与 AI 维护，不是日常阅读入口。不要手动阅读全部历史文件；优先读上面的文档入口。
