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
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
  'docs/DESIGN.md',
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'docs/U30_UI_FAST_TRACK_ACCEPTANCE.md',
  'docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md',
  'docs/U32_RELEASE_CANDIDATE_PACKAGING.md',
  'docs/RELEASE_NOTES_0.168.0-beta.1.md',
  'release/u33-release-plan.json',
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
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'AUTONOMOUS_DELIVERY_RULES.md'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '用户只接收最终成果'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Beta 1：已发布并完成远端资产校验'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：Beta 2 代码结构/质量整备 + UI 全面重写'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '目标版本：0.169.0-beta.2'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '### U34：联合审计'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '### U40～U41：质量和发布'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '正式下载器 / MVP130'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', 'Codex 只处理自动化无法替代的实机环节'],
  ['PROJECT_STATE.md', '核心版本：0.168.0-beta.1'],
  ['PROJECT_STATE.md', 'Beta 1：已发布并完成远端资产回读'],
  ['PROJECT_STATE.md', '当前阶段：Beta 2 规划与实施准备'],
  ['PROJECT_STATE.md', '目标版本：0.169.0-beta.2'],
  ['PROJECT_STATE.md', '### U34：联合审计与基线'],
  ['PROJECT_ROADMAP.md', '已完成主线：U02～U33'],
  ['PROJECT_ROADMAP.md', '当前计划：U34～U41 Beta 2 联合整备'],
  ['PROJECT_ROADMAP.md', 'Beta 2 目标：0.169.0-beta.2'],
  ['PROJECT_ROADMAP.md', '## 5. 当前主线：Beta 2 联合整备'],
  ['PROJECT_ROADMAP.md', 'MVP130'],
  ['PROJECT_ROADMAP.md', '冻结'],
  ['docs/DESIGN.md', '暮夜琥珀'],
  ['docs/DESIGN.md', '雾光象牙'],
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

console.log('[verify-handoff] Beta 1 completion and Beta 2 handoff PASS');
