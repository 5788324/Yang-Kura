#!/usr/bin/env node
import fs from 'node:fs';

const target = 'scripts/test-u28-electron-e2e.mjs';
let source = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');

const emptyBefore = `    await clickSelector(runtime.cdp, '#sidebar-ai-maintenance-toggle');\n    await navigate(runtime.cdp, 'diagnostics');\n    await waitForBodyText(runtime.cdp, '已从真实 Index 映射 0 个音声作品、0 个音乐专辑');\n    await expectBodyContains(runtime.cdp, '音声作品\\n0');\n    await expectBodyContains(runtime.cdp, '音乐专辑\\n0');\n    await expectBodyExcludes(runtime.cdp, 'Demo 扫描演示');`;
const emptyAfter = `    await clickSelector(runtime.cdp, '#sidebar-ai-maintenance-toggle');\n    await navigate(runtime.cdp, 'diagnostics');\n    await waitForBodyText(runtime.cdp, '日常状态');\n    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：0 个音声集合，0 个音乐集合，0 条轨道。');\n    await expectBodyContains(runtime.cdp, '音声作品\\n0');\n    await expectBodyContains(runtime.cdp, '音乐专辑\\n0');\n    await clickVisibleText(runtime.cdp, '刷新真实资源状态', 'button');\n    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：0 个音声集合，0 个音乐集合，0 条轨道。');\n    await expectBodyExcludes(runtime.cdp, 'Demo 扫描演示');`;

const populatedBefore = `    await clickSelector(runtime.cdp, '#sidebar-ai-maintenance-toggle');\n    await navigate(runtime.cdp, 'diagnostics');\n    await waitForBodyText(runtime.cdp, '已从真实 Index 映射 1 个音声作品、0 个音乐专辑');\n    await screenshot(runtime.cdp, '14-populated-diagnostics');`;
const populatedAfter = `    await clickSelector(runtime.cdp, '#sidebar-ai-maintenance-toggle');\n    await navigate(runtime.cdp, 'diagnostics');\n    await waitForBodyText(runtime.cdp, '日常状态');\n    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：1 个音声集合，0 个音乐集合，1 条轨道。');\n    await clickVisibleText(runtime.cdp, '刷新真实资源状态', 'button');\n    await waitForBodyText(runtime.cdp, '已加载真实 library-index.json：1 个音声集合，0 个音乐集合，1 条轨道。');\n    await screenshot(runtime.cdp, '14-populated-diagnostics');`;

for (const [label, before, after] of [
  ['empty Diagnostics refresh flow', emptyBefore, emptyAfter],
  ['populated Diagnostics refresh flow', populatedBefore, populatedAfter],
]) {
  if (source.includes(after)) {
    console.log(`${label} already applied.`);
    continue;
  }
  if (!source.includes(before)) throw new Error(`${label} anchor not found.`);
  source = source.replace(before, after);
  console.log(`${label} applied.`);
}

fs.writeFileSync(target, source, 'utf8');
