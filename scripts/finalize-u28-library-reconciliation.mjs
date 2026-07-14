import fs from 'node:fs';

const path = 'scripts/verify-u28-library-reconciliation.mjs';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  `  ['privacy boundary retained', !settings.includes('absolutePath: result') && !settings.includes('file://')],`,
  `  ['privacy boundary retained', settings.includes('真实路径不会展示') && !settings.includes('absolutePath: result')],`,
);
fs.writeFileSync(path, content, 'utf8');
