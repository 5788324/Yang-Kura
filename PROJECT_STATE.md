# PROJECT_STATE

## 当前状态

```text
公开版本：0.170.0-beta.3
公开标签：v0.170.0-beta.3
main：18ada58b76a3aa0828506d2d02c57ecd22fbc587
PR #92：已合并
本地候选版本：1.0.0-rc.1
当前候选：U41-D + Git Fast Lane v2.3 + U41-E
远端候选分支/PR：不存在可靠证据
RC tag / Release：NOT CREATED
1.0.0：NO-GO / WINDOWS VERIFY
```

## 累积候选内容

### U41-D

1. Downloader 从 `PageType`、导航、Sidebar、AppRouter 和生产源码退出；
2. Downloader 与 93 个不可达历史实现迁入 `archive/u41d-legacy-code/`；
3. archive 不参与 TypeScript 和 Vite 产品构建；
4. workflow 17→9，verifier 87→58；
5. 不可达实现 93→0，保留 2 个全局 `.d.ts` 声明例外；
6. 构建产物不再包含 Downloader chunk。

### Git Fast Lane v2.3

- 多文件源码只允许真实 clone + 原生 Git；
- 一次正常尝试 + 最多一次同路径修复重试；
- 仍失败立即停止并交给 Codex/DeepSeek；
- 禁止 GitHub Contents API 逐文件提交；
- 禁止手工创建大量 blob/tree/commit；
- 未经远端回读不得宣称 branch、commit、PR 或 CI 已存在。

### U41-E

- `package.json` / lockfile 候选版本：`1.0.0-rc.1`；
- About 继续使用单一版本来源；
- U32 Windows workflow 升级为 `U41-E Release Candidate Final Acceptance`，workflow 总数保持 9；
- 新增 7 路由 × 3 视口的可见控件、溢出、最小尺寸、键盘焦点和 About 版本门禁；
- 复用 U28/U29/U30/U31/U40-B/U41-B 及 portable/NSIS、安装升级卸载与数据保留验收。

## 已通过

```text
npm ci --ignore-scripts --no-audit --no-fund   PASS
npm run lint                                    PASS
npm run build                                   PASS / 1781 modules
npm run build:electron                          PASS
npm run verify:u41d-legacy-cleanup              PASS
npm run verify:u41e-rc-final-acceptance         PASS
```

`npm audit --audit-level=moderate`：PASS / 0 vulnerabilities。

`npm run verify:stable`：PASS，包含环境、TypeScript、Renderer/Electron build、handoff、U41-B/C/D/E、mpv、Importer、50,000 音轨和 Index maintenance。

## 尚未执行

```text
U41-E Electron 1280/1024/800 可见矩阵：NOT RUN
U28/U29 Windows Electron：NOT RUN（本候选 SHA）
portable / NSIS：NOT RUN（本候选 SHA）
安装、覆盖安装、卸载、数据保留：NOT RUN（本候选 SHA）
Codex 真实 Windows / 声卡 / 显示器验收：NOT RUN
```

本地 Electron 二进制下载因 DNS 无法解析 GitHub；按 Git Fast Lane v2.3 只尝试官方源和一个镜像，各一次后停止，没有继续绕路。

## 下一步

由 Codex 在干净 clone 中固定父 SHA `18ada58b...`，应用累积源码包，创建 `release/u41e-rc1-candidate`，形成一个提交并一次推送 Draft PR。CI 全绿且 Codex 实机 PASS 后，才讨论 `v1.0.0-rc.1` 标签和 Release。
