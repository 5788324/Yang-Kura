# Yang-Kura 当前项目交接

## 固定事实

```text
repository: 5788324/Yang-Kura
public version: 1.0.0-rc.1
public tag: v1.0.0-rc.1 (GitHub Release + Prerelease)
main: 72066aa78b2eaa32f0750b115770d6847e5d46c9
RC 收尾（原 #92/#93 路径）：merged
local candidate: 1.0.0-rc.1
current cumulative scope: U41-D + Git Fast Lane v2.3 + U41-E
current candidate: U42 日常界面精简（Draft PR #94）
remote candidate branch: product/u42-daily-ui-simplification
Draft PR: #94
merged: NO
version/tag/release: NOT MODIFIED
1.0.0: NO-GO / WINDOWS VERIFY
（历史遗留标记：remote candidate branch/PR: NOT CONFIRMED / DO NOT CLAIM —— 指 U41-E 时期，U42 分支已推送）
```

## 候选内容

### U41-D / Git Fast Lane v2.3 / U41-E（已合并到 main）

- Downloader 退出生产路由、Sidebar、Router、源码和 bundle；94 个历史源码文件归档；
- Git Fast Lane v2.3：多文件源码只允许真实 clone + 原生 Git；
- 候选版本 `1.0.0-rc.1`；About 显示 RC 版本；单一 Windows RC workflow；
- `v1.0.0-rc.1` 标签与 Release 已创建。

### U42 日常界面精简（当前候选，Draft PR #94）

- 删除 PlayerBar 占位 More 按钮；音声/音乐库批量操作改为选择模式；
- RJ 音轨低频操作移入更多菜单；元数据备份/MPV 手动配置折叠；
- Importer 默认复制、移动入高级折叠；AI 维护改名“诊断与修复”折叠入口；
- 工程/主题文案纠偏；不新增功能、不改版本。
- 审查修复：删除 Importer 假按钮；音乐库批量入口仅 tracks；音声库入口模式内隐藏；
  RJ 菜单外部点击/Escape/焦点回退/相对路径验证；诊断入口移到普通设置之后；
  Player Fast Validation 改读 U40-B workflow；U42 Windows 测试接入 U40-B workflow。

## 本地证据（U42 审查修复后）

- `npm ci`：PASS；
- lint：PASS；
- Renderer build：PASS；
- Electron TypeScript build：PASS；
- verify-beta3-runtime-hardening（Player Fast Validation verifier）：PASS；
- verify:u42 / test:u42：PASS；
- verify:stable：PASS；
- U28 / U29 / U30 / U31 / U40-B / U41-B / U41-E：PASS；
- npm audit moderate：PASS / 0 vulnerabilities；
- Windows CI 与 artifact：由 GitHub U40-B workflow 执行并回读。

## 发布任务（U42）

```text
parent: 72066aa78b2eaa32f0750b115770d6847e5d46c9
branch: product/u42-daily-ui-simplification（已推送）
commit: ui: simplify daily controls and advanced actions（已推送）
Draft PR: #94（当前 Draft，等待审查）
push: exactly once（仅本轮修复提交允许一次额外推送）
```

历史任务（U41-E 时期）参考：`release/u41e-rc1-candidate`。U42 尚未合并、尚未发布。
