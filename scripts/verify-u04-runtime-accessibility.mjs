import fs from 'node:fs';

const main = fs.readFileSync('src/main.tsx', 'utf8');
const runtime = fs.readFileSync('src/runtimeAccessibility.ts', 'utf8');
const failures = [];

for (const marker of [
  "import {installRuntimeAccessibility} from './runtimeAccessibility';",
  'installRuntimeAccessibility();',
]) {
  if (!main.includes(marker)) failures.push(`main.tsx missing runtime accessibility marker: ${marker}`);
}

for (const marker of [
  "panel.setAttribute('role', 'dialog')",
  "panel.setAttribute('aria-modal', 'true')",
  "event.key === 'Escape'",
  "event.key !== 'Tab'",
  'previousFocus.focus({ preventScroll: true })',
  "button.setAttribute('aria-label', title)",
  "button.setAttribute('aria-label', '关闭对话框')",
  'label.htmlFor = control.id',
  "className.startsWith('backdrop-blur')",
  "overlay.classList.contains('items-center')",
  'FORM_CONTROL_SELECTOR',
  'new MutationObserver',
]) {
  if (!runtime.includes(marker)) failures.push(`runtimeAccessibility.ts missing marker: ${marker}`);
}

for (const forbidden of ['localStorage', 'window.yangKura', 'requestOpenExternalFile', 'requestWriteLibraryIndex']) {
  if (runtime.includes(forbidden)) failures.push(`runtime accessibility bridge crossed product-data boundary: ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U04 runtime accessibility verifier PASS');
