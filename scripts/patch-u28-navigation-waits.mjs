#!/usr/bin/env node
import fs from 'node:fs';

const target = 'scripts/test-u28-electron-e2e.mjs';
let source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');

const replacements = [
  {
    label: 'empty ASMR page route wait',
    before: `    await navigate(runtime.cdp, 'asmr-lib');\n    await expectBodyContains(runtime.cdp, '音声库');`,
    after: `    await navigate(runtime.cdp, 'asmr-lib');\n    await waitForBodyText(runtime.cdp, '音声库');\n    await expectBodyContains(runtime.cdp, '音声库');`,
  },
  {
    label: 'empty music page route wait',
    before: `    await navigate(runtime.cdp, 'music-lib');\n    await expectBodyContains(runtime.cdp, '音乐库');`,
    after: `    await navigate(runtime.cdp, 'music-lib');\n    await waitForBodyText(runtime.cdp, '音乐库');\n    await expectBodyContains(runtime.cdp, '音乐库');`,
  },
];

for (const replacement of replacements) {
  if (source.includes(replacement.after)) {
    console.log(`${replacement.label} already applied.`);
    continue;
  }
  if (!source.includes(replacement.before)) throw new Error(`${replacement.label} anchor not found.`);
  source = source.replace(replacement.before, replacement.after);
  console.log(`${replacement.label} applied.`);
}

fs.writeFileSync(target, source, 'utf8');
