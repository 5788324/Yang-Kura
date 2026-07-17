#!/usr/bin/env node
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const cwd = process.cwd();
const reportDir = path.join(cwd, 'artifacts', 'u39f-architecture-guardrails');
const reportPath = path.join(reportDir, 'report.json');
const sourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];
const sourceRoots = ['src', 'electron'];

function git(args, options = {}) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024,
    ...options,
  }).trim();
}

function normalizeFile(file) {
  return file.replaceAll('\\', '/').replace(/^\.\//, '');
}

function isSourceFile(file) {
  const normalized = normalizeFile(file);
  return sourceRoots.some((root) => normalized.startsWith(`${root}/`)) && sourceExtensions.some((extension) => normalized.endsWith(extension));
}

function getBaseSha() {
  const explicit = process.env.BASE_SHA || process.argv.find((argument) => argument.startsWith('--base='))?.slice('--base='.length);
  if (explicit) return explicit;
  try {
    return git(['rev-parse', 'HEAD^']);
  } catch {
    return '';
  }
}

function parseAddedLines(diff) {
  const lines = [];
  let newLine = 0;
  for (const line of diff.split(/\r?\n/)) {
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
    if (hunk) {
      newLine = Number(hunk[1]);
      continue;
    }
    if (line.startsWith('+++')) continue;
    if (line.startsWith('+')) {
      lines.push({ line: newLine, text: line.slice(1) });
      newLine += 1;
      continue;
    }
    if (line.startsWith('-')) continue;
    if (newLine > 0) newLine += 1;
  }
  return lines;
}

function explicitAnyReason(text) {
  const checks = [
    [/:\s*any(?:\[\])?\b/, 'explicit type annotation'],
    [/\bas\s+any\b/, 'type assertion'],
    [/<\s*any\s*>/, 'generic argument'],
    [/\b(?:Array|Promise|ReadonlyArray)\s*<\s*any\s*>/, 'generic container'],
    [/\bRecord\s*<[^>]*,\s*any\s*>/, 'record value'],
    [/<[^>]*=\s*any(?:\s|,|>)/, 'generic default'],
  ];
  return checks.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

function nakedIpcReason(file, text) {
  if (!normalizeFile(file).startsWith('src/')) return null;
  const checks = [
    [/\bipcRenderer\b/, 'ipcRenderer in Renderer'],
    [/\bipcMain\b/, 'ipcMain in Renderer'],
    [/\bcontextBridge\b/, 'contextBridge in Renderer'],
    [/from\s*['"]electron['"]|require\(\s*['"]electron['"]\s*\)/, 'direct Electron import in Renderer'],
  ];
  return checks.find(([pattern]) => pattern.test(text))?.[1] ?? null;
}

function extractImportSpecifiers(source) {
  const specifiers = new Set();
  const patterns = [
    /\b(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
    /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) specifiers.add(match[1]);
  }
  return [...specifiers];
}

function crossLayerReason(file, specifier) {
  const normalizedFile = normalizeFile(file);
  const normalizedSpecifier = specifier.replaceAll('\\', '/');
  if (normalizedFile.startsWith('src/')) {
    if (normalizedSpecifier === 'electron' || normalizedSpecifier.startsWith('electron/')) return 'Renderer imports Electron package';
    const resolved = normalizeFile(path.posix.normalize(path.posix.join(path.posix.dirname(normalizedFile), normalizedSpecifier)));
    if (normalizedSpecifier.startsWith('.') && resolved.startsWith('electron/')) return 'Renderer reaches into electron/';
  }
  if (normalizedFile.startsWith('electron/')) {
    const resolved = normalizeFile(path.posix.normalize(path.posix.join(path.posix.dirname(normalizedFile), normalizedSpecifier)));
    if (normalizedSpecifier.startsWith('.') && /^src\/(?:app|components|features|hooks|shared\/ui)(?:\/|$)/.test(resolved)) {
      return 'Electron imports Renderer implementation layer';
    }
  }
  return null;
}

function listHeadFiles() {
  const result = [];
  const walk = (directory) => {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(absolute);
      else {
        const relative = normalizeFile(path.relative(cwd, absolute));
        if (isSourceFile(relative)) result.push(relative);
      }
    }
  };
  sourceRoots.forEach((root) => walk(path.join(cwd, root)));
  return result.sort();
}

function listBaseFiles(baseSha) {
  if (!baseSha) return [];
  const output = git(['ls-tree', '-r', '--name-only', baseSha, '--', ...sourceRoots]);
  return output ? output.split(/\r?\n/).map(normalizeFile).filter(isSourceFile).sort() : [];
}

function readHeadFile(file) {
  return fs.readFileSync(path.join(cwd, file), 'utf8');
}

function readBaseFile(baseSha, file) {
  try {
    return git(['show', `${baseSha}:${file}`]);
  } catch {
    return null;
  }
}

function resolveRelativeImport(file, specifier, fileSet) {
  if (!specifier.startsWith('.')) return null;
  const initial = normalizeFile(path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier)));
  const candidates = [];
  const extension = path.posix.extname(initial);
  if (sourceExtensions.includes(extension)) candidates.push(initial);
  else if (extension === '.js' || extension === '.jsx' || extension === '.mjs' || extension === '.cjs') {
    const stem = initial.slice(0, -extension.length);
    sourceExtensions.forEach((item) => candidates.push(`${stem}${item}`));
  } else {
    sourceExtensions.forEach((item) => candidates.push(`${initial}${item}`));
    sourceExtensions.forEach((item) => candidates.push(`${initial}/index${item}`));
  }
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

function buildGraph(files, readFile) {
  const fileSet = new Set(files);
  const graph = new Map(files.map((file) => [file, new Set()]));
  for (const file of files) {
    const source = readFile(file);
    if (source == null) continue;
    for (const specifier of extractImportSpecifiers(source)) {
      const resolved = resolveRelativeImport(file, specifier, fileSet);
      if (resolved) graph.get(file).add(resolved);
    }
  }
  return graph;
}

function findCycles(graph) {
  let index = 0;
  const stack = [];
  const onStack = new Set();
  const indices = new Map();
  const lowLinks = new Map();
  const components = [];

  const visit = (node) => {
    indices.set(node, index);
    lowLinks.set(node, index);
    index += 1;
    stack.push(node);
    onStack.add(node);

    for (const target of graph.get(node) ?? []) {
      if (!indices.has(target)) {
        visit(target);
        lowLinks.set(node, Math.min(lowLinks.get(node), lowLinks.get(target)));
      } else if (onStack.has(target)) {
        lowLinks.set(node, Math.min(lowLinks.get(node), indices.get(target)));
      }
    }

    if (lowLinks.get(node) === indices.get(node)) {
      const component = [];
      while (stack.length) {
        const current = stack.pop();
        onStack.delete(current);
        component.push(current);
        if (current === node) break;
      }
      const selfCycle = component.length === 1 && graph.get(component[0])?.has(component[0]);
      if (component.length > 1 || selfCycle) components.push(component.sort());
    }
  };

  for (const node of [...graph.keys()].sort()) if (!indices.has(node)) visit(node);
  return components.sort((left, right) => left.join('|').localeCompare(right.join('|')));
}

function runSelfTest() {
  assert.equal(explicitAnyReason('const value: any = input;'), 'explicit type annotation');
  assert.equal(explicitAnyReason('const value = input as any;'), 'type assertion');
  assert.equal(explicitAnyReason('const value: unknown = input;'), null);
  assert.equal(nakedIpcReason('src/a.ts', "import { ipcRenderer } from 'electron';"), 'ipcRenderer in Renderer');
  assert.equal(nakedIpcReason('electron/a.ts', "import { ipcMain } from 'electron';"), null);
  assert.equal(crossLayerReason('src/app/a.ts', '../../electron/main'), 'Renderer reaches into electron/');
  assert.equal(crossLayerReason('electron/a.ts', '../src/components/Foo'), 'Electron imports Renderer implementation layer');
  assert.deepEqual(extractImportSpecifiers("import x from './a'; export { y } from './b'; import('./c');").sort(), ['./a', './b', './c']);
  const graph = new Map([
    ['a.ts', new Set(['b.ts'])],
    ['b.ts', new Set(['a.ts'])],
    ['c.ts', new Set()],
  ]);
  assert.deepEqual(findCycles(graph), [['a.ts', 'b.ts']]);
  console.log('U39-F architecture guardrail self-test PASS');
}

if (process.argv.includes('--self-test')) {
  runSelfTest();
  process.exit(0);
}

const baseSha = getBaseSha();
if (!baseSha) {
  console.error('Unable to resolve BASE_SHA. Set BASE_SHA or provide --base=<sha>.');
  process.exit(2);
}

fs.mkdirSync(reportDir, { recursive: true });
const headSha = git(['rev-parse', 'HEAD']);
const changedOutput = git(['diff', '--name-only', '--diff-filter=ACMR', baseSha, 'HEAD', '--', ...sourceRoots]);
const changedFiles = changedOutput ? changedOutput.split(/\r?\n/).map(normalizeFile).filter(isSourceFile) : [];
const violations = [];

for (const file of changedFiles) {
  const diff = git(['diff', '--unified=0', baseSha, 'HEAD', '--', file]);
  for (const added of parseAddedLines(diff)) {
    const anyReason = explicitAnyReason(added.text);
    if (anyReason) violations.push({ rule: 'no-new-explicit-any', file, line: added.line, detail: anyReason, source: added.text.trim() });
    const ipcReason = nakedIpcReason(file, added.text);
    if (ipcReason) violations.push({ rule: 'no-renderer-naked-ipc', file, line: added.line, detail: ipcReason, source: added.text.trim() });
  }

  const headSource = readHeadFile(file);
  const baseSource = readBaseFile(baseSha, file) ?? '';
  const baseSpecifiers = new Set(extractImportSpecifiers(baseSource));
  for (const specifier of extractImportSpecifiers(headSource)) {
    if (baseSpecifiers.has(specifier)) continue;
    const reason = crossLayerReason(file, specifier);
    if (reason) violations.push({ rule: 'no-new-cross-layer-import', file, line: null, detail: reason, source: specifier });
  }
}

const baseFiles = listBaseFiles(baseSha);
const headFiles = listHeadFiles();
const baseGraph = buildGraph(baseFiles, (file) => readBaseFile(baseSha, file));
const headGraph = buildGraph(headFiles, readHeadFile);
const baseCycles = findCycles(baseGraph);
const headCycles = findCycles(headGraph);
const baseCycleKeys = new Set(baseCycles.map((cycle) => cycle.join('|')));
const newCycles = headCycles.filter((cycle) => !baseCycleKeys.has(cycle.join('|')));
for (const cycle of newCycles) {
  violations.push({ rule: 'no-new-relative-import-cycle', file: cycle[0], line: null, detail: cycle.join(' -> '), source: null });
}

const report = {
  status: violations.length ? 'fail' : 'pass',
  baseSha,
  headSha,
  changedSourceFiles: changedFiles,
  baselineCycleCount: baseCycles.length,
  headCycleCount: headCycles.length,
  newCycles,
  violations,
  policy: {
    incremental: true,
    explicitAny: 'added explicit any annotations/assertions/generic containers are blocked',
    rendererIpc: 'src/ cannot import Electron or use ipcRenderer/ipcMain/contextBridge directly',
    crossLayer: 'src/ cannot reach electron/; electron/ cannot import Renderer implementation layers',
    cycles: 'new relative-import strongly connected components in src/ or electron/ are blocked',
  },
};
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

if (violations.length) {
  for (const violation of violations) {
    const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
    console.error(`[${violation.rule}] ${location} — ${violation.detail}${violation.source ? ` — ${violation.source}` : ''}`);
  }
  console.error(`U39-F architecture guardrails FAIL (${violations.length} violation(s)); report: ${path.relative(cwd, reportPath)}`);
  process.exit(1);
}

console.log(`U39-F architecture guardrails PASS (${changedFiles.length} changed source file(s), ${baseCycles.length} baseline cycle(s), 0 new cycle(s))`);
console.log(`Report: ${path.relative(cwd, reportPath)}`);
