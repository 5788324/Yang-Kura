# U32 Windows 发布候选打包与系统集成验收

## 最终结论

```text
结论：AUTOMATED GO
基线 main：d37932c140ec59d858645c083fe2bffcf9c87823
被测 HEAD：5eaaa99c4504b57b82cb19d83b61c3464c8088ef
Branch Validation：29388203409 — PASS
U32 Release Candidate Packaging：29388203405 — PASS
Actions artifact：u32-release-candidate-windows / 8332293131
核心版本：0.167.0-mvp129（U32 不改版本号）
后续：U33 版本、Release Notes、tag 与 Beta 发布
MVP130 下载器：继续冻结
```

U32-A 的发布候选 UI 整理已先行合入 `main`。本轮 U32-B 完成 Windows 发布物、安装、重复安装、卸载、用户数据保留、进程退出、包内文件审计、SHA-256 以及 packaged 页面完整加载验收。

## 发布物

| 发布物 | 字节数 | SHA-256 |
|---|---:|---|
| `Yang Kura-0.167.0-mvp129-portable-x64.exe` | 85,257,977 | `45b69c2db54b2ffd606cfbd8e39dd605d66fc8af6e49ffe1b3c6f2c1e1cca331` |
| `Yang Kura-0.167.0-mvp129-setup-x64.exe` | 85,488,218 | `6752567771d6b9cdf2ba3751e8edb58cf80deebdaa4e63a90ea931de10e4f278` |
| `app.asar` | 2,056,038 | `590d5b08df768731f548a38dc70c40148fd65fe97c8cb4f60b43366413fbde77` |

Actions 产物中同时包含 `SHA256SUMS.txt`、`report.json`、`page-readiness-report.json` 和打包版截图。

## 自动化验收结果

永久工作流 `.github/workflows/u32-release-candidate.yml` 在 Windows runner 上实际执行并通过：

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
12. 对 portable 和 NSIS 安装版分别等待正式首页加载完成；必须退出“正在打开页面…”占位并显示“开始建立你的本地媒体库”后才截图和通过。
13. 上传 portable、NSIS、截图、报告和 `SHA256SUMS.txt`。

`report.json` 最终记录：

- `status: pass`；
- portable 中文/空格路径启动通过；
- NSIS 首次安装启动通过；
- 同目录重复安装启动通过；
- 安装、重复安装和卸载均保留用户数据标记；
- 卸载后应用主体移除；
- `residualProcesses: []`；
- packaged mpv 不可用时 `fallbackAvailable: true`。

`page-readiness-report.json` 最终记录：

- portable 正式首页内容长度 378；
- NSIS 安装版正式首页内容长度 378；
- 两种发布物均完成正式首页截图；
- `residualProcesses: []`。

## 常规全链回归

Branch Validation `29388203409` 同时通过：

- high/critical 依赖审计；
- TypeScript、Renderer、Electron 构建；
- U28 资源库 Electron E2E；
- U29 播放器 Electron E2E；
- U30 三主题、窗口、键盘与可访问性矩阵；
- U31 导入器事务矩阵；
- U32 发布候选视觉审查；
- 全部 `scripts/verify-u*.mjs`；
- 完整稳定回归；
- 二次生产构建。

## 数据与安全边界

- 所有安装、用户数据和媒体状态测试都使用 GitHub runner 临时目录。
- 不读取或修改真实 `E:\arsm`。
- 不删除、移动、重命名或覆盖真实媒体文件。
- 不向 Renderer 暴露 absolutePath 或 `file://`。
- NSIS 配置继续保持 `perMachine: false` 与 `deleteAppDataOnUninstall: false`。
- 本轮不修改版本号、不打 tag、不发布 Release；这些属于 U33。
- MVP130 正式下载器、SQLite 全面迁移、OpenList/WebDAV、Player Core v2 和大规模架构调整继续冻结。

## 未作为 U32 阻断项的真实机器差异

以下事项不能由 GitHub runner 完整模拟，但不再阻断 U32，因为 portable/NSIS、安装链、完整页面和明确 fallback 已有实际 packaged 证据：

- 真实 Windows 安装向导和系统确认对话框外观；
- 开始菜单与系统卸载项的视觉显示；
- 用户本机真实 mpv、声卡和驱动上的播放；
- 用户机器上的杀毒软件、特殊权限或厂商驱动差异。

真实 mpv、声卡和驱动可在 Beta 后按用户机器环境补充观察；本轮没有声称真实硬件 mpv 播放已经验证。

## U32 完成判定

- portable 与 NSIS 构建成功：PASS。
- 两种发布物实际启动并完整加载首页：PASS。
- 中文/空格路径：PASS。
- 重复安装与用户数据保留：PASS。
- 静默卸载、数据保留和无残留进程：PASS。
- packaged mpv 不可用时 HTMLAudio fallback：PASS。
- 产物名称、体积、SHA-256 和包内文件审计：PASS。
- U28～U32 永久门禁、全部 verifier、稳定回归和最终生产构建：PASS。

**U32 可以关闭，项目下一任务为 U33。**
