# Beta 3 播放阻断状态

## 当前判定

```text
缺陷：B3-MAJ-001
状态：未修复
严重度：Blocker
发布：NO-GO
PR：#91，草稿阻断
Beta 3 Release：不存在
```

## 最新有效失败

基线：

```text
branch = release/beta3-daily-closeout
HEAD = origin/release/beta3-daily-closeout
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

## 下一轮必须补齐的诊断

第二条行尾播放点击后，保存：

- currentTrack id；
- currentIndex 和 queue；
- playbackMode；
- progress 和 duration；
- resolvedMediaUrl；
- playbackError / playbackNotice；
- HTMLAudio src、dataset trackId、readyState、networkState、duration；
- loadedmetadata、durationchange、canplay、error；
- mpv ready、duration、time、fallback、error；
- requestMpvPlaybackStart / requestResolveTrackMediaUrl 返回；
- renderer console 和 page error。

只有证据明确后才修改代码。

## 候选清理

- v1：错误文件，作废。
- v2：自动专项失败，作废。
- v3：未执行、未验证、未推送，作废。

下一对话从 GitHub PR 最新 HEAD 开始，不从任何压缩包继续。
