# U28 资源库状态闭环修复说明

本分支只修复 U27 与后续 Windows 复验发现的 MAJ-001 和 MAJ-002。

## 修复内容

- 原生目录选择得到的 rootPathToken 保存到当前 BrowserWindow 的 sessionStorage；关闭应用后自动失效，不把临时授权冒充长期授权。
- 设置页重新挂载时可以恢复本窗口中的目录授权，读取与扫描按钮不再无故重新禁用。
- 真实 Index 映射即使为空，也会覆盖旧的 RJ/音乐缓存，避免顶栏残留历史 51 条音轨。
- 合法空 Index 被记录为已加载的 0 集合、0 音轨资源库；读取失败不会冒充空库成功。
- 首页、顶栏和诊断页通过共享会话快照与事件同步空 Index 状态。
- Electron 读取 `library-index.json` 时按原始 Buffer 处理，支持 UTF-8、UTF-8 BOM、UTF-16 LE BOM 和 UTF-16 BE BOM。
- JSON 解析失败与文件系统读取失败分开报告，不再统一误报为 `source stat failed: UNKNOWN`。
- Index 健康检查复用同一编码解析器；原始文件 SHA-256 和字节数仍按源 Buffer 计算。
- 诊断页刷新只重新应用最近一次真实 Index 读取结果；没有真实结果时明确提示不可用。
- 不读取真实库以外的目录，不新增媒体文件写入，不接 SQLite，不启用 MVP130。

## 自动验证

- TypeScript validation：PASS
- Electron build：PASS
- Windows Index 编码运行时 verifier：PASS
- U28 状态闭环 verifier：PASS
- 全部 U02–U28 focused verifiers：PASS
- stable regression：PASS
- production renderer build：PASS

## Windows 实机门槛

1. 原生选择 E:\arsm 后，设置页立即显示已授权且读取/扫描按钮可用。
2. 同一个仓库外临时合法空 Index 必须能够读取，不再出现 `source stat failed: UNKNOWN`。
3. 读取已有 Index 后，首页、顶栏、音声库与诊断页使用同一数据快照。
4. 真实 Index 为空时，旧缓存必须清空，不得保留历史计数。
5. 应用重启后必须重新授权；仅重新授权但尚未重新读取时不得恢复旧的已加载状态。
6. 诊断刷新不得出现 Demo 扫描文案。
7. E:\arsm 仅做授权、读取、浏览和播放；写入测试使用仓库外临时副本。
