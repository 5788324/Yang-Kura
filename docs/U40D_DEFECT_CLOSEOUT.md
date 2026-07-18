# U40-D 缺陷修复与 Issue #66 收口

## 缺陷结论

| 编号 | 结论 | 修复 |
|---|---|---|
| U40-B01 | 已修复 | 资源库读取改为单一协调器；15 秒超时、明确错误、可重试、中断恢复和迟到成功自动收敛。 |
| U40-B02 | 已修复 | 设置、顶栏、首页、音声库和音乐库使用同一 `LibrarySessionSnapshot`。 |
| U40-B03 | 已修复 | 自动验收 profile 明确隔离；日常启动清理旧测试队列、历史、歌单、缓存和作品；真实库载入后移除不存在于当前库的队列与历史。 |
| U40-M01 | 已修复 | 旧版资源记录按授权根类型、RJ 目录或实际作品/专辑目录重新分组；空集合不进入日常页面。 |
| U40-M02 | 已修复 | 生产路由改用轻量日常设置；历史工程设置和完整历史诊断退出运行时。 |
| U40-O01 | 环境观察 | mpv 缺失不判为产品代码失败；基础 HTMLAudio 回退已通过播放器回归。 |

## Issue #66 收口

- `SettingsPage.tsx` 保留为历史兼容源码，但已退出生产路由；运行时使用 `SettingsPageDaily.tsx`。
- `DiagnosticsPage.tsx` 已退出维护页运行时；维护页只加载当前真实状态和按需性能检查。
- 新增严格、独立的读取协调、测试污染清理和集合规范化服务，未继续向旧巨型页面或 `electron/main.ts` 堆叠职责。
- 播放队列和历史使用当前资源库作为有效性边界。
- `fixtureLibraryScanner` 与 `virtualLibraryPathParser` 的历史相对导入循环已消除；U40-D verifier 确认循环数为 0。
- 历史兼容代码和 package 元数据仅作发布追溯，不再作为当前运行时能力入口。
- Issue #66 已满足关闭条件。

## 自动验收证据

```text
候选提交：189c5a65cb024838cb288874e7c78f8e07b0671c
U40-D Workflow Run：29628604275
Artifact：8424721819
Artifact size：12406664 bytes
Digest：sha256:d577eed18e51ce8686149e6ac04c1eb9f6341e30b72d9462c3960ed93d244f37
```

通过项目：

- TypeScript、Renderer build、Electron build；
- U40-D focused tests 与 Issue #66 closeout verifier；
- U28 资源库和重启；
- U29 播放器、字幕和会话；
- U30 主题、窗口、键盘和减少动画；
- U31 导入事务；
- U32 日常页面和可见控件；
- U40-B 全产品用户旅程；
- current behavior verifiers；
- stable regression；
- Architecture Guardrails、UI Fast Validation、U40-C、Branch Validation 和 U32 Packaging。

## 实机验收边界

自动验收使用隔离临时目录和 profile，没有访问用户真实媒体库。

Codex 按 `docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md` 验收：

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

真实库只读；导入、Index 写入、备份恢复和回滚只在临时副本执行。物理声卡、扬声器、真实显示器主观效果和实际 mpv 安装状态必须由 Codex 报告，不由本次自动化结果替代。
