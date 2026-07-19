# U41 UI / 功能 / 按钮矩阵

状态：`READY`、`CANDIDATE`、`VERIFY`、`FIX`、`FROZEN`。

| 页面/表面 | 主要入口 | 状态 | 说明 |
|---|---|---|---|
| App Shell | 侧栏、搜索、TopBar | CANDIDATE | TopBar polite live region 已加入，等待 Windows 辅助技术/状态切换复核 |
| 首页 | 继续播放、最近播放、最近添加 | READY | Beta 3 实机 PASS |
| 音声库 | 搜索、筛选、编辑、收藏、歌单 | CANDIDATE | 伪刷新入口已删除；真实 Provider 独立保留 |
| RJ 详情 | 播放全部、主区、行尾、队列、字幕 | READY | R6 direct activation PASS |
| 音乐库 | 歌曲/专辑/艺术家/目录、元数据 | READY | U40-B/U32 覆盖 |
| 歌单 | 创建、播放、队列、删除 | READY | 本地持久化边界明确 |
| 导入·来源 | 选择目录、只读扫描、文件勾选 | CANDIDATE | tokenized root；copy 200 / move 20 |
| 导入·目标 | 目标库、copy/move、子目录 | CANDIDATE | 同根阻断；相对路径安全化 |
| 导入·预检 | 来源、冲突、父目录检查 | CANDIDATE | 不执行、不覆盖 |
| 导入·执行 | 确认、事务、OperationLog、rollback、Index | VERIFY | 本地 U31 PASS；等待 Windows UI E2E/Codex |
| 设置·主题 | 三主题 | READY | U30/U40-B PASS |
| 设置·播放 | HTMLAudio/mpv | VERIFY | Electron 39.8.10 已升级；等待 U28/U29 Windows 复测 |
| 设置·资源库 | 选择、读取、扫描 | READY | 大库与重启 PASS |
| 设置·关于 | 应用版本 | CANDIDATE | 已改为 package/build 单一来源 |
| AI 维护 | 当前状态、性能 | CANDIDATE | 文案已收敛为真实统计与性能检查；历史诊断明确归档 |
| 下载规划 | 隐藏 route | FROZEN | U41-D 从生产 bundle 移除 |
| PlayerBar / Queue / Lyrics | 播放、Seek、字幕、队列 | READY | Beta 3 自动与实机 PASS |
| portable / NSIS | 启动、安装、升级、卸载 | VERIFY | U41-E 公开资产验收 |

## U41-B 静态规模

```text
生产路由：8
静态控件标记：274
代码模块：217
生产入口可达：123
不可达实现：92
workflow：17
verifier：87
test script：22
Importer chunk：22.03 KB / gzip 6.62 KB
```

不可达数量上升是因为旧 Importer 模型已退出生产 graph；这些文件由 U41-D 批量清理，不在 U41-B 逐个删除。
