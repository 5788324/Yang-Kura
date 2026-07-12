# HANDOFF MVP127 → MVP128

## 版本

`0.166.0-mvp128`

## 已完成

- 受控失效索引写入 IPC。
- 固定确认文本和二次确认 UI。
- 源 `library-index.json` SHA-256 复核。
- 同目录自动备份。
- 索引记录清理算法及级联引用清理。
- 写入后读回结构和 SHA 校验。
- 失败回滚尝试。
- 成功后重新读取 index 并触发 UI 刷新。
- 媒体文件零删除保证。

## 推荐验证

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp127-missing-index-management
npm run verify:mvp128-controlled-index-cleanup
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

真实 Windows 验收应只使用临时测试资源库，先人为删除一个测试音频，再检查、预览、确认写入，确认备份存在、index 已移除记录、源媒体目录没有额外文件变更。
