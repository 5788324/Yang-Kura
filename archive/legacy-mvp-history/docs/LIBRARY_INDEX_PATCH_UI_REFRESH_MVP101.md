# LIBRARY_INDEX_PATCH_UI_REFRESH_MVP101

## 目标

MVP101 解决 MVP100 后的体验断点：`library-index.json` patch 已经写入，但用户还需要手动去设置页重新读取 index，音声库 / 音乐库才更新。

本轮新增 `refresh-after-write` 语义：

```text
MVP100 patch write complete
→ MVP101 read current library-index.json
→ Renderer persist read result
→ dispatch yang-kura-library-index-loaded
→ App 复用既有映射逻辑刷新 UI
```

## 新增 IPC

```text
yang-kura:import:library-index-patch:refresh-after-write
```

请求模式：

```text
mode = refresh-after-patch-write
sourcePatchWriteVersion = mvp100-library-index-patch-write-v1
patchWriteStatus = mvp100-library-index-patch-write-complete
```

## Renderer 刷新路径

使用既有机制，不新增第二套全局状态系统：

```text
localStorage key: yang_kura_last_read_library_index_result
event: yang-kura-library-index-loaded
```

`App.tsx` 已经监听该事件并调用 `libraryIndexAdapter.fromLocalJsonIndexToAppData`，因此 MVP101 只需保证 patch 写入后能触发同一路径。

## 安全边界

MVP101 只读，不再写 index。

```text
不写 library-index.json
不接 SQLite
不触发全量扫描
不 copy / move / delete / rename
不返回 absolutePath
不返回 file://
```

## Codex 最小实机验收

Codex 额度少，只建议跑以下必要实测：

```text
1. 启动打包版或 desktop:preview。
2. 选择小样本目标库，确认已有 library-index.json。
3. 执行 copy-only 导入 → MVP100 patch 写入。
4. 确认 MVP101 自动读取 index。
5. 确认首页资源库状态、音声库 / 音乐库数量刷新。
6. 确认没有 absolutePath / file:// 暴露，没有 SQLite，没有全量扫描，没有 move/delete/rename。
```
