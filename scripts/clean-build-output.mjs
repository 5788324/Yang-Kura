#!/usr/bin/env node
import fs from 'node:fs/promises';

const targets = ['dist', 'dist-electron', 'release', 'server.js'];
for (const target of targets) {
  await fs.rm(target, { recursive: true, force: true });
  console.log(`[clean] removed ${target}`);
}
