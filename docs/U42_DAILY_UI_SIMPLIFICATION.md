# U42 日常界面精简（Daily UI Simplification）

候选：`1.0.0-rc.1` 之上
基线：`main@72066aa78b2eaa32f0750b115770d6847e5d46c9`
分支：`product/u42-daily-ui-simplification`
类型：UI 精简，不新增功能

## 背景

产品评审 `docs/product-review/Yang-Kura_真实用户控件精简与功能缺口复审_2026-08-06_REV2.md`
指出日常界面的占位控件、工程化文案和低频操作挤占了高频操作，本候选完成第一轮精简。

## 范围（10 项）

1. **PlayerBar 占位 More 按钮**：移除 `更多播放操作（后续开放）` 按钮与
   `MORE_PLAYER_ACTIONS_MESSAGE`，保留收藏、歌单、歌词浮窗、音量、静音、
   完成策略与 `PlayerCompatibilityMarkers`。
2. **音声库批量选择模式**：`selectionMode` 默认关闭；点“批量管理”进入，
   显示全选/目标歌单/已选数量/退出；退出清空选择。
3. **音乐库批量选择模式**：同样默认隐藏；进入后显示全选/批量加入队列/退出。
4. **RJ 音轨低频操作移入更多菜单**：复制文件相对路径、在文件管理器中定位、
   用系统默认应用打开收进 `.u37c-track-menu`；Escape 与外部点击关闭；行上保留
   播放/加入队列/喜欢。
5. **音乐元数据面板分层**：备份与恢复折叠进“高级：备份与恢复”，专辑/曲目编辑保留。
6. **MPV 手动配置折叠**：设置页“高级播放组件设置”折叠，保留状态徽章与偏好。
7. **Importer 默认复制**：默认“复制到资源库”；“移动到资源库”入“高级导入选项”，
    收起时安全切回复制并清空旧状态；普通区域不存在假按钮（已删除“移动（高级）”）。
8. **诊断与修复入口**：“AI 维护”改名“诊断与修复”，入口折叠为低权重“高级”。
9. **工程化文案替换**：冲突预检→检查文件冲突；Index 备份/更新→创建资源库备份/更新
   资源库记录；OperationLog→操作记录；fallback→自动切换播放方式；
   复制相对记录→复制文件相对路径。
10. **主题文案纠偏**：`acrylic-mist` 为“云雾深色”（深色雾面）；
    `ocean-drops` 明确浅色低饱和。

## 明确不新增

播放历史页、收藏聚合、Ctrl+K、歌单全局搜索、系统主题跟随、随机播放、
新播放器模式、新元数据 Provider、新 Importer 后端、全局高级模式开关。

## 红线

不删除 PlayerCompatibilityMarkers；不隐藏 verifier 契约；保留 mpv 与 move 后端；
保留安全链（检查文件冲突、备份、操作记录、回滚、资源库记录更新）；
不重写 PlayerBar / Settings / Importer；普通区域不出现 `aria-disabled` 假按钮；
版本号不变；package-lock 不变。

## 审查修复（第二轮）

- 删除 Importer 假按钮“移动（高级）”，普通区域只有真实“复制到资源库”；
- 音乐库“批量管理”入口仅 `activeView === 'tracks'`，`switchView` 清空
  `selectionMode` / `selectedTrackIds` / 详情状态；专辑/艺术家/文件夹不新增批量模式；
- 音声库“批量管理”入口在 `selectionMode` 内隐藏，只留“退出批量管理”；
- RJ 更多菜单运行时验证：Escape / 外部点击关闭、焦点回退、同时最多一个、
  复制只含相对路径、DOM/Toast 无绝对路径与 `file://`；
- `AppRouter` 中 `SettingsMaintenanceEntry` 移到 `SettingsPage` 之后；
- Player Fast Validation（`verify-beta3-runtime-hardening`）改读
  `.github/workflows/u40b-full-product-acceptance.yml`；
- U42 Windows 测试接入 U40-B workflow（workflow 总数不增加）。

## 本地验证（审查修复后）

```text
npm ci --ignore-scripts --no-audit --no-fund        PASS
npm audit --audit-level=moderate                     PASS / 0 vulnerabilities
npm run lint                                         PASS
npm run build / build:electron                       PASS
node scripts/verify-beta3-runtime-hardening.mjs      PASS（Player Fast Validation）
npm run verify:u42-daily-ui-simplification           PASS
npm run test:u42:daily-ui                            PASS
npm run verify:stable                                PASS（含 verify:u42）
node scripts/test-u28-electron-e2e.mjs               PASS
node scripts/test-u29-electron-e2e.mjs               PASS
node scripts/test-u30-ui-matrix.mjs                  PASS
node scripts/test-u31-importer-transactions.mjs      PASS
node scripts/test-u41b-importer-daily-e2e.mjs        PASS
node scripts/test-u41e-rc-final-acceptance.mjs       PASS
node scripts/test-u41e-lyrics-subtitle-layout.mjs    PASS
```

## GitHub CI

- 修复推送后回读当前 PR 全部 workflow：Player Fast Validation、U40-B Full Product
  Acceptance（含 U42 步骤与 artifact）、UI Fast Validation、Documentation Validation、
  U41-C、U41-B、U41-E、Architecture Guardrails、Branch Validation。
- U40-B 上一轮 GitHub `Service Unavailable` 属于基础设施失败，不修改产品源码；
  本轮推送会自然重跑。
- 在所有 workflow 回读全绿之前，不写“GitHub checks 全部 PASS”。

响应式覆盖：800×700@100%、800×700@125%、1024×720@100%、1280×800@125%，无横向溢出。

## 交付物

- `scripts/verify-u42-daily-ui-simplification.mjs`：静态契约 verifier。
- `scripts/test-u42-daily-ui-simplification.mjs`：Windows UI 测试。
- 截图证据：仓库外 `evidence/user-journey/u42-daily-ui-simplification/`
  （before 10 张 / after 若干 + MANIFEST + SHA256SUMS）；GitHub U40-B workflow
  上传 `artifacts/u42-daily-ui-simplification`。
- 提交：`ui: simplify daily controls and advanced actions`（已推送）+
  `fix: close U42 review and CI gaps`（本轮修复，一次推送）。
- PR：Draft PR #94（不合并）。
