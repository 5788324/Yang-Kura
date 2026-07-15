#!/usr/bin/env node
import fs from 'node:fs';

const patchPath = 'scripts/apply-u32-ui-cleanup.mjs';
let source = fs.readFileSync(patchPath, 'utf8');
source = source.replace(
  "'className={`h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}'",
  "'<div data-u30-theme={settings.currentTheme} className={`h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}>'",
);
source = source.replace(
  "'className={`u32-release-ui h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}'",
  "'<div data-u30-theme={settings.currentTheme} className={`u32-release-ui h-screen w-screen min-w-0 flex flex-col theme-${settings.currentTheme} transition-all duration-300 overflow-hidden`}>'",
);
fs.writeFileSync(patchPath, source, 'utf8');
await import('./apply-u32-ui-cleanup.mjs');
