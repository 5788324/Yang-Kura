# U29 播放器、队列、续播与字幕全流程验收

## 结论

```text
AUTOMATED GO
```

U29 使用 Windows GitHub Actions、真实 Electron 窗口和 Chromium DevTools Protocol 自动完成。测试只使用临时目录、合成 WAV 和字幕样本，不读取或写入用户真实媒体库，因此本轮不需要 Codex 实机介入，也不需要用户测试。

## 修复的问题

### 1. 重启续播只恢复 UI，后端从 0 秒开始

根因：持久化队列恢复了 `progress`，但 HTMLAudio/mpv 的首次启动位置只读取空的 pending seek。

修复：

- 恢复队列时建立待应用的真实起播点；
- HTMLAudio 等待 metadata 后设置 `currentTime`；
- mpv 启动命令使用同一 `resolvePlaybackStart`；
- 切换后端时清理已消费的待起播点。

### 2. 重启后队列携带失效的当前窗口 token

根因：队列、历史和歌单曾持久化 `rootPathToken`、媒体 URL 或 tokenized 封面 URL。应用重启后这些数据不再代表当前窗口授权。

修复：

- 持久化前统一移除 `rootPathToken`、`mediaUrl` 和 tokenized 封面 URL；
- 本地字幕正文和加载状态不跨进程伪装为仍已加载；
- 重新授权并读取 Index 后，队列和歌单按 track ID 换用本窗口的新音轨对象和 token；
- 未重新授权的本地音轨明确阻止播放，不回退成示例播放。

### 3. Seek 可以超过实际时长

修复：所有 Seek 位置通过统一策略限制到 `0..duration`，HTMLAudio 和 mpv 使用同一秒数。

### 4. 首页把暂停或未授权状态写成“当前正在播放”

修复：首页继续播放卡片区分：

- 当前正在播放；
- 当前已暂停；
- 需要重新授权并读取 Index；
- 仅有历史进度。

### 5. 短音轨中途被误判为“已听完”

根因：历史逻辑使用固定 10 秒尾部阈值。12 秒测试音轨从第 2 秒起就被视为完成。

修复：

- 完成阈值改为 `min(10 秒, 音轨时长的 5%)`；
- 保存、续播和旧记录加载使用同一完成策略；
- 旧历史记录加载时重新计算 progress、percent 和 completed，自动清除陈旧错误状态。

## Windows Electron 全链路场景

测试自动创建 5 条 12 秒 WAV：

1. LRC 双语字幕；
2. SRT 字幕；
3. VTT 字幕；
4. ASS 字幕；
5. 无字幕。

完整链路：

```text
临时目录授权
→ 写入带当前窗口 token 的 Index
→ 读取 Index
→ 打开真实作品
→ 播放全部
→ HTMLAudio/mpv 实际启动
→ Seek 至中途
→ 暂停并保存进度
→ 切换完成策略
→ 打开队列并逐条播放
→ 验证 LRC/SRT/VTT/ASS/双语/无字幕
→ 检查持久化数据无 token 和媒体 URL
→ 完全退出 Electron
→ 重启恢复队列与进度
→ 未授权播放被阻止
→ 重新授权生成新 token
→ 重新读取 Index 并对账队列
→ 后端从真实续播点启动
→ 上一首/下一首
→ 超范围 Seek 被限制
→ 关闭并检查进程回收
```

## 自动化证据

实现验证期间的 Windows 全链路运行包括：

- U28 资源库 Electron E2E：PASS；
- U29 播放器 Electron E2E：PASS；
- 全部 `verify-u*.mjs`：PASS；
- `npm run verify:stable`：PASS；
- TypeScript、Electron 和最终生产构建：PASS；
- high/critical 依赖审计：PASS。

关键实测数据：

```text
首次保存续播点：约 6.68 / 12 秒
重启重新授权后的实际续播：约 6.33 / 12 秒
重启前后 root token：不同
中途历史 completed：false
四种字幕格式：正文与翻译均已渲染
无字幕：显示正式空状态
```

关键截图：

- 首次运行、队列和字幕；
- 重启后需要重新授权；
- 重新授权后的真实续播。

截图审查曾发现“未授权却显示正在播放”和“中途却显示已听完”，两项均已修复并加入永久 verifier。

## 永久回归合同

保留：

- `scripts/test-u29-electron-e2e.mjs`
- `scripts/verify-u29-player-reliability.mjs`
- `src/player/playerRuntimePolicy.ts`

PR 门禁必须同时运行 U28 与 U29 Electron E2E，防止播放器修复破坏资源库授权链。

## 未包含范围

- 实际打包 mpv 二进制、portable、NSIS、安装升级卸载属于 U32 Windows 发布候选验收；
- 本轮自动验证了 mpv 命令路径和统一起播策略，真实打包 mpv acceptance 不冒充已完成；
- 不修改 Importer、SQLite、MVP130 下载器或 Player Core v2；
- 不对真实 `E:\arsm` 执行任何写入。
