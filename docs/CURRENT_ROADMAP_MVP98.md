# Yang-Kura 当前路线：MVP-98

版本：`0.136.0-mvp98`

## 当前基线

```text
MVP-95：copy-only executor，已允许用户确认后真实 copy，不覆盖、不 move/delete/rename。
MVP-96：copy-only OperationLog 最小落盘。
MVP-97：post-copy refresh preview / scanner gate，只读检查 copied targetRelativePaths。
MVP-98：library-index patch preview，把 refreshCandidates 转成 indexPatchPreview。
```

## 项目性质与边界调整

Yang-Kura 是用户个人本地项目：

```text
不分享
不商业化
不作为开源发布目标
不做多人 / 企业 / 公网 / 云同步
```

因此从 MVP-98 开始，项目规划里的安全边界调整为：

```text
核心边界：不乱删、不乱覆盖、不泄露真实路径、有预览、有确认、有备份、有日志。
不再为了企业级权限、审计、多用户隔离、公网合规写过重流程。
后续任务要减少纯合同 MVP，尽快进入可用闭环。
```

这不是取消安全，而是把安全边界改成适合个人本地项目的粒度。

## MVP-98 目标

MVP-98 只做：

```text
MVP97 refreshCandidates
→ indexPatchPreview
→ 预览 collections / tracks / covers / subtitles 将如何写入 library-index.json
```

MVP-98 不做：

```text
不写 library-index.json
不接 SQLite
不触发全量扫描
不写 OperationLog
不 copy / move / delete / rename
不返回 absolutePath
不返回 file://
```

## MVP-98 新增 IPC

```text
yang-kura:import:library-index-patch:preview
```

输入：

```text
operationPlanId
targetRootPathToken
mode = library-index-patch-preview
sourceRefreshPlanVersion = mvp97-post-copy-refresh-plan-v1
refreshCandidates[]
```

输出：

```text
patchPreviewVersion = mvp98-library-index-patch-preview-v1
indexPatchPreview.collections
indexPatchPreview.tracks
indexPatchPreview.covers
indexPatchPreview.subtitles
indexPatchPreview.patchOperations
```

## 加快进度原则

MVP-98 之后不再继续拆过多只读文档轮。建议：

```text
MVP99：确认写入准备 + backup 规则
MVP100：真实 patch 写入 library-index.json，必须备份，不覆盖异常
MVP101：写入后 UI 刷新 / 资源库重新读取
MVP102：copy-only 导入完整闭环验收
```

SQLite、下载器、元数据、mpv 后端继续后置，避免打断导入闭环。
