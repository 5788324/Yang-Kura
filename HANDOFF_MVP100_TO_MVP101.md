# HANDOFF_MVP100_TO_MVP101

## 当前版本

`0.139.0-mvp101`

## 本轮完成

MVP101：import UI refresh after patch。

新增写入后刷新 IPC：

```text
yang-kura:import:library-index-patch:refresh-after-write
```

作用：MVP100 写入 `library-index.json` patch 后，读取当前 index，让 Renderer 保存 read result 并触发 `yang-kura-library-index-loaded`，从而刷新首页、音声库、音乐库、最近播放和资源库状态。

## 本轮边界

```text
不再次写 library-index.json
不接 SQLite
不触发全量扫描
不 copy / move / delete / rename
不返回 absolutePath / file://
```

## 下一轮

建议 MVP102：copy-only import closeout。
