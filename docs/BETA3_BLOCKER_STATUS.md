# Beta 3 播放阻断状态

## 当前判定

```text
缺陷：B3-MAJ-001
状态：未修复
严重度：Blocker
发布：NO-GO
PR：#91，草稿阻断
Beta 3 Release：不存在
当前阶段：第一轮诊断增强
```

## 最新有效失败

基线：

```text
branch = release/beta3-daily-closeout
HEAD = 69fe73b794d467d619ffbcfa5d794c0af23359f7
```

通过：

- 候选哈希；
- 生产路由；
- TrackRow 直接激活源码核对；
- TypeScript lint；
- Renderer build；
- Electron build。

失败：

```text
node scripts/test-beta3-rj-detail-playback-entry.mjs
Timed out waiting for player: RJ detail action backend duration
```

未测试：

- Windows GUI 播放；
- pause/resume/seek；
- 重启恢复；
- 临时导入事务；
- 真实音乐目录只读完整链。

## 已确认生产链

```text
AppRouter
→ RjDetailPage
→ TrackRow
→ useAudioPlayer
→ usePlayerBackend
→ HTMLAudio 或 mpv
```

旧 `src/components/AsmrDetail.tsx` 不在生产链。

## 当前不能下的结论

- 不能确认是 TrackRow Bug；
- 不能确认是 HTMLAudio readyState 竞态；
- 不能确认是 mpv duration observer；
- 不能确认是 IPC；
- 不能确认测试读取的 PlayerBar 状态正确；
- 不能用旧 CI 绿灯判定实机通过。

## 第一轮诊断候选

新增 `scripts/beta3-playback-diagnostic-probe.mjs`，通过 Node `--import` 在原 E2E 启动前加载。它不改变产品行为，也不改变测试通过条件。

保存内容：

- trackId、playbackMode、progress、duration、queueCount、currentIndex；
- HTMLAudio load/play/pause 和 loadedmetadata、durationchange、canplay、error 等事件；
- requestMpvPlaybackStart、requestResolveTrackMediaUrl、requestMpvPlaybackCommand 请求和结果；
- mpv ready、duration、time、fallback、error 事件；
- Renderer console 和 page exception；
- Electron stdout/stderr；
- 状态变化时间线和最后快照。

证据文件：

```text
artifacts/beta3-rj-detail-playback-entry/diagnostic-probe.json
```

判定规则：

- 若第二条点击后没有 trackId/currentIndex 变化，检查入口或 PlayerState；
- 若停在 resolving 且无 IPC 请求，检查 Hook/Effect 启动条件；
- 若 IPC 返回失败，检查 token、路径解析或 mpv 启动；
- 若 mpv 返回成功但没有 ready/duration，检查 mpv 事件和 observer；
- 若 HTMLAudio load 后无 metadata/duration，检查连续换源和媒体事件；
- 若后端已有有效 duration 而 PlayerBar 仍为 0，检查状态同步或测试观测。

只有 Windows artifact 提供明确证据后才修改播放器代码。

## 候选清理

- v1：错误文件，作废。
- v2：自动专项失败，作废。
- v3：未执行、未验证、未推送，作废。

后续只从 GitHub PR 最新 HEAD 继续，不从任何压缩包叠加补丁。
