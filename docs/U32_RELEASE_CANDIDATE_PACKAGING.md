# U32 Windows 发布候选打包与系统集成验收

## 状态

```text
基线 main：d37932c140ec59d858645c083fe2bffcf9c87823
分支：agent/u32-rc-packaging-acceptance
当前阶段：U32 自动化打包验收进行中
后续：仅把自动化无法替代的真实声卡、驱动、系统确认对话交给 Codex
MVP130 下载器：继续冻结
```

## 背景

U28～U31 已完成资源库、播放器、字幕、窗口/DPI/键盘和导入器事务闭环。U32 第一部分已经完成日常 UI 发布候选整理：工程入口退出可见侧栏，媒体内容进入首屏，卡片、按钮与设置页签完成对齐。

U32 尚未完成的部分是 Windows 发布物本身：portable、NSIS、中文/空格路径、安装与重复安装、卸载、用户数据保留、进程退出、包内文件清单和 SHA-256。

## 本轮自动化范围

永久工作流 `.github/workflows/u32-release-candidate.yml` 在 Windows runner 上执行：

1. Node 22 / npm 10 依赖安装与 high/critical 审计。
2. Electron rebuild 与 electron-builder 兼容补丁。
3. TypeScript、Renderer 和 Electron 构建。
4. 生成 x64 portable 与 NSIS 安装包。
5. 检查 portable、NSIS、`app.asar` 的存在、体积与 SHA-256。
6. 检查发布目录未混入 `library-index.json`、`.env`、logs、cache、backups 或 data。
7. 将 portable 复制到中文和空格路径后实际启动，通过 CDP 验证真实 Electron/preload 壳。
8. 把 mpv 路径指向不存在的文件，验证打包版明确报告不可用，同时保留 HTMLAudio fallback。
9. 静默安装 NSIS 到中文和空格目录，启动安装版。
10. 对同一目录重复安装，作为升级式覆盖验证，再次启动。
11. 静默卸载，确认应用主体移除、用户数据标记保留、无 Yang Kura 残留进程。
12. 上传 portable、NSIS、截图、报告和 `SHA256SUMS.txt`。

## 数据与安全边界

- 所有安装、用户数据和媒体状态测试都使用 GitHub runner 临时目录。
- 不读取或修改真实 `E:\arsm`。
- 不删除、移动、重命名或覆盖真实媒体文件。
- 不向 Renderer 暴露 absolutePath 或 `file://`。
- NSIS 配置继续保持 `perMachine: false` 与 `deleteAppDataOnUninstall: false`。
- 本轮不修改版本号、不打 tag、不发布 Release；这些属于 U33。
- MVP130 正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和大规模架构调整继续冻结。

## U32 完成门槛

自动化部分必须全部通过：

- portable 与 NSIS 构建成功；
- 两种发布物都能实际启动；
- 中文/空格路径通过；
- 重复安装不破坏用户数据；
- 卸载保留用户数据且不残留应用进程；
- 打包态 mpv 不可用时 fallback 行为真实可见；
- 产物名称、体积、SHA-256 和包内文件审计完整；
- U28～U31 永久门禁、全部 verifier、稳定回归和最终生产构建继续通过。

只有以下事项在 CI 无法给出等价证据时才交给 Codex：

- 真实 Windows 安装向导和系统确认对话框外观；
- 开始菜单与系统卸载项显示；
- 用户本机真实 mpv、声卡和驱动上的播放；
- 用户机器上的文件锁、杀毒软件或特殊权限行为。
