#!/usr/bin/env node
import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const requiredFiles = [
  'src/app/TopBar.tsx',
  'src/app/AppRouter.tsx',
  'src/app/QueueDrawer.tsx',
  'src/app/PlayerOverlayHost.tsx',
  'docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing U36-B file: ${file}`);
}

if (failures.length === 0) {
  const app = read('src/App.tsx');
  const router = read('src/app/AppRouter.tsx');
  const topBar = read('src/app/TopBar.tsx');
  const queue = read('src/app/QueueDrawer.tsx');
  const overlays = read('src/app/PlayerOverlayHost.tsx');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');

  for (const marker of [
    "import AppRouter from './app/AppRouter';",
    "import PlayerOverlayHost, { type ResumePlaybackPrompt } from './app/PlayerOverlayHost';",
    "import QueueDrawer from './app/QueueDrawer';",
    "import TopBar from './app/TopBar';",
    '<TopBar librarySessionSnapshot={librarySessionSnapshot} />',
    '<AppRouter',
    '<QueueDrawer',
    '<PlayerOverlayHost',
  ]) if (!app.includes(marker)) failures.push(`App shell composition missing: ${marker}`);

  for (const forbidden of [
    "lazy(() => import('./components/Dashboard'))",
    "lazy(() => import('./components/SettingsPage'))",
    '<header id="windows-app-bar"',
    'id="u29-queue-drawer"',
    '<LyricsPanel',
    'id="legacy-resume-toast"',
  ]) if (app.includes(forbidden)) failures.push(`App still owns extracted UI: ${forbidden}`);

  const appLines = app.split(/\r?\n/).length;
  if (appLines > 620) failures.push(`App.tsx remains too large after U36-B: ${appLines} lines`);

  for (const marker of [
    "const Dashboard = lazy(() => import('../components/Dashboard'));",
    "const DiagnosticsPageShell = lazy(() => import('../components/DiagnosticsPageShell'));",
    "props.currentPage === 'dashboard'",
    "props.currentPage === 'downloader'",
    "props.currentPage === 'diagnostics'",
  ]) if (!router.includes(marker)) failures.push(`AppRouter missing route contract: ${marker}`);

  for (const marker of ['id="windows-app-bar"', 'data-u30-runtime-status', '尚未选择资源库', '资源库待重新连接']) {
    if (!topBar.includes(marker)) failures.push(`TopBar missing runtime contract: ${marker}`);
  }

  for (const marker of [
    'id="u29-queue-drawer"',
    'id="queue-close-button"',
    "window.addEventListener('keydown', handleEscape)",
    'dailyListeningSurfaceService.getQueueSummary',
  ]) if (!queue.includes(marker)) failures.push(`QueueDrawer missing contract: ${marker}`);

  for (const marker of [
    "const LyricsPanel = lazy(() => import('../components/LyricsPanel'));",
    'id="legacy-resume-toast"',
    'onResumePlayback(resumePrompt)',
  ]) if (!overlays.includes(marker)) failures.push(`PlayerOverlayHost missing contract: ${marker}`);

  for (const [file, source, markers] of [
    ['PROJECT_STATE.md', state, ['U36-B：App Shell、Router 与 Overlay 拆分完成', 'U36-C：Main IPC 分域注册完成']],
    ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, ['U36-B：完成', 'U36-C：完成']],
    ['AI_HANDOFF/WORKLOG.md', worklog, ['U36-B', 'U36-C：完成']],
  ]) {
    for (const marker of markers) {
      if (!source.includes(marker)) failures.push(`${file} missing progress marker: ${marker}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U36-B App Shell, Router and Overlay boundaries PASS');
