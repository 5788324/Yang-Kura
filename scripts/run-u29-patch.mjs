#!/usr/bin/env node
import fs from 'node:fs';

const hook = fs.readFileSync('src/hooks/useAudioPlayer.ts', 'utf8');
if (hook.includes("from '../player/playerRuntimePolicy'")) {
  console.log('U29 player reliability patch already applied.');
} else {
  await import('./apply-u29-player-reliability.mjs');
}
