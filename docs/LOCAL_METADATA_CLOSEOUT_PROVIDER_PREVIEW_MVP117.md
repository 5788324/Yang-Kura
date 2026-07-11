# MVP117 本地元数据收口与单个 RJ 预览

## 已完成

本地元数据覆盖层现在支持 ASMR、音乐专辑和曲目编辑，搜索、单项还原、备份预览、合并或替换恢复均已接通。

MVP117 增加 Provider 中立的单个 RJ 预览合同：

```json
{
  "schemaVersion": 1,
  "provider": "dlsite",
  "rjId": "RJ01234567",
  "title": "作品标题",
  "circle": "社团",
  "cvs": ["声优"],
  "releaseDate": "2026-01-01",
  "description": "简介",
  "tags": ["耳かき"]
}
```

流程：

```text
粘贴单个 RJ 查询结果
→ 校验来源和 RJ 号
→ 预览字段差异
→ 手动填入当前编辑表单
→ 用户再次点击保存
```

## 边界

- 不自动保存。
- 不自动覆盖本地修改。
- 不连接 DLsite、ASMR.one 或其他网站。
- 不写入媒体文件标签。
- 不存储绝对路径或 `file://`。
- 不接 SQLite。
