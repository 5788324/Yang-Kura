# U41-E：1.0 RC 最终验收

## 候选边界

```text
remote parent: 18ada58b76a3aa0828506d2d02c57ecd22fbc587
candidate version: 1.0.0-rc.1
public version: 0.170.0-beta.3
release/tag: NOT CREATED
Git publication: real clone + native Git only
```

本轮累积包含 U41-D 生产表面瘦身和 Git Fast Lane v2.3。不会解冻下载器或其他大型功能，也不会在本地验收完成前创建 RC Release。

## 自动验收矩阵

### 页面与窗口

- 7 个生产路由：首页、音声库、音乐库、歌单、导入、设置、AI 维护；
- 1280×800 @ 125%；
- 1024×720 @ 100%；
- 800×700 @ 100%；
- 文档和 `main` 区域无水平溢出；
- 可见交互控件不越出视口；
- 可用控件最小边不小于 20 px；
- 800×700 下每个页面执行键盘焦点检查；
- About 必须显示 `1.0.0-rc.1`；
- Downloader 导航和生产 chunk 必须不存在。

### 用户旅程

复用现有门禁：

- U28：资源库、Index、自定义媒体协议和重启；
- U29：播放、Seek、队列、字幕和恢复；
- U30：主题、DPI、键盘、Reduced Motion；
- U31：Importer copy/move、冲突和回滚；
- U40-B：全部可见控件、详情页、设置、维护入口和 1 秒媒体；
- U41-B：真实四步 Importer Electron E2E；
- U41-E：三档窗口、7 路由、按钮边界、键盘焦点和 RC 版本。

### Windows 安装包

- portable x64；
- per-user NSIS x64；
- 首次安装；
- 同版本覆盖安装/升级路径；
- 卸载应用；
- `deleteAppDataOnUninstall=false` 数据保留；
- 残留 Yang Kura 进程为 0；
- packaged Home 页面和 preload bridge 就绪。

## 本地状态

本地 Linux 可以执行 TypeScript、Renderer/Electron build、静态 verifier、Electron CDP 页面矩阵和 stable。Windows portable/NSIS、物理声音输出、真实显示器主观视觉和真实 `E:\arsm` 只读验收必须由 GitHub Windows CI 与 Codex 完成。

## GO 条件

- 本地完整 stable PASS；
- U41-E runtime 页面矩阵 PASS；
- `npm audit --audit-level=moderate` 无漏洞；
- Windows RC workflow 全绿；
- Codex 固定 SHA 实机报告无 Blocker/Major；
- 之后才允许发布 `v1.0.0-rc.1`。


## 本地验证状态

```text
npm audit --audit-level=moderate       PASS / 0 vulnerabilities
npm run verify:stable                  PASS
Renderer build                         PASS / 1781 modules
Electron TypeScript build              PASS
Importer chunk                         22.02 KB / gzip 6.61 KB
Downloader chunk                       absent
Electron visible viewport matrix       NOT RUN / WINDOWS CI
portable / NSIS / install lifecycle    NOT RUN / WINDOWS CI
```

本地 Electron binary 下载仅按 Git Fast Lane v2.3 尝试官方源和一个镜像，各一次，均因 DNS 失败。随后停止重试。
