import fs from 'node:fs';

const required = [
  'NEXT_CHAT_HANDOFF.md',
  'RUN_ME_FIRST.md',
  'PROJECT_STATE.md',
  'docs/NEXT_CHAT_HANDOFF.md',
  'docs/RUN_ME_FIRST.md',
  'docs/PROJECT_STATE.md',
];

const tokens = [
  ['NEXT_CHAT_HANDOFF.md', '当前压缩包实际源码是 **AI Studio / React / Vite UI 原型**'],
  ['NEXT_CHAT_HANDOFF.md', '不要先写代码'],
  ['NEXT_CHAT_HANDOFF.md', 'Local JSON Index'],
  ['RUN_ME_FIRST.md', '不是：'],
  ['PROJECT_STATE.md', '未有'],
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(file)) failures.push(`missing ${file}`);
}
for (const [file, token] of tokens) {
  if (!fs.readFileSync(file, 'utf8').includes(token)) failures.push(`${file} missing token ${token}`);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-handoff] PASS');
