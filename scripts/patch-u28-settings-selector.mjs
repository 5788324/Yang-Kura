#!/usr/bin/env node
import fs from 'node:fs';

function patchFile(target, before, after, label) {
  let source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  if (source.includes(after)) {
    console.log(`${label} already applied.`);
    return;
  }
  if (!source.includes(before)) throw new Error(`${label} anchor not found.`);
  source = source.replace(before, after);
  fs.writeFileSync(target, source, 'utf8');
  console.log(`${label} applied.`);
}

patchFile(
  'src/components/SettingsPage.tsx',
  `              <button\n                key={tab.id}\n                onClick={() => setActiveTab(tab.id)}`,
  `              <button\n                key={tab.id}\n                data-settings-tab={tab.id}\n                onClick={() => setActiveTab(tab.id)}`,
  'Settings stable sub-navigation marker',
);

patchFile(
  'scripts/test-u28-electron-e2e.mjs',
  `async function openSettingsPaths(cdp) {\n  await navigate(cdp, 'settings');\n  await clickVisibleText(cdp, '资源库目录', 'button', false);\n  await waitForBodyText(cdp, '选择本地资源库目录');\n}`,
  `async function openSettingsPaths(cdp) {\n  await navigate(cdp, 'settings');\n  await waitForBodyText(cdp, '应用设置');\n  await clickSelector(cdp, '[data-settings-tab="paths"]');\n  await waitForBodyText(cdp, '选择本地资源库目录');\n}`,
  'U28 E2E stable Settings navigation',
);
