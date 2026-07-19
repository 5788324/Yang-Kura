#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const failures = [];
const read = (file) => {
  if (!fs.existsSync(file)) {
    failures.push(`missing ${file}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
};

const checks = [
  ['src/app/AppRouter.tsx', ["import('../components/SettingsPageDaily')", 'LibraryReadStateNotice', "readAttempt?.status === 'reading'"]],
  ['src/components/SettingsPageDaily.tsx', ['data-settings-tab={tab.id}', 'libraryReadCoordinatorService.read', '读取已有记录', '一键扫描并应用', 'data-u40d-read-status']],
  ['src/services/libraryReadCoordinatorService.ts', ['DEFAULT_TIMEOUT_MS = 120_000', 'Promise.race', 'recordIndexReadTimedOut', 'libraryIndexNormalizationService.normalize']],
  ['src/services/librarySessionService.ts', ["'reading' | 'loaded' | 'failed' | 'timed-out' | 'interrupted'", 'recordIndexReadStarted', 'recordIndexReadTimedOut']],
  ['src/services/automationProfileCleanupService.ts', ['FIXTURE_PATTERN', 'removedQueueTracks', 'normalizeCachedIndex']],
  ['src/services/libraryIndexNormalizationService.ts', ['RJ_PATTERN', 'MAX_REASONABLE_WORK_TRACKS', 'splitCollection', 'sourceTracks.length === 0']],
  ['src/player/playerRuntimePolicy.ts', ['options: { dropMissing?: boolean }', '旧播放队列不属于当前资源库']],
  ['src/services/playbackHistoryService.ts', ['pruneToLibrary', '.filter((entry) => byId.has(entry.trackId))']],
  ['electron/preload.ts', ["automationProfile: process.env.YANG_KURA_E2E_MODE === '1'"]],
  ['src/components/DiagnosticsPageShell.tsx', ['data-u40d-maintenance-runtime="current-only"', '历史开发记录已经归档']],
  ['docs/CODEX_REAL_MACHINE_FULL_ACCEPTANCE.md', ['E:\\arsm', 'D:\\CloudMusic\\VipSongsDownload', '全部可见页面', '读取中强制关闭后重启']],
];

for (const [file, tokens] of checks) {
  const source = read(file);
  for (const token of tokens) if (!source.includes(token)) failures.push(`${file} missing token: ${token}`);
}

const appRouter = read('src/app/AppRouter.tsx');
if (appRouter.includes("import('../components/SettingsPage')")) failures.push('legacy SettingsPage is still on the production route');
const diagnosticsShell = read('src/components/DiagnosticsPageShell.tsx');
if (diagnosticsShell.includes("import('./DiagnosticsPage')")) failures.push('historical DiagnosticsPage is still loaded by the maintenance shell');

const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];
const roots = ['src', 'electron'];
const files = [];
const walk = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (sourceExtensions.includes(path.extname(entry.name))) files.push(path.relative(process.cwd(), absolute).replaceAll('\\', '/'));
  }
};
roots.forEach((root) => walk(root));
const fileSet = new Set(files);
const graph = new Map(files.map((file) => [file, new Set()]));
const importPatterns = [
  /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
  /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const resolveImport = (file, specifier) => {
  if (!specifier.startsWith('.')) return null;
  const initial = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
  const candidates = [];
  const extension = path.posix.extname(initial);
  if (sourceExtensions.includes(extension)) candidates.push(initial);
  else {
    sourceExtensions.forEach((item) => candidates.push(`${initial}${item}`));
    sourceExtensions.forEach((item) => candidates.push(`${initial}/index${item}`));
  }
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
};
for (const file of files) {
  const source = read(file);
  for (const pattern of importPatterns) {
    for (const match of source.matchAll(pattern)) {
      const target = resolveImport(file, match[1]);
      if (target) graph.get(file).add(target);
    }
  }
}

let graphIndex = 0;
const stack = [];
const onStack = new Set();
const indices = new Map();
const low = new Map();
const cycles = [];
const visit = (node) => {
  indices.set(node, graphIndex);
  low.set(node, graphIndex);
  graphIndex += 1;
  stack.push(node);
  onStack.add(node);
  for (const target of graph.get(node) ?? []) {
    if (!indices.has(target)) {
      visit(target);
      low.set(node, Math.min(low.get(node), low.get(target)));
    } else if (onStack.has(target)) {
      low.set(node, Math.min(low.get(node), indices.get(target)));
    }
  }
  if (low.get(node) === indices.get(node)) {
    const component = [];
    while (stack.length) {
      const current = stack.pop();
      onStack.delete(current);
      component.push(current);
      if (current === node) break;
    }
    if (component.length > 1 || (component.length === 1 && graph.get(component[0])?.has(component[0]))) cycles.push(component.sort());
  }
};
files.sort().forEach((file) => { if (!indices.has(file)) visit(file); });
fs.mkdirSync('artifacts/u40d-real-library-stability', { recursive: true });
fs.writeFileSync('artifacts/u40d-real-library-stability/cycles.json', JSON.stringify({ cycleCount: cycles.length, cycles }, null, 2));
if (cycles.length) failures.push(`relative import cycles remain: ${cycles.map((cycle) => cycle.join(' -> ')).join('; ')}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('[verify-u40d] real-library stability and Issue #66 closeout PASS');
