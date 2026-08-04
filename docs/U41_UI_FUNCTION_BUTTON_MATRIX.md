# U41 UI / 功能 / 按钮矩阵

状态：`READY`、`VERIFY`、`REMOVED`、`FROZEN`。

| 页面/表面 | 主要入口 | 状态 | 说明 |
|---|---|---|---|
| App Shell | 侧栏、搜索、TopBar | READY | TopBar live region 已通过 U41-C Windows/CI；生产路由已收敛为 7 个 |
| 首页 | 继续播放、最近播放、最近添加 | READY | Beta 3 实机 PASS |
| 音声库 | 搜索、筛选、编辑、收藏、歌单 | READY | 伪刷新入口已删除；真实 Provider 独立保留 |
| RJ 详情 | 播放全部、主区、行尾、队列、字幕 | READY | R6 direct activation 与 U28/U29 PASS |
| 音乐库 | 歌曲/专辑/艺术家/目录、元数据 | READY | U40-B/U32 覆盖 |
| 歌单 | 创建、播放、队列、删除 | READY | 本地持久化边界明确 |
| 导入·来源 | 选择目录、只读扫描、文件勾选 | READY | tokenized root；Windows visible E2E PASS |
| 导入·目标 | 目标库、copy/move、子目录 | READY | 同根阻断；相对路径安全化 |
| 导入·预检 | 来源、冲突、父目录检查 | READY | 不执行、不覆盖 |
| 导入·执行 | 确认、事务、OperationLog、rollback、Index | READY | U31、Windows Importer E2E 与 CI PASS |
| 设置·主题 | 三主题 | READY | U30/U40-B PASS |
| 设置·播放 | HTMLAudio/mpv | READY | Electron 39.8.10、U28/U29 Windows PASS |
| 设置·资源库 | 选择、读取、扫描 | READY | 大库与重启 PASS |
| 设置·关于 | 应用版本 | READY | package/build 单一来源 `APP_VERSION` |
| AI 维护 | 当前状态、性能 | READY | 当前维护能力保留；历史工程诊断已归档 |
| Downloader | 原隐藏生产 route | REMOVED | U41-D 已从类型、导航、Router、Sidebar、源码和 dist 移除；历史源码仅在 archive |
| PlayerBar / Queue / Lyrics | 播放、Seek、字幕、队列 | READY | Beta 3 自动与实机 PASS |
| portable / NSIS | 启动、安装、升级、卸载 | READY | PR #92 Windows 与 GitHub CI PASS；U41-E 再做 1.0 RC 固定 SHA 验收 |

## U41-D 当前规模

```text
生产路由：7（6 日常 + 1 维护）
静态控件标记：240
代码文件：123
生产入口可达：121
不可达实现：0
保留声明例外：2 个 .d.ts
workflow：9
verifier：58
Importer chunk：22.02 KB / gzip 6.61 KB
Downloader chunk：不存在
```

93 个 U41-B/C 不可达实现和 DownloaderPage 共 94 个历史文件已迁入 `archive/u41d-legacy-code/`，不参与 TypeScript 编译或生产 bundle。历史工作流和 verifier 也分别迁入 archive，保留审计证据而不再触发当前 CI。
