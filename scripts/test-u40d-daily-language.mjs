#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const settings = fs.readFileSync('src/components/SettingsPageDaily.tsx', 'utf8');
const router = fs.readFileSync('src/app/AppRouter.tsx', 'utf8');
const diagnostics = fs.readFileSync('src/components/DiagnosticsPageShell.tsx', 'utf8');

assert.match(router, /SettingsPageDaily/);
assert.doesNotMatch(router, /import\('\.\.\/components\/SettingsPage'\)/);
assert.doesNotMatch(diagnostics, /import\('\.\/DiagnosticsPage'\)/);
for (const term of ['Renderer', 'IPC', 'contract', 'npm run', 'YANG_KURA_']) {
  assert.equal(settings.includes(term), false, `daily settings exposes ${term}`);
}
for (const phrase of ['本地资源库', '读取已有记录', '一键扫描并应用', '关于与隐私']) {
  assert.ok(settings.includes(phrase), `daily settings missing ${phrase}`);
}
console.log('[test-u40d-daily-language] daily settings terminology PASS');
