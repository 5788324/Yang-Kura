# HANDOFF MVP128 → MVP129

MVP129 完成索引维护阶段收口：备份列表、手动恢复、维护历史、过期备份纯预览和临时库验收工具。

核心安全规则：

- 恢复必须确认并核对备份 SHA-256；
- 恢复前必须备份当前 index；
- 过期备份只有预览，没有删除 API；
- 所有操作只影响 `library-index.json` 与其备份；
- 真实媒体文件不删除、不移动、不重命名；
- Renderer 不接收 absolutePath / file://。
