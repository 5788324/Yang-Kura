#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const codeRoots = ['src', 'electron'];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
const outputDir = path.resolve(root, 'artifacts/u41-product-audit');
const outputPath = path.join(outputDir, 'product-surface.json');

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  const result = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(absolute));
    else result.push(absolute);
  }
  return result;
}

function normalize(relative) {
  return relative.split(path.sep).join('/');
}

const codeFiles = codeRoots
  .flatMap((directory) => walk(path.resolve(root, directory)))
  .filter((file) => extensions.includes(path.extname(file)))
  .map((file) => path.resolve(file));
const fileSet = new Set(codeFiles);
const importPattern = /(?:import\s+(?:[^'\"]*?\s+from\s+)?|export\s+[^'\"]*?\s+from\s+|import\s*\()\s*['\"]([^'\"]+)['\"]/g;

function resolveRelativeImport(source, specifier) {
  if (!specifier.startsWith('.')) return null;
  const base = path.resolve(path.dirname(source), specifier);
  const candidates = [];
  const extension = path.extname(base);
  if (extension) {
    candidates.push(base);
    if (['.js', '.mjs', '.cjs'].includes(extension)) {
      const stem = base.slice(0, -extension.length);
      for (const candidateExtension of extensions) candidates.push(`${stem}${candidateExtension}`);
    }
  } else {
    for (const candidateExtension of extensions) candidates.push(`${base}${candidateExtension}`);
    for (const candidateExtension of extensions) candidates.push(path.join(base, `index${candidateExtension}`));
  }
  return candidates.find((candidate) => fileSet.has(path.resolve(candidate))) ?? null;
}

const graph = new Map(codeFiles.map((file) => [file, []]));
for (const file of codeFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(importPattern)) {
    const resolved = resolveRelativeImport(file, match[1]);
    if (resolved) graph.get(file).push(path.resolve(resolved));
  }
}

const entries = [
  path.resolve(root, 'src/main.tsx'),
  path.resolve(root, 'electron/main.ts'),
  path.resolve(root, 'electron/preload.ts'),
].filter((entry) => fileSet.has(entry));
const reachable = new Set();
const stack = [...entries];
while (stack.length > 0) {
  const current = stack.pop();
  if (!current || reachable.has(current)) continue;
  reachable.add(current);
  stack.push(...(graph.get(current) ?? []));
}

const controlPattern = /<(button|Button|input|select|textarea)\b/g;
let staticControlCount = 0;
const controlFiles = [];
for (const file of [...reachable].filter((item) => item.includes(`${path.sep}src${path.sep}`) && item.endsWith('.tsx'))) {
  const source = fs.readFileSync(file, 'utf8');
  const count = [...source.matchAll(controlPattern)].length;
  if (count > 0) {
    staticControlCount += count;
    controlFiles.push({ file: normalize(path.relative(root, file)), count });
  }
}
controlFiles.sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));

