#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const service = fs.readFileSync('src/services/librarySessionService.ts', 'utf8');
const coordinator = fs.readFileSync('src/services/libraryReadCoordinatorService.ts', 'utf8');
const settings = fs.readFileSync('src/components/SettingsPageDaily.tsx', 'utf8');
const router = fs.readFileSync('src/app/AppRouter.tsx', 'utf8');
const topBar = fs.readFileSync('src/app/TopBar.tsx', 'utf8');

assert.match(service, /'reading' \| 'loaded' \| 'failed' \| 'timed-out' \| 'interrupted'/);
assert.match(service, /recordIndexReadStarted/);
assert.match(service, /recordIndexReadTimedOut/);
assert.match(coordinator, /DEFAULT_TIMEOUT_MS = 15_000/);
assert.match(coordinator, /Promise\.race/);
assert.match(settings, /libraryReadCoordinatorService\.read/);
assert.match(router, /data-u40d-library-read-state|LibraryReadStateNotice/);
assert.match(topBar, /data-u40d-library-status/);
assert.doesNotMatch(router, /import\('\.\.\/components\/SettingsPage'\)/);
console.log('[test-u40d-read-state] shared read-state convergence PASS');
