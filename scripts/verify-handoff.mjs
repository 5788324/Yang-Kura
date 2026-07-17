import fs from 'node:fs';

const required = [
  '00_NEW_CHAT_START_HERE.md',
  'NEW_CHAT_PROMPT.md',
  'NEW_CHAT_PROMPT_FULL.md',
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'README.md',
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
  'docs/architecture/U37_EXECUTION_PLAN.md',
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'docs/U30_UI_FAST_TRACK_ACCEPTANCE.md',
  'docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md',
  'docs/U32_RELEASE_CANDIDATE_PACKAGING.md',
  'docs/RELEASE_NOTES_0.168.0-beta.1.md',
  'docs/RELEASE_NOTES_0.169.0-beta.2.md',
  'release/u33-release-plan.json',
  'release/u33-publication-state.json',
  '.github/workflows/docs-validation.yml',
  '.github/workflows/u33-release-preflight.yml',
  '.github/workflows/u33-beta-release.yml',
  'scripts/verify-u33-release-preflight.mjs',
  'scripts/verify-u33-published-release.mjs',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['00_NEW_CHAT_START_HERE.md', '0.169.0-beta.2'],
  ['00_NEW_CHAT_START_HERE.md', '当前主线：发布 Beta 2 个人日用版'],
  ['NEW_CHAT_PROMPT.md', '当前路线是发布 Beta 2 个人日用版'],
  ['NEW_CHAT_PROMPT_FULL.md', '最新 `origin/main`'],
  ['NEW_CHAT_PROMPT_FULL.md', 'main-only publish'],
  ['NEXT_CHAT_HANDOFF.md', 'Personal Beta Release'],
  ['RUN_ME_FIRST.md', 'git pull --ff-only origin main'],
  ['RUN_ME_FIRST.md', 'npm run verify:stable'],
  ['RUN_ME_FIRST.md', 'package.json` 版本与 `PROJECT_STATE.md` 当前核心版本一致'],
  ['AI_HANDOFF/00_READ_THIS_FIRST.md', '发布 Beta 2 个人日用版'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '用户只接收最终成果'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前版本：0.169.0-beta.2'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'Beta 1：已发布并完成远端资产校验'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U37-D：完成'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：发布 0.169.0 Beta 2 个人日用版'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '正式下载器 / MVP130'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', 'Codex 只处理自动化无法替代的实机环节'],
  ['AI_HANDOFF/WORKLOG.md', '### U37-D — 音乐库与详情 UI'],
  ['AI_HANDOFF/WORKLOG.md', 'Beta 2 个人日用版发布准备'],
  ['PROJECT_STATE.md', '核心版本：0.169.0-beta.2'],
  ['PROJECT_STATE.md', 'Beta 1：已发布并完成远端资产回读'],
  ['PROJECT_STATE.md', 'U37-D：音乐库与详情 UI 完成'],
  ['PROJECT_STATE.md', '当前任务：发布 0.169.0 Beta 2 个人日用版'],
  ['PROJECT_STATE.md', '## 技术债治理'],
  ['PROJECT_STATE.md', '0.167.0-mvp129'],
  ['PROJECT_ROADMAP.md', '版本：0.169.0-beta.2'],
  ['PROJECT_ROADMAP.md', 'Beta 1：已发布并完成远端资产校验'],
  ['PROJECT_ROADMAP.md', 'U37-D：完成'],
  ['PROJECT_ROADMAP.md', '当前任务：发布 0.169.0 Beta 2 个人日用版'],
  ['PROJECT_ROADMAP.md', '## 6. 技术债治理'],
  ['PROJECT_ROADMAP.md', '## 8. 长期冻结的大功能'],
  ['docs/PROJECT_STATE.md', '当前任务：发布 0.169.0 Beta 2 个人日用版'],
  ['docs/DESIGN.md', '暮夜琥珀'],
  ['docs/DESIGN.md', '雾光象牙'],
  ['docs/architecture/ARCHITECTURE_AUDIT.md', '结论：GO'],
  ['docs/architecture/DEPENDENCY_MAP.md', '目标依赖方向'],
  ['docs/architecture/REFACTOR_BACKLOG.md', 'B2-1：U34 审计与流程修正'],
  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37 状态：全部完成'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U30_UI_FAST_TRACK_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U31_IMPORTER_TRANSACTION_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U32_RELEASE_CANDIDATE_PACKAGING.md', 'AUTOMATED GO'],
  ['docs/RELEASE_NOTES_0.168.0-beta.1.md', 'Yang-Kura 0.168.0 Beta 1'],
  ['docs/RELEASE_NOTES_0.169.0-beta.2.md', 'Yang-Kura 0.169.0 Beta 2 · 个人日用版'],
  ['release/u33-release-plan.json', '0.169.0-beta.2'],
  ['release/u33-release-plan.json', 'v0.169.0-beta.2'],
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
  'README.md',
  'AI_HANDOFF/00_READ_THIS_FIRST.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
];

const forbiddenActiveTokens = [
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
  '当前主线：U33 Beta 发布',
  '当前路线是 U33 Beta 发布',
  '当前阶段：U33 Beta 发布',
];

const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing ${file}`);
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(`${file} missing token ${token}`);
}
for (const file of activeHandoffFiles) {
  if (!fs.existsSync(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  for (const token of forbiddenActiveTokens) if (source.includes(token)) failures.push(`${file} retains stale handoff token ${token}`);
}
for (const temporary of ['.github/workflows/beta2-version-sync.yml', '.github/workflows/beta2-release-prep.yml']) {
  if (fs.existsSync(temporary)) failures.push(`temporary Beta 2 preparation workflow remains: ${temporary}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] Beta 2 personal-use release candidate handoff PASS');
