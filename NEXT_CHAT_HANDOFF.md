# NEXT_CHAT_HANDOFF

## 必须先知道

```text
当前稳定候选：0.167.0-mvp129
GitHub main：0.158.0-mvp120 / 55e33b3
Round 4 Windows 发布门禁：PASS
MVP130：实验下载器，独立保存，禁止合入
当前任务：稳定化、最终包、Git 合入；不是开发新功能
```

## 最近完成的稳定化

- Round 1：MVP129/MVP130 基线隔离和 ZIP 完整性审计。
- Round 2：当前核心自动化链通过，确认旧 `verify:all` 编排失效。
- Round 3：Windows 发现 mpv JS fixture 和 electron-builder blockmap 两个 P1。
- Round 4：修复两个 P1；Windows portable、installer、启动、卸载和进程清理全部 PASS。
- Round 5：精简依赖、归档历史资料、统一入口文档和稳定回归入口。

## 当前验证命令

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
npm run verify:stable
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
npm audit --audit-level=high
```

`verify:all` 已兼容地改为 `verify:stable`。历史 MVP01～MVP111 verifier 在 `archive/legacy-mvp-history/`，不再运行。

## 安全边界

- 不暴露 `absolutePath` / `file://` 给 Renderer。
- 不自动删除、覆盖或整理真实媒体文件。
- move-only 仅限受控小样本和二次确认。
- 索引写入/恢复必须备份、SHA 复核和读回验证。
- 不接 SQLite。
- 不合入 MVP130。

## 后续开发主线

完成 Git 合入后，先进行真实日常使用观察，只修明确 Bug。下一项大功能必须由用户重新选择；不要根据旧 Roadmap 自动进入下载器。
