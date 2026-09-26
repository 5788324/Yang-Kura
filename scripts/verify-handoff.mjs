#!/usr/bin/env node
import fs from 'node:fs';

const required = [
  'README.md',
  'START_HERE.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'TASKS.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md',
  'AI_HANDOFF/WORKLOG.md',
  'docs/DESIGN.md',
  'docs/GIT_FAST_LANE_V2.md',
];

const tokens = [
  ['README.md', 'Kura Desktop 2.0'],
  ['START_HERE.md', 'K2-R5'],
  ['PROJECT_STATE.md', 'K2-R5'],
  ['PROJECT_ROADMAP.md', 'K2-R9'],
  ['TASKS.md', 'ACTIVE — K2-R5'],
  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'K2-R5'],
  ['AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md', 'K2-R5'],
  ['AI_HANDOFF/WORKLOG.md', 'K2-R0'],
];

const staleTokens = [
  'PR #94 仍 Draft',
  'U42 尚未合并',
  '当前 main = 72066aa',
  'BLOCKED BY INPUT / WAITING FOR LATEST LOCAL SOURCE',
  '当前任务：U41-D',
];

const activeDocs = [
  'README.md',
  'START_HERE.md',
  'PROJECT_STATE.md',
  'PROJECT_ROADMAP.md',
  'TASKS.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/NEXT_CONVERSATION_PROMPT.md',
];

const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`missing ${file}`);
for (const [file, token] of tokens) {
  if (!fs.existsSync(file) || !fs.readFileSync(file, 'utf8').includes(token)) {
    failures.push(`${file} missing token ${token}`);
  }
}
for (const file of activeDocs) {
  const source = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  for (const token of staleTokens) if (source.includes(token)) failures.push(`${file} retains stale token ${token}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] Kura 2.0 current handoff contract PASS');
