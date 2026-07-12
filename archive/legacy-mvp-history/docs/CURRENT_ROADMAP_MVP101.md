# CURRENT_ROADMAP_MVP101

当前版本：`0.139.0-mvp101`。

本轮完成：**MVP101：import UI refresh after patch**。MVP100 已能在备份后真实写入 `library-index.json` patch；MVP101 补上写入后的用户闭环：读取当前 `library-index.json`，让 Renderer 保存 read result，并复用 `yang-kura-library-index-loaded` 刷新首页、音声库、音乐库、最近播放和资源库状态。

## 当前阶段

```text
Beta 0.1 后
→ 导入器 copy-only 链路收口
→ 已完成 copy / OperationLog / post-copy refresh preview / index patch preview / readiness / real patch write
→ 当前补 UI 自动刷新
```

## MVP101 允许

```text
读取当前 library-index.json
返回 tokenized read result
Renderer 缓存 yang_kura_last_read_library_index_result
dispatch yang-kura-library-index-loaded
显示新增/更新资源数量
```

## MVP101 仍不做

```text
不再次写 library-index.json
不接 SQLite
不触发全量扫描
不 copy / move / delete / rename
不返回 absolutePath
不返回 file://
不接下载器 / 元数据 Provider / mpv
```

## 个人项目边界

Yang-Kura 是个人本地项目，不分享、不商业化、不作为开源发布目标。安全边界继续按“可回退、少浪费、必要确认”执行。当前阶段允许受控真实写 index，但不再堆企业级审批；重点是备份、确认、失败可见、不乱删、不覆盖、不泄露真实路径。

## 下一轮

建议进入：

```text
MVP102：copy-only import closeout
```

目标：把 MVP95～MVP101 的 copy-only 导入链路作为一个完整闭环验收，不再继续拆纯合同 MVP。
