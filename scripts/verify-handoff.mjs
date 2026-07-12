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
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
  'archive/legacy-mvp-history/README.md',
];

const tokens = [
  ['00_NEW_CHAT_START_HERE.md', '0.167.0-mvp129'],
  ['00_NEW_CHAT_START_HERE.md', 'MVP130'],
  ['NEW_CHAT_PROMPT.md', '55e33b3'],
  ['NEXT_CHAT_HANDOFF.md', 'Round 4 Windows 发布门禁：PASS'],
  ['RUN_ME_FIRST.md', 'npm run verify:stable'],
  ['PROJECT_STATE.md', 'MVP129 稳定候选'],
  ['PROJECT_ROADMAP.md', '下载器：冻结'],
  ['MVP130_EXPERIMENTAL_DO_NOT_MERGE.md', '824c914f844b1ac57391df8ebb5c1f30c8b40903145b3a66e6a13e95e5413efe'],
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) failures.push(`${file} missing token ${token}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] MVP129 stable handoff PASS');