const navigationSource = fs.readFileSync(path.resolve(root, 'src/app/navigation.ts'), 'utf8');
const routeIds = [...navigationSource.matchAll(/^\s{2}(['\"]?)([a-z-]+)\1:\s*\{/gm)].map((match) => match[2]);
const dailyRouteCount = (navigationSource.match(/daily:\s*true/g) ?? []).length;
const maintenanceRouteCount = (navigationSource.match(/section:\s*'maintenance'/g) ?? []).length;

const appSource = fs.readFileSync(path.resolve(root, 'src/App.tsx'), 'utf8');
const settingsSource = fs.readFileSync(path.resolve(root, 'src/components/SettingsPageDaily.tsx'), 'utf8');
const importerSource = fs.readFileSync(path.resolve(root, 'src/components/ImporterPage.tsx'), 'utf8');
const downloaderSource = fs.readFileSync(path.resolve(root, 'src/components/DownloaderPage.tsx'), 'utf8');
const fakeMpv = fs.readFileSync(path.resolve(root, 'tests/fixtures/mpv/fake-mpv.mjs'));
const fakeMpvStability = fs.readFileSync(path.resolve(root, 'tests/fixtures/mpv/fake-mpv-stability.mjs'));

const riskMarkers = [
  {
    id: 'U41-BLOCKER-001',
    present: importerSource.includes('mvp86-importer-disabled-execute-button') && !/<button[\s\S]{0,250}onClick=/.test(importerSource.slice(0, importerSource.indexOf('mvp107-importer-ai-maintenance-fold'))),
    summary: 'Daily importer presents a four-step description but no executable source-selection/import action.',
  },
  {
    id: 'U41-MAJ-001',
    present: appSource.includes('演示数据未联网') && appSource.includes('randomCover'),
    summary: 'RJ card refresh injects generated/demo metadata into production state.',
  },
  {
    id: 'U41-MAJ-002',
    present: settingsSource.includes('当前版本：0.169.0-beta.2'),
    summary: 'About page contains a hard-coded Beta 2 version after Beta 3 publication.',
  },
  {
    id: 'U41-MAJ-004',
    present: importerSource.includes('importerFinalRegressionChecklistService') && importerSource.includes('hidden aria-hidden="true"'),
    summary: 'Importer eagerly imports and builds historical MVP model data that is hidden from daily UI.',
  },
  {
    id: 'U41-MAJ-005',
    present: navigationSource.includes("downloader:") && navigationSource.includes("visibleInSidebar: false") && downloaderSource.includes('showLegacyDownloaderDemo = false'),
    summary: 'Frozen downloader remains a production route and lazy bundle despite no supported daily entry.',
  },
  {
    id: 'U41-MIN-001',
    present: fakeMpv.includes(Buffer.from('\r\n')) || fakeMpvStability.includes(Buffer.from('\r\n')),
    summary: 'Executable Node fixtures use CRLF shebangs and break Linux stable regression without conversion.',
  },
];

const unreachableFiles = codeFiles
  .filter((file) => !reachable.has(file))
  .map((file) => normalize(path.relative(root, file)))
  .sort();
const unreachableImplementations = unreachableFiles.filter((file) => !file.endsWith('.d.ts'));

const workflowFiles = walk(path.resolve(root, '.github/workflows')).filter((file) => file.endsWith('.yml'));
const documentationFiles = walk(path.resolve(root, 'docs'));
const archiveFiles = walk(path.resolve(root, 'archive'));
const verifierFiles = walk(path.resolve(root, 'scripts')).filter((file) => path.basename(file).startsWith('verify-') && file.endsWith('.mjs'));
const testScriptFiles = walk(path.resolve(root, 'scripts')).filter((file) => path.basename(file).startsWith('test-') && file.endsWith('.mjs'));

const report = {
  generatedAt: new Date().toISOString(),
  baseline: {
    repository: '5788324/Yang-Kura',
    mainCommit: '8a92978bbd07aa9f490ec15c9037366793168e2c',
    publicVersion: '0.170.0-beta.3',
  },
  productionSurface: {
    routeCount: routeIds.length,
    routeIds,
    dailyRouteCount,
    maintenanceRouteCount,
    staticControlCount,
    filesWithControls: controlFiles.length,
    controlFiles,
  },
  codeGraph: {
    codeFileCount: codeFiles.length,
    reachableFileCount: reachable.size,
    unreachableFileCount: unreachableFiles.length,
    unreachableImplementationCount: unreachableImplementations.length,
    unreachableFiles,
  },
  repositoryScale: {
    workflowCount: workflowFiles.length,
    documentationFileCount: documentationFiles.length,
    archiveFileCount: archiveFiles.length,
    verifierScriptCount: verifierFiles.length,
    testScriptCount: testScriptFiles.length,
  },
  riskMarkers,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(`U41 product surface audit written to ${normalize(path.relative(root, outputPath))}`);
console.log(`routes=${report.productionSurface.routeCount} controls=${staticControlCount} reachable=${reachable.size}/${codeFiles.length} risks=${riskMarkers.filter((item) => item.present).length}`);
