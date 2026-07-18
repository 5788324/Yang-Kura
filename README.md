# Yang-Kura

> 当前公开版本：`0.169.0-beta.2`  
> 下一版本目标：`0.170.0-beta.3`  
> 当前阶段：Beta 3 正式日用发布收口已暂停  
> 发布结论：`NO-GO`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声和普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；索引采用 Local JSON Index。

## 当前事实

- Beta 2 已发布并完成远端资产校验。
- PR #91 仍保留，但已进入阻断交接状态，不得合并或发布。
- 交接前产品代码基线为 `69fe73b794d467d619ffbcfa5d794c0af23359f7`。
- 最新有效 Codex v2 报告为 `FAIL / NO-GO`。
- lint、Renderer build、Electron build 和生产路由核对通过。
- 真实鼠标 E2E 在第二条音轨等待后端时长时失败：`Timed out waiting for player: RJ detail action backend duration`。
- Windows GUI、重启恢复和导入事务因此均为 `NOT TESTED`。
- 本对话产生的 v1、v2、v3 本地修复包均不是有效 Git 基线；v1/v2 已失败，v3 未执行、未验证、未推送，后续不得直接视为修复方案。

## 当前产品能力

- 本地目录选择、扫描、Local JSON Index 写入、读取、备份、恢复和维护。
- ASMR/RJ 与普通音乐双资源库、搜索、筛选、收藏、歌单、Queue、History 和续播。
- HTMLAudio、mpv、fallback、Seek、音量、静音和字幕。
- copy-only、受控 move-only、事务回滚和 OperationLog。
- portable、NSIS、安装、重复安装、卸载和用户数据保留链。

## 唯一阻断项

`B3-MAJ-001` 尚未修复。当前证据只能确认问题位于 RJ 详情页第二条本地音轨切换后的播放器后端装载或 duration 回传链，不能确认具体根因。

下一对话必须重新审查：

1. `RjDetailPage → TrackRow → useAudioPlayer → usePlayerBackend`；
2. HTMLAudio 连续换源后的 metadata 生命周期；
3. mpv `loadfile replace` 后的 duration 事件；
4. 当前 PR 分支相对 `0cc9779e...` 的未验证播放器改动应保留还是回退；
5. `package.json` / `package-lock.json` 仍为 Beta 2、仅由 CI 临时改写的版本一致性问题。

## 后续顺序

```text
重新审计远端代码和 v2 失败证据
→ 制作一个最小候选
→ 自动专项
→ Windows GUI 双入口与第二音轨切换
→ 临时导入事务
→ 真实音乐目录只读核对
→ 全部 PASS 后才推送、合并和发布
```

## Git Fast Lane v2

一个任务一个分支和 PR；普通维护按 L0～L2，正式发布按 L3。当前只允许继续使用 PR #91，不新建发布 PR，不提前合并或创建 Release。

## 长期冻结

正式下载器、SQLite 全面迁移、OpenList/WebDAV、新播放器内核、完整 AI Agent、Arsm_Transcribe 正式接入、云同步、在线账号和插件市场继续冻结。

## 文档入口

- `PROJECT_STATE.md`
- `PROJECT_ROADMAP.md`
- `AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md`
- `AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md`
- `AI_HANDOFF/WORKLOG.md`
- `docs/BETA3_BLOCKER_STATUS.md`
- `docs/GIT_FAST_LANE_V2.md`
