# MVP-71：主界面简化 / 诊断页折叠 / AI 维护区收口

## 版本

```text
0.109.0-mvp71
```

## 本轮目标

MVP-71 不新增真实能力，只调整信息架构和可见层级：

```text
主界面媒体感优先
工程信息默认折叠
AI 维护信息集中收口
历史 verifier marker 保留
```

## 用户主界面保留内容

首页优先展示：

```text
继续播放
最近播放
最近加入
音声库入口
音乐库入口
歌单入口
```

音声库 / 音乐库 / 歌单 / 播放器页面继续保持正常媒体库体验，减少工程提示和阶段说明。

## AI 维护区

以下信息不删除，但默认折叠到维护区域：

```text
AI 维护区
开发者详情
历史验证
高级诊断
```

收纳内容：

```text
工程说明
verifier marker
MVP 历史
Electron
IPC
Contract
Scanner
Dry-run
Bridge
Engine
Fallback
```

## 本轮改动

```text
src/services/userFacingSimplificationService.ts
src/components/Dashboard.tsx
src/components/SettingsPage.tsx
src/components/DiagnosticsPage.tsx
src/services/index.ts
scripts/verify-mvp71-ui-simplification.mjs
HANDOFF_MVP70_TO_MVP71.md
PACKAGE_MANIFEST_MVP71_HANDOFF.txt
```

## 安全边界

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```

## 验收命令

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp71-ui-simplification
npm run verify:all
npm run build
npm audit --audit-level=high
```

## 验收点

```text
package.json version = 0.109.0-mvp71
首页存在 mvp71-home-user-facing-simplification
设置页存在 mvp71-settings-ai-maintenance-area，且 details 默认折叠
诊断页存在 mvp71-ai-maintenance-zone，且 details 默认折叠
历史 verifier marker 未删除
verify:all 包含 verify:mvp71-ui-simplification
```
