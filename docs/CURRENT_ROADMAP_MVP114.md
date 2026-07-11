# Yang-Kura MVP114 当前路线

当前源码版本：`0.152.0-mvp114`。

MVP114 开始本地元数据管理阶段，并把原计划中不必拆开的工作合并到同一轮：

- 建立版本化 `MetadataOverrideStoreV1`；
- 支持 ASMR 作品标题、社团、声优、日期、简介、标签、评分、收听状态和备注覆盖；
- 预留音乐专辑和曲目覆盖模型；
- 复用现有音声详情编辑器；
- 资源库 index 重新读取后自动重新应用人工覆盖；
- 使用独立 localStorage key，不修改扫描生成数据和真实音频标签。

后续优先级：音乐元数据编辑、覆盖数据导入/导出、再评估是否写入独立 `metadata-overrides.json`。联网 Provider、SQLite、mpv、下载器继续后置。
