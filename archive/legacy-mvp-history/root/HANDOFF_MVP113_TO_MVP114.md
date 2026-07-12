# HANDOFF MVP113 → MVP114

MVP113 关闭 UI 无障碍标签阻塞项。MVP114 转入功能开发，加入本地元数据覆盖层。

当前版本：`0.152.0-mvp114`。

关键文件：

- `src/services/metadataOverrideService.ts`
- `src/App.tsx`
- `src/components/AsmrDetail.tsx`
- `scripts/verify-mvp114-local-metadata-overrides.mjs`

验证重点：人工修改音声作品后，重新读取 `library-index.json`，标题、社团、声优、标签、评分、状态和备注仍应保留。
