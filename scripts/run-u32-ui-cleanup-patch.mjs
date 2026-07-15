#!/usr/bin/env node
import fs from 'node:fs';

const patchPath = 'scripts/apply-u32-ui-cleanup.mjs';
let source = fs.readFileSync(patchPath, 'utf8');
source = source.replace(
  "function read(path) { return fs.readFileSync(path, 'utf8'); }",
  "function read(path) { return fs.readFileSync(path, 'utf8').replace(/\\r\\n/g, '\\n'); }",
);
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

const cssPath = 'src/index.css';
let css = fs.readFileSync(cssPath, 'utf8').replace(/\r\n/g, '\n');
css = css.replace('.u32-release-ui #mvp45-home-quick-entry,\n', '');
const compactStatusMarker = '/* U32 compact library state */';
if (!css.includes(compactStatusMarker)) {
  css += `\n\n${compactStatusMarker}\n.u32-release-ui #mvp45-home-quick-entry {\n  display: block;\n}\n\n.u32-release-ui #mvp42-daily-listening-surface {\n  display: none !important;\n}\n\n.u32-release-ui #mvp45-home-quick-entry > div:last-child {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto;\n  align-items: center;\n  gap: 0.75rem;\n  padding: 0.75rem 1rem;\n}\n\n.u32-release-ui #mvp45-home-quick-entry > div:last-child button {\n  width: auto;\n  min-width: 7rem;\n  height: 2.25rem;\n}\n\n@media (max-width: 720px) {\n  .u32-release-ui #mvp45-home-quick-entry > div:last-child {\n    grid-template-columns: 1fr;\n  }\n  .u32-release-ui #mvp45-home-quick-entry > div:last-child button {\n    width: 100%;\n  }\n}\n`;
}
fs.writeFileSync(cssPath, css, 'utf8');

const auditPath = 'scripts/test-u32-ui-audit.mjs';
let audit = fs.readFileSync(auditPath, 'utf8').replace(/\r\n/g, '\n');
audit = audit.replace(
  `assert.equal(await cdp.evaluate("document.querySelector('#sidebar-ai-maintenance-toggle') === null"), true, 'engineering maintenance toggle is absent');`,
  `assert.equal(await cdp.evaluate("document.querySelector('#sidebar-ai-maintenance-toggle')?.offsetParent === null"), true, 'engineering maintenance toggle is hidden');`,
);
audit = audit.replace(
  `assert.equal(await cdp.evaluate("document.querySelector('#nav-diagnostics') === null && document.querySelector('#nav-downloader') === null"), true, 'engineering routes are absent from daily navigation');`,
  `assert.equal(await cdp.evaluate("document.querySelector('#nav-diagnostics')?.offsetParent === null && document.querySelector('#nav-downloader')?.offsetParent === null"), true, 'engineering routes are hidden from daily navigation');`,
);
fs.writeFileSync(auditPath, audit, 'utf8');

console.log('U32 compatibility and compact library-state adjustments applied');
