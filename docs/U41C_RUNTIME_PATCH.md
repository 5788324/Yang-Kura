# U41-C Electron 运行时与跨平台门禁

## 最终状态

```text
原始基线：main @ 8a92978bbd07aa9f490ec15c9037366793168e2c
最终 PR：#92
最终候选 HEAD：961b051ed4417e4f0b99ece7191f8a48d2be22c2
合并 main：18ada58b76a3aa0828506d2d02c57ecd22fbc587
Windows U28/U29/portable/NSIS：PASS
GitHub CI：PASS
结论：CLOSED / MERGED
```

Electron 39 的受控自定义媒体协议最终启用 `corsEnabled=true`，以允许 Renderer fetch；root token、相对路径、遍历阻断、MIME 和 Range 校验保持不变。打包验收使用独立 user-data profile，并以 `Get-Process` 检查残留进程。

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
- `corsEnabled=true`，仅允许受控 Renderer fetch；
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
