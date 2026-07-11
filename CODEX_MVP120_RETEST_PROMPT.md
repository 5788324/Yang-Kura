# Codex MVP120 最小复验与 Git 合入

当前源码版本：`0.158.0-mvp120`

已知 GitHub main：`0.146.0-mvp108`，HEAD `2e4a4aa`。当前工作区可能已包含未提交的 MVP109～MVP119；用 MVP120 完整源码覆盖，不要丢弃这些累计成果。

## 本轮唯一阻塞项

MVP119 对最多 6 个 DLsite 候选 URL 分别使用完整 12 秒超时，导致网络不可达时可能等待约 72 秒以上。

MVP120 必须满足：

- 一次单 RJ 查询只创建一个总截止时间。
- 默认总预算为 12 秒。
- 每个候选 URL 只使用剩余时间。
- 总预算耗尽后立即返回 `mvp119-dlsite-timeout`。
- UI 不再出现 70～90 秒无响应。

不要开发新功能，不改 Provider 字段解析，不改缓存/节流，不接 ASMR.one，不做全库抓取。

## 命令验证

```powershell
$repoRoot = "G:\Codex\Yang Kura"
$env:NPM_CONFIG_CACHE = "$repoRoot\.npm-cache"
$env:npm_config_cache = "$repoRoot\.npm-cache"

node -p "require('./package.json').version"
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "$repoRoot\.npm-cache"
npm run lint
npm run build:electron
npm run verify:mvp118-dlsite-single-rj-provider
npm run verify:mvp119-provider-cache-throttle
npm run verify:mvp120-dlsite-total-deadline
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

预期版本：`0.158.0-mvp120`。

## Windows Electron 复验

启动：

```powershell
npm run desktop:setup
npm run desktop:preview
```

打开任一音声作品的“编辑本地元数据 → 预览外部作品信息”。测试 `RJ01026048` 或其他真实 RJ。

### A. 正常网络查询

点击“查询（优先缓存）”，记录从点击到结果/错误返回的耗时。

验收：

1. 查询必须在约 12 秒总预算内结束；允许桌面调度开销，硬上限按 15 秒判断。
2. 返回可以是成功候选，也可以是明确的 DNS、HTTP、timeout 或 parse error。
3. 不允许 70～90 秒无响应。
4. timeout 文案应说明“单次查询总耗时超过12秒”。
5. 失败时标准 JSON 回退仍可使用。
6. 当前编辑内容和差异预览不能被错误清空。

### B. 明确不可达场景

在不破坏系统的前提下，临时断开网络后重新启动应用并查询一次，或使用当前确实无法访问 DLsite 的网络环境。

验收：

- 从点击到 timeout/error 返回不超过15秒。
- 状态为 `mvp119-dlsite-timeout` 或明确的网络错误。
- 页面不卡死、不白屏、无 React error。

### C. 成功查询时的附加检查

只有真实查询成功时才检查：

- 第二次“查询（优先缓存）”命中内存缓存。
- `networkRequestPerformed=false`。
- 5秒内“重新查询”被节流。
- 5秒后可重新联网。
- 清除缓存后下一次普通查询重新联网。

如果 DLsite 因 DNS/地区/403 等环境原因始终无法成功，缓存在线快检可标记“环境限制，自动 verifier 已通过”，不应因此否定本次总截止时间热修复。

## 输出格式

```text
版本：
合入前 HEAD：
初始 git status：

命令：
- lint：
- build:electron：
- MVP118：
- MVP119：
- MVP120：
- importer smoke：
- build：
- audit high：

总截止时间：
- 测试 RJ：
- 网络环境：
- 返回结果：
- 实际耗时：
- 是否 <= 15 秒：
- 是否仍出现 70～90 秒等待：
- JSON 回退是否可用：
- Console error：

成功查询附加项（如适用）：
- 缓存命中：
- 5秒节流：
- 清除缓存后重新联网：

最终结论：PASS / NEEDS_FIX
```

## Git 合入

如果总截止时间复验 PASS：

```powershell
git add .
git commit -m "fix: enforce MVP120 DLsite query deadline"
git push origin main
```

报告提交后 HEAD、origin/main 和最终 git status。

如果 NEEDS_FIX，只报告阻塞问题和最小修复建议，不扩大范围。
