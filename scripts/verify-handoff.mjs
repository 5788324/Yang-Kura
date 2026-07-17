import fs from 'node:fs';

const required = [
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'MVP130_EXPERIMENTAL_DO_NOT_MERGE.md',
  'AI_HANDOFF/00_READ_THIS_FIRST.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
  'docs/DESIGN.md',
  'docs/architecture/ARCHITECTURE_AUDIT.md',
  'docs/architecture/DEPENDENCY_MAP.md',
  'docs/architecture/REFACTOR_BACKLOG.md',
  'docs/architecture/U35A_FOUNDATION.md',
  'docs/architecture/U35B_PRODUCTION_SHELL.md',
  'docs/architecture/U36A_SHELL_ROUTER_IPC.md',
  'docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md',
  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',
  'docs/architecture/U37_EXECUTION_PLAN.md',
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'docs/U30_UI_FAST_TRACK_ACCEPTANCE.md',
  'docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md',
  'docs/U32_RELEASE_CANDIDATE_PACKAGING.md',
  'docs/RELEASE_NOTES_0.168.0-beta.1.md',
  'release/u33-release-plan.json',
  '.github/workflows/docs-validation.yml',
  '.github/workflows/u33-release-preflight.yml',
  '.github/workflows/u33-beta-release.yml',
  'scripts/verify-u33-release-preflight.mjs',
  'scripts/verify-u33-published-release.mjs',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['00_NEW_CHAT_START_HERE.md', 'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md'],
  ['00_NEW_CHAT_START_HERE.md', '当前主线：U33 Beta 发布'],
  ['00_NEW_CHAT_START_HERE.md', 'Codex 默认只负责'],
  ['NEW_CHAT_PROMPT.md', '当前路线是 U33 Beta 发布'],
  ['NEW_CHAT_PROMPT.md', 'v0.168.0-beta.1'],
  ['NEW_CHAT_PROMPT_FULL.md', '最新 `origin/main`'],
  ['NEW_CHAT_PROMPT_FULL.md', '当前阶段：U33 Beta 发布'],
  ['NEW_CHAT_PROMPT_FULL.md', '用户只接收最终成果'],
  ['NEW_CHAT_PROMPT_FULL.md', 'main-only publish'],
  ['NEXT_CHAT_HANDOFF.md', 'U33 当前顺序'],
  ['NEXT_CHAT_HANDOFF.md', 'Codex 默认只负责'],
  ['RUN_ME_FIRST.md', 'git pull --ff-only origin main'],
  ['RUN_ME_FIRST.md', 'npm run verify:stable'],
  ['RUN_ME_FIRST.md', '当前主线是 U33 Beta 发布'],
  ['AI_HANDOFF/00_READ_THIS_FIRST.md', 'CURRENT_PROJECT_HANDOFF.md'],
  ['AI_HANDOFF/00_READ_THIS_FIRST.md', '当前阶段：U33 Beta 发布'],

  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '用户只接收最终成果'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Beta 1：已发布并完成远端资产校验'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U37-C：完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U37-D 音乐库与详情 UI'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '发布条件：媒体库正式页面完成并通过 Windows 发布候选'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 6. 当前任务：U37-D 音乐库与详情 UI'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 7. 个人日用版发布'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 10. 执行效率硬规则'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '正式下载器 / MVP130'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '长期冻结，除非用户明确重新解冻'],

  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', 'Codex 只处理自动化无法替代的实机环节'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '## 2026-07-16 执行效率事故与长期硬规则'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '禁止“发现一个失败 → 修一个 → 推一次 → 跑一次完整 CI”的循环'],

  ['AI_HANDOFF/WORKLOG.md', '### U35-A'],
  ['AI_HANDOFF/WORKLOG.md', '### U35-B'],
  ['AI_HANDOFF/WORKLOG.md', '### U36-A'],
  ['AI_HANDOFF/WORKLOG.md', '### U36-B'],
  ['AI_HANDOFF/WORKLOG.md', '### U36-C'],
  ['AI_HANDOFF/WORKLOG.md', '### U37-A'],
  ['AI_HANDOFF/WORKLOG.md', '### U37-B'],
  ['AI_HANDOFF/WORKLOG.md', '### U37-C'],
  ['AI_HANDOFF/WORKLOG.md', '### 项目治理与发布策略更新'],
  ['AI_HANDOFF/WORKLOG.md', '当前任务：U37-D 音乐库与详情 UI'],
  ['AI_HANDOFF/WORKLOG.md', '个人日用版发布：U37 完成后'],

  ['PROJECT_STATE.md', '核心版本：0.168.0-beta.1'],
  ['PROJECT_STATE.md', 'Beta 1：已发布并完成远端资产回读'],
  ['PROJECT_STATE.md', 'U34～U36：架构基础与契约整备完成'],
  ['PROJECT_STATE.md', 'U37-C：RJ 详情 UI 完成'],
  ['PROJECT_STATE.md', '当前任务：U37-D 音乐库与详情 UI'],
  ['PROJECT_STATE.md', '发布条件：媒体库正式页面完成 + 核心回归与 Windows 发布候选通过'],
  ['PROJECT_STATE.md', '## 技术债治理'],
  ['PROJECT_STATE.md', '大型功能：长期冻结，除非用户明确重新解冻'],

  ['PROJECT_ROADMAP.md', '版本：0.168.0-beta.1'],
  ['PROJECT_ROADMAP.md', 'U37-C：完成'],
  ['PROJECT_ROADMAP.md', '当前任务：U37-D 音乐库与详情 UI'],
  ['PROJECT_ROADMAP.md', '个人日用版发布：U37 完成后'],
  ['PROJECT_ROADMAP.md', '## 6. 技术债治理'],
  ['PROJECT_ROADMAP.md', '## 8. 长期冻结的大功能'],
  ['PROJECT_ROADMAP.md', 'MVP130'],

  ['docs/DESIGN.md', '暮夜琥珀'],
  ['docs/DESIGN.md', '雾光象牙'],
  ['docs/architecture/ARCHITECTURE_AUDIT.md', '结论：GO'],
  ['docs/architecture/ARCHITECTURE_AUDIT.md', '不可破坏行为清单'],
  ['docs/architecture/DEPENDENCY_MAP.md', '目标依赖方向'],
  ['docs/architecture/DEPENDENCY_MAP.md', '硬性禁止依赖'],
  ['docs/architecture/REFACTOR_BACKLOG.md', 'B2-1：U34 审计与流程修正'],
  ['docs/architecture/REFACTOR_BACKLOG.md', '9～13 个有效开发轮次'],
  ['docs/architecture/U35A_FOUNDATION.md', 'IPC'],
  ['docs/architecture/U35B_PRODUCTION_SHELL.md', 'AppShell'],
  ['docs/architecture/U36A_SHELL_ROUTER_IPC.md', '统一导航注册表'],
  ['docs/architecture/U36A_SHELL_ROUTER_IPC.md', 'IPC_CHANNELS'],
  ['docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md', 'App Router'],
  ['docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md', 'Player Overlay Host'],
  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'Main IPC 分域注册'],
  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'registerInvokeHandler'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-A：页面状态与错误恢复'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-B：首页与音声库列表 — 已完成'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-C：RJ 详情 — 已完成'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-D：音乐库、专辑与艺术家详情 — 当前任务'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'Windows 发布候选与个人日用版发布'],

  ['.github/workflows/docs-validation.yml', 'Documentation Validation'],
  ['.github/workflows/docs-validation.yml', 'Lightweight documentation consistency'],
  ['docs/NEXT_CHAT_HANDOFF.md', '当前主线：U33 Beta 发布'],
  ['docs/RUN_ME_FIRST.md', '当前主线是 U33 Beta 发布'],
  ['docs/PROJECT_STATE.md', '当前任务：U33 Beta 发布'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'Windows Electron 全链路场景'],
  ['docs/U30_UI_FAST_TRACK_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U30_UI_FAST_TRACK_ACCEPTANCE.md', '自动窗口与主题矩阵'],
  ['docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md', 'test:u31:importer-transactions'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'AUTOMATED GO'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'portable'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'NSIS'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'SHA256SUMS.txt'],
  ['docs/RELEASE_NOTES_0.168.0-beta.1.md', 'Yang-Kura 0.168.0 Beta 1'],
  ['docs/RELEASE_NOTES_0.168.0-beta.1.md', '已知限制'],
  ['release/u33-release-plan.json', '0.168.0-beta.1'],
  ['release/u33-release-plan.json', 'v0.168.0-beta.1'],
  ['.github/workflows/u33-beta-release.yml', "github.event_name == 'push' && github.ref == 'refs/heads/main'"],
  ['.github/workflows/u33-beta-release.yml', 'contents: write'],
  ['MVP130_EXPERIMENTAL_DO_NOT_MERGE.md', '824c914f844b1ac57391df8ebb5c1f30c8b40903145b3a66e6a13e95e5413efe'],
];

const activeHandoffFiles = [
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'AI_HANDOFF/00_READ_THIS_FIRST.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
];

const forbiddenActiveTokens = [
  '316d8127d6d423a1d9e6930b8b804a3bac11140e',
  '当前质量任务：U09',
  '当前阶段是实际日常使用观察',
  'Round 6 最终 Git 合入：PASS',
  '核心版本：0.167.0-mvp129',
  'U02～U26：已完成',
  '当前主线：U28',
  '当前任务：U28',
  '阻断项：MAJ-001、MAJ-002',
  '阻断问题：MAJ-001、MAJ-002',
  '版本应为 `0.167.0-mvp129`',
  '当前明确要求暂停开发',
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}

for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) {
    failures.push(`${file} missing token ${token}`);
  }
}

for (const file of activeHandoffFiles) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const token of forbiddenActiveTokens) {
    if (source.includes(token)) failures.push(`${file} retains stale handoff token ${token}`);
  }
}

for (const temporary of ['scripts/apply-u33-version.mjs', '.github/workflows/u33-version-sync.yml']) {
  if (fs.existsSync(temporary)) failures.push(`temporary U33 version-sync file remains: ${temporary}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[verify-handoff] U37-C complete; U37-D leads to personal-use release PASS');
