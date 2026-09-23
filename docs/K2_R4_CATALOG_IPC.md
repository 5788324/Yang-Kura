# K2-R4 Catalog Query IPC

更新日期：2026-09-23

K2-R4 Core 已提供 CJK/trigram 搜索、keyset pagination 和行列表 virtualization。本收尾批次把 SQLite Query 安全暴露给 Renderer。

## Bridge

```text
Renderer
  ↓ requestCatalogQuery
Preload
  ↓ named IPC channel
Electron Main
  ↓ rootPathToken authorization
Catalog Query Service
  ↓
catalog.sqlite
```

支持：

- Collections page
- Tracks page
- Collection facets
- Folder children

禁止：

- Renderer 传数据库路径；
- 返回数据库绝对路径；
- 返回媒体 absolutePath；
- 返回 file://。

Catalog 尚未包含当前 Root 时返回 `k2-r4-catalog-query-not-ready`，旧 JSON 读链继续可用。

## Primary Read

本阶段不把现有旧页面强制改成 SQLite-only。K2-R5 会重做 App Shell / Library surfaces，新页面直接基于 Catalog Query 构建，避免“先完整改旧 UI → 再完整重做新 UI”的双重成本。
