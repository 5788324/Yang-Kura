# PROJECT_ROADMAP

## 基线

```text
公开版本：1.0.0-rc.1
公开标签：v1.0.0-rc.1（已发布）
main：72066aa78b2eaa32f0750b115770d6847e5d46c9
本地候选版本：1.0.0-rc.1
历史主线：U41-E 1.0 RC 最终验收
当前主线：U42 日常界面精简
正式目标：1.0.0
1.0：仍为 RC，待 Windows 最终验收
```

## 已完成

- U19～U22：播放器主控、辅助控制区、事件可靠性、动作与歌单决策；
- U28～U31：真实 Index 诊断、播放可靠性、响应式主题矩阵、Importer 事务；
- U32：Windows 视觉与控件审计；
- U34～U40：架构、日常页面、播放器、真实库、重启、封面和 Beta 3；
- U41-A：产品 UI / 功能 / 按钮 / 代码表面审计；
- U41-B：真实 Importer（copy/move、预检、Index patch、OperationLog、回滚）；
- U41-C：Electron 39.8.10、运行时 hardening、Windows 打包验收；
- U41-D：Downloader 退出生产、不可达实现归零、workflow/verifier 收敛；
- U41-E：1.0 RC 最终验收、RC 版本、Git Fast Lane v2.3；
- 合并 Release Candidate 收尾到 `main@72066aa...`，创建 `v1.0.0-rc.1` 标签与 Release。

## U42：当前候选

目标：按产品评审 REV2 对日常界面做第一轮精简，不新增功能、不改版本、不动 Tag/Release。

1. 删除 PlayerBar 占位 More 按钮；
2. 音声库批量操作改为选择模式（默认隐藏）；
3. 音乐库批量操作改为选择模式；
4. RJ 音轨低频操作移入“更多”菜单；
5. 音乐元数据面板备份/恢复折叠；
6. MPV 手动配置折叠；
7. Importer 默认复制、移动入高级折叠；
8. “AI 维护”→“诊断与修复”折叠入口；
9. 工程化文案替换为日常文案；
10. 主题文案纠偏（acrylic-mist 深色雾面）。

交付：`ui: simplify daily controls and advanced actions` 单一提交 + Draft PR（不合并）。

## U42 门禁

1. `npm ci --ignore-scripts --no-audit --no-fund` PASS；
2. `npm audit --audit-level=moderate` 0 漏洞；
3. `npm run lint` PASS；
4. `npm run build` / `build:electron` PASS；
5. `npm run verify:stable` PASS（含 U42 verifier）；
6. `npm run test:u42:daily-ui` PASS（800×700、1024×720、1280×800，100%/125%）；
7. 修复前后截图证据（13 项，仓库外）；
8. Draft PR 全绿，Codex 实机 PASS。

## 后续顺序

```text
U42 Draft PR + Windows CI
→ Codex 固定 SHA 实机验收
→ 截图证据收口
→ 评审通过后合并 U42
→ 继续 RC 观察与缺陷收口
→ 1.0.0 最终候选
→ Windows 最终验收
→ v1.0.0
```

## 冻结范围

Downloader、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步、插件市场和全局架构重写不进入 1.0 RC。U42 不新增播放历史页、收藏聚合、Ctrl+K、歌单全局搜索、系统主题跟随、随机播放、新播放器模式、新元数据 Provider、新 Importer 后端与全局高级模式开关。

## Git 发布约束

以 `docs/GIT_FAST_LANE_V2.md` v2.3 为唯一有效规则：禁止 GitHub API 多文件源码发布；真实 Git 发布失败最多一次同路径重试，随后立即交给 Codex，不再消耗时间绕过连接器限制。
