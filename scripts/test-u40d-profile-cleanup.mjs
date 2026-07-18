#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/services/automationProfileCleanupService.ts', 'utf8');
for (const token of [
  'yang_kura_player_queue_v1',
  'yang_kura_playback_history_v1',
  'yang_kura_user_playlists_v1',
  'yang_kura_last_read_library_index_result',
  'automationProfile',
  'FIXTURE_PATTERN',
  'normalizeCachedIndex',
]) assert.ok(source.includes(token), `cleanup service missing ${token}`);
assert.match(source, /if \(typeof localStorage === 'undefined' \|\| automationProfile\) return report/);
const preload = fs.readFileSync('electron/preload.ts', 'utf8');
assert.match(preload, /automationProfile: process\.env\.YANG_KURA_E2E_MODE === '1'/);
const bootstrap = fs.readFileSync('src/main.tsx', 'utf8');
assert.match(bootstrap, /automationProfileCleanupService\.run\(automationProfile\)/);
console.log('[test-u40d-profile-cleanup] automation profile isolation PASS');
