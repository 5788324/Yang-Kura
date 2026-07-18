# PROJECT_STATE

## 当前状态

```text
公开版本：0.169.0-beta.2
下一版本目标：0.170.0-beta.3
主分支事实来源：GitHub main
候选分支：release/beta3-daily-closeout
交接前产品代码基线：69fe73b794d467d619ffbcfa5d794c0af23359f7
PR #91：开放并转为阻断草稿
Beta 3 Release：尚未创建
发布结论：FAIL / NO-GO
当前任务：开发暂停，完成新对话交接
Git Fast Lane v2：项目级默认规则已生效
大型功能：长期冻结
```

## 已完成范围

- Beta 1 / Beta 2 已发布并完成远端资产校验。
- U34～U40-D3 的架构、正式媒体库、日常体验、真实库稳定性和 HTMLAudio 停滞状态主线已完成。
- Issue #66 已关闭。
- 双资源库、Local JSON Index、播放器、字幕、Queue、History、续播、导入事务、元数据覆盖、portable 和 NSIS 主链已存在。

## Beta 3 阻断状态

最新有效证据来自 Codex v2：

| 项目 | 结果 |
|---|---|
| 固定分支与 HEAD | PASS |
| 候选内部哈希 | PASS |
| 生产路由核对 | PASS |
| TrackRow 直接激活源码核对 | PASS |
| TypeScript lint | PASS |
| Renderer build | PASS |
| Electron build | PASS |
| 真实鼠标 E2E 后端时长 | FAIL |
| Windows GUI 播放复测 | NOT TESTED |
| 重启恢复 | NOT TESTED |
| 临时导入事务 | NOT TESTED |
| 提交与推送 | 未执行 |

阻断错误：

```text
Timed out waiting for player: RJ detail action backend duration
```

这只证明第二条音轨的后端时长链未完成，不能证明具体是 TrackRow、HTMLAudio、mpv、IPC 或测试观测逻辑中的哪一层。

## 无效候选清理结论

- v1：修改旧 `src/components/AsmrDetail.tsx`，未进入生产路由，作废。
- v2：正确命中生产链，但自动专项失败，改动已由 Codex 恢复，作废。
- v3：仅在本对话中生成，本机未执行、未验证、未推送；不得作为后续基线。
- 当前 Git 分支上的播放器尝试代码仍属于未通过实机验收的候选代码；下一对话应先审计，不得直接宣称已修复。

## 仍需处理

1. 重新审计 `69fe73b...` 相对已知失败基线 `0cc9779e...` 的播放器和测试改动。
2. 重新构造可诊断的第二音轨切换测试，保存完整最后状态和后端事件。
3. 找到最小根因后再制作单一候选，不叠加 v1/v2/v3 补丁。
4. 播放通过后补做临时导入事务和真实音乐目录只读链。
5. 发布前同步 `package.json` 与 `package-lock.json` 到 `0.170.0-beta.3`，不能继续只依赖 CI 工作区临时改写。
6. 合并后验证 tag、prerelease、三个资产和 SHA-256。

## 禁止事项

- 不合并 PR #91。
- 不创建 Beta 3 Release。
- 不把旧绿色 CI 当作最新 Windows 实机通过。
- 不解冻大型功能。
- 不让用户承担测试、构建、Git 或排错。
