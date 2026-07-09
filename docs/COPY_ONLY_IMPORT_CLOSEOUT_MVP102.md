# COPY_ONLY_IMPORT_CLOSEOUT_MVP102

## 目标

MVP102 不再继续拆纯合同 MVP，而是把 copy-only 导入链路作为一个可验收阶段收口。

闭环范围：

```text
MVP95 copy-only executor
→ MVP96 OperationLog
→ MVP97 post-copy refresh preview
→ MVP98 library-index patch preview
→ MVP99 write readiness
→ MVP100 backup + patch write
→ MVP101 import UI refresh after patch
→ MVP102 closeout
```

## Closeout 结果

```text
closeoutVersion = mvp102-copy-only-import-closeout-v1
closedRange = MVP95-MVP101
importChainClosed = true
userFacingMvpComplete = true
codexSmokeTestRecommended = true
```

## 验收重点

```text
copy-only 导入使用真实 copy，但仍不 move/delete/rename
OperationLog 有摘要记录
post-copy refresh 只读检查目标相对路径
index patch preview 明确新增 collections/tracks/covers/subtitles
MVP100 备份后写 library-index.json
MVP101 写后刷新首页 / 音声库 / 音乐库
Renderer 不接收 absolutePath / file://
SQLite / 下载器 / 元数据 Provider / mpv 均后置
```

## Codex 最小实机验收提示词

```text
你是 Codex，只做 Yang-Kura MVP102 copy-only 导入闭环最小实机验收，不做长代码审查，不重构。

基线源码版本应为 0.140.0-mvp102。先确认 package.json version、Git 分支/HEAD、npm scripts 中存在 verify:mvp102-copy-only-import-closeout。

使用仓库本地 npm cache：
$repoRoot = "G:\\Codex\\Yang Kura"
$env:NPM_CONFIG_CACHE = "$repoRoot\\.npm-cache"
$env:npm_config_cache = "$repoRoot\\.npm-cache"
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\\.npm-cache"

运行：
npm run lint
npm run build:electron
npm run verify:mvp99-library-index-patch-write-readiness
npm run verify:mvp100-library-index-patch-write
npm run verify:mvp101-import-ui-refresh-after-patch
npm run verify:mvp102-copy-only-import-closeout
npm run build

实机只测小样本：启动 desktop:preview 或打包版；选择一个已有 library-index.json 的测试库；执行 copy-only 导入；确认 backup 创建、library-index.json patch 写入、首页/音声库/音乐库刷新。

重点检查：不暴露 absolutePath/file://；不接 SQLite；不触发全量扫描；不 move/delete/rename；失败时原 library-index.json 可保留。

输出简短报告：版本、命令结果、实机步骤、PASS/FAIL、失败截图或日志位置、是否建议进入 MVP103。
```

## 边界

Yang-Kura 是个人本地项目，不分享、不商业化、不作为开源发布目标。MVP102 继续按“必要确认、备份、可回退、少浪费”执行，不堆企业级审批。
