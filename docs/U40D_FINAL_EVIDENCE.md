# U40-D 最终证据

## 合并事实

```text
PR：#88
最终 PR head：565097c8fa54b5281b788798dd51266b46a81dd2
main 合并提交：5daa0102b1114b6213d3240aa7cb4e66285ca7ab
Issue #66：closed / completed
版本：0.169.0-beta.2
```

## 最终自动验收

```text
U40-D Workflow Run：29629121046
Artifact：8424882277
Artifact size：12406081 bytes
Digest：sha256:fbc7a3d487d0dd20efb0586ff5856f2ddb0431a6d2006301120e342b1ba2ff07
```

最终 PR head 全部通过：

- Documentation Validation；
- Architecture Guardrails；
- UI Fast Validation；
- U40-C UI Polish；
- U40-D Real Library Stability；
- Branch Validation；
- U32 Release Candidate Packaging。

U40-D 专项链通过：TypeScript、Renderer build、Electron build、focused tests、Issue #66 closeout verifier、U28、U29、U30、U32 和 U40-B 全产品用户旅程。

Branch Validation 通过：U28、U29、U30、U31、U32、当前行为 verifier、stable regression 和最终 production build。

## 缺陷状态

- U40-B01：已修复。
- U40-B02：已修复。
- U40-B03：已修复。
- U40-M01：已修复。
- U40-M02：已修复。
- U40-O01：环境 Observation；HTMLAudio 回退已验证，真实 mpv 安装状态由 Codex 检查。

## Codex 实机验收

详细文档：`docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md`

```text
音声库：E:\arsm
音乐库：D:\CloudMusic\VipSongsDownload
```

自动化没有访问上述真实目录。真实库只读；导入、Index 写入、备份恢复和回滚仅在临时副本执行。

本文件是 U40-D 最终验收编号的事实源。`PROJECT_STATE.md`、`WORKLOG.md` 或历史验收文档中出现的更早 U40-D Run/Artifact，属于修复兼容探针前已经通过的阶段性证据，不替代本文件的最终编号。
