# IMPORTER_DAILY_UI_CLEANUP_MVP107

版本：`0.145.0-mvp107`

## 目标

`MVP107 importer daily UI cleanup` 的目标是降低导入器主页面工程感。

本轮新增 `mvp107-importer-daily-ui-cleanup-v1`：

```text
用户日常入口
→ 选择来源
→ 查看预览
→ 处理冲突
→ 选择复制 / 移动
→ 完成后刷新资源库
```

## 用户界面策略

导入器主页面保留：

```text
选择来源
导入预览
冲突提示
目标路径
copy / move 执行方式
结果摘要
错误提示
```

默认折叠到 `mvp107-importer-ai-maintenance-fold` 的内容：

```text
MVP86-MVP106 历史工程说明
IPC channel
contract / stub / verifier
sourceRootToken / targetRootToken
absolutePath / file:// / fs.* 禁止项
AI 维护说明
```

## 保留工程说明的原因

用户本人不会看，也不会维护这些说明。

这些说明仍然保留，因为：

```text
方便 AI 接手
方便快速定位边界
方便 verifier 检查
方便后续小步开发
```

## 本轮没有改变

```text
不改 copy-only executor
不改 move-only executor
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不返回 absolutePath
不返回 file://
Codex 非必要不安排
```

## 验收

必须通过：

```text
npm run lint
npm run build:electron
npm run verify:mvp107-importer-daily-ui-cleanup
npm run build
npm audit --audit-level=high
```
