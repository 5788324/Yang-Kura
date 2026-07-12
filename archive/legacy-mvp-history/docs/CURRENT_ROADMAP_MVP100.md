# Yang-Kura CURRENT ROADMAP — MVP100

当前版本：`0.138.0-mvp100`

## 当前阶段

MVP100 进入 copy-only 导入链路的真实 index patch 写入阶段：

```text
MVP95 copy-only executor
→ MVP96 OperationLog
→ MVP97 post-copy refresh preview
→ MVP98 library-index patch preview
→ MVP99 write readiness
→ MVP100 backup + write library-index.json patch
```

## 本轮目标

- 读取目标资源库内现有 `library-index.json`。
- 写入前创建同目录备份：`library-index.backup.before-mvp100-*.json`。
- 只合并 MVP98 `indexPatchPreview` 中的 `collections / tracks / covers / subtitles / warnings`。
- 按 `id` upsert，不删除既有数据。
- 写入后读回校验并返回 sanitized summary。

## 继续后置

- SQLite。
- 下载器。
- 元数据 Provider。
- mpv 后端。
- move-only 导入。
- 删除 / 清理 / 覆盖类操作。

## 个人项目边界

Yang-Kura 是个人本地项目，不分享、不商业化、不作为开源发布目标。安全边界按“预览、确认、备份、日志、失败不静默覆盖、不暴露真实路径”执行，不再套企业级审批流，避免浪费开发轮次。
