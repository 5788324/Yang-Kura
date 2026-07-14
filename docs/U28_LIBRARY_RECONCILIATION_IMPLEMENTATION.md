# U28 资源库状态闭环修复说明

本分支只修复 U27/U28 实机验收发现的资源库授权、Index 读取与跨页面状态闭环问题。

## 修复内容

- 原生目录选择得到的 rootPathToken 保存到当前 BrowserWindow 的 sessionStorage；关闭应用后自动失效，不把临时授权冒充长期授权。
- 设置页重新挂载时可以恢复本窗口中的目录授权，读取与扫描按钮不再无故重新禁用。
- 真实 Index 映射即使为空，也会覆盖旧的 RJ/音乐缓存，避免顶栏残留历史计数。
- 合法空 Index 被明确建模为“已连接空资源库”，不再与“未授权”或“已授权未读取”混淆。
- 首页、顶栏、设置页、音声库、音乐库与诊断页使用同一 Index 会话状态。
- Index 读取支持 UTF-8、UTF-8 BOM、UTF-16 LE BOM、UTF-16 BE BOM。
- JSON 解析失败与文件系统读取失败分别报告，不再把解析异常显示为 `source stat failed: UNKNOWN`。
- 诊断页刷新只重新应用最近一次真实 Index 读取结果；没有真实结果时明确提示不可用。
- 不接 SQLite，不启用 MVP130，不增加媒体写入、移动、删除、重命名或覆盖行为。

## 永久自动化门禁

新增 `scripts/test-u28-electron-e2e.mjs`，通过 Electron 自带 Chromium DevTools Protocol 驱动真实 Windows 桌面程序。测试仅使用系统临时目录，不访问真实 `E:\arsm`。

覆盖场景：

1. 未授权首次启动；
2. 已授权但尚未读取；
3. UTF-8 BOM 合法空 Index 的当前窗口跨页面一致性；
4. 完全重启后必须重新授权并重新读取；
5. 损坏 JSON 的错误分类；
6. 含 1 个音声作品、1 条 WAV 音轨的非空 Index；
7. `yang-kura-media://` 真实媒体协议读取；
8. 音声详情页播放、PlayerBar 曲目显示与播放进度；
9. 空库和非空库诊断刷新；
10. 侧栏、主内容区、PlayerBar、横向溢出和黑屏检查。

每次 PR Branch Validation 都会生成 14 张 UI 截图与结构化 `report.json`。

## 最终自动化验收

- 最终候选 HEAD：`b5a21252e5344627aacd410a56f47ed6d80881af`
- Branch Validation：`29345353834`
- Electron full-chain E2E：PASS
- 全部 focused verifiers：PASS
- stable regression：PASS
- production renderer build：PASS
- 媒体协议探针：HTTP 200、48,044 字节、RIFF 校验通过
- 四个 E2E 场景：全部 PASS
- 截图：14/14 生成

## 当前结论

```text
AUTOMATED GO
```

PR 继续保持 Draft，未合并到 `main`。后续只等待用户决定是否合并；不再要求 Windows 本机重复第三轮排错验收。
