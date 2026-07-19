# U41-C Electron 运行时与跨平台门禁

## 状态

```text
基线：main @ 8a92978bbd07aa9f490ec15c9037366793168e2c
候选：U41-A + U41-B + U41-C 累积本地工作区
本地静态/构建/安全审计：PASS
Windows U28/U29/portable/NSIS：NOT RUN
结论：LOCAL COMPLETE / WINDOWS VERIFY
```

## Electron 补丁

- Electron 依赖范围从 `^39.8.1` 升级到 `^39.8.10`；
- lockfile 固定解析到 `39.8.10`；
- `desktop:setup` 与当前维护模型同步使用 `^39.8.10`；
- `npm audit --audit-level=moderate` 结果为 0 info / low / moderate / high / critical；
- 仍保留 Electron 39 主版本，避免在 1.0 前混入跨主版本迁移；39.x 已进入上游 EOL，后续维护应单独规划跨主版本升级，不在本轮扩域。

## BrowserWindow 与 custom protocol

主窗口显式设置：

```text
contextIsolation=true
nodeIntegration=false
nodeIntegrationInWorker=false
nodeIntegrationInSubFrames=false
webviewTag=false
webSecurity=true
```

应用不需要 Renderer 创建子窗口，因此 `setWindowOpenHandler` 统一拒绝 `window.open()`。外部链接继续走已有受控 IPC。

`yang-kura-media://` 保持：

- `standard` / `secure` / `supportFetchAPI`；
- `corsEnabled=true（Electron 39 的 Renderer fetch 兼容）`；
- tokenized root；
- safe relative path；
- 静态 MIME；
- Range 206 / 416；
- 不返回绝对路径或 `file://`。

Windows 工作流必须重跑 U28、U29 和打包安装链，确认 Electron patch 没有破坏自定义协议、HTMLAudio、字幕、队列或安装包。

## CRLF fixture

新增 `.gitattributes`，强制以下 Node executable fixture 使用 LF：

```text
tests/fixtures/mpv/fake-mpv.mjs
tests/fixtures/mpv/fake-mpv-stability.mjs
```

两个文件已永久转换为 LF。Linux stable 不再需要临时转换和恢复。

## 可访问性与文案

- TopBar 资源库状态增加 `role=status`、`aria-live=polite`、`aria-atomic=true`；
- 维护入口不再声称提供“完整历史诊断”；
- 当前能力明确为真实资源统计和按需性能检查；历史工程诊断已经归档。

## 自动门禁

新增：

```text
npm run verify:u41c-runtime-patch
.github/workflows/u41c-runtime-patch.yml
```

Windows workflow 合并执行：

1. moderate 级依赖审计；
2. lint / Renderer / Electron build；
3. U41-B 与 U41-C verifier；
4. Beta 3 runtime hardening；
5. U28 / U29 Electron E2E；
6. portable + NSIS；
7. U32 安装、升级、卸载与页面就绪。

## 本地限制

当前 Linux 容器无法从 GitHub 下载 Electron 39.8.10 二进制，`npm rebuild electron` 返回 DNS `EAI_AGAIN`。因此没有虚报 U28/U29 或打包 PASS；这些项目严格保留为 Windows CI/Codex 门禁。
