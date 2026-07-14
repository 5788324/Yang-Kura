#!/usr/bin/env node
import fs from 'node:fs';

function patchFile(target, replacements) {
  let source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
  for (const { label, before, after } of replacements) {
    if (source.includes(after)) {
      console.log(`${label} already applied.`);
      continue;
    }
    if (!source.includes(before)) throw new Error(`${label} anchor not found.`);
    source = source.replace(before, after);
    console.log(`${label} applied.`);
  }
  fs.writeFileSync(target, source, 'utf8');
}

patchFile('src/components/DiagnosticsPageShell.tsx', [
  {
    label: 'Diagnostics ASMR count marker',
    before: `<p className="mt-1 text-xl font-black text-text-primary">{workCount}</p>`,
    after: `<p id="u28-diagnostics-asmr-count" className="mt-1 text-xl font-black text-text-primary">{workCount}</p>`,
  },
  {
    label: 'Diagnostics music count marker',
    before: `<p className="mt-1 text-xl font-black text-text-primary">{albumCount}</p>`,
    after: `<p id="u28-diagnostics-music-count" className="mt-1 text-xl font-black text-text-primary">{albumCount}</p>`,
  },
  {
    label: 'Diagnostics status marker',
    before: `<p className="mt-1 text-sm font-bold text-emerald-300">{props.scanStatus || '尚未读取真实资源状态'}</p>`,
    after: `<p id="u28-diagnostics-index-status" className="mt-1 text-sm font-bold text-emerald-300">{props.scanStatus || '尚未读取真实资源状态'}</p>`,
  },
]);

patchFile('scripts/test-u28-electron-e2e.mjs', [
  {
    label: 'U28 E2E direct Diagnostics zero-count assertions',
    before: `    await expectBodyContains(runtime.cdp, '音声作品\\n0');\n    await expectBodyContains(runtime.cdp, '音乐专辑\\n0');`,
    after: `    assert.equal(await runtime.cdp.evaluate(\`document.querySelector('#u28-diagnostics-asmr-count')?.textContent?.trim()\`), '0', '诊断页音声作品计数应为 0');\n    assert.equal(await runtime.cdp.evaluate(\`document.querySelector('#u28-diagnostics-music-count')?.textContent?.trim()\`), '0', '诊断页音乐专辑计数应为 0');`,
  },
]);
