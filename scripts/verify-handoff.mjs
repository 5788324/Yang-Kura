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
  'docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['00_NEW_CHAT_START_HERE.md', 'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md'],
  ['00_NEW_CHAT_START_HERE.md', 'U27 最终结论：NO-GO'],
  ['NEW_CHAT_PROMPT.md', 'MAJ-001'],
  ['NEW_CHAT_PROMPT.md', 'MAJ-002'],
  ['NEW_CHAT_PROMPT_FULL.md', '最新 `origin/main`'],
  ['NEXT_CHAT_HANDOFF.md', 'U28 完成条件'],
  ['RUN_ME_FIRST.md', 'git pull --ff-only origin main'],
  ['RUN_ME_FIRST.md', 'npm run verify:stable'],
  ['AI_HANDOFF/00_READ_THIS_FIRST.md', 'CURRENT_PROJECT_HANDOFF.md'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'AUTONOMOUS_DELIVERY_RULES.md'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '用户只接收最终成果'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U29：播放器、Seek、队列、续播与字幕全流程'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U30'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', '用户只接收最终成果'],
  ['AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md', 'Codex 只处理自动化无法替代的实机环节'],
  ['PROJECT_STATE.md', '核心版本：0.167.0-mvp129'],
  ['PROJECT_STATE.md', 'U29 已完成实现和自动化验收'],
  ['PROJECT_STATE.md', '下一任务：U30'],
  ['PROJECT_ROADMAP.md', '当前主线：U30 日常 UI、三主题、窗口、DPI 与键盘'],
  ['PROJECT_ROADMAP.md', 'MVP130'],
  ['PROJECT_ROADMAP.md', '冻结'],
  ['PROJECT_ROADMAP.md', '禁止合入'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'AUTOMATED GO'],
  ['docs/U29_PLAYER_RELIABILITY_ACCEPTANCE.md', 'Windows Electron 全链路场景'],
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

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('[verify-handoff] current U29 completion and U30 autonomous handoff PASS');
