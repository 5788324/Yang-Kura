#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const outDir = path.join(root, 'desktop-validation-bundle');
const requiredDirs = ['dist', 'dist-electron'];
const requiredFiles = ['package.json', 'package-lock.json', 'README.md', 'RUN_ME_FIRST.md', 'docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md'];

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const missing = [];
for (const dir of requiredDirs) {
  if (!fs.existsSync(path.join(root, dir))) missing.push(dir);
}
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) missing.push(file);
}
if (missing.length) {
  console.error('[Yang-Kura] Cannot prepare desktop validation bundle. Missing:');
  for (const item of missing) console.error(`- ${item}`);
  console.error('Run: npm run build && npm run build:electron');
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const dir of requiredDirs) copyRecursive(path.join(root, dir), path.join(outDir, dir));
for (const file of requiredFiles) copyRecursive(path.join(root, file), path.join(outDir, file));

const note = `Yang-Kura MVP-28 desktop validation bundle\n\nThis is not a signed Windows installer and not a portable exe.\nIt is a validation bundle containing built frontend and Electron main/preload output.\n\nTo validate on Windows from the project root, run:\n1. npm ci\n2. npm run electron:install\n3. npm run desktop:dev\n4. npm run desktop:preview\n\nFull manual checklist is in docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md.\n`;
fs.writeFileSync(path.join(outDir, 'README_DESKTOP_VALIDATION.txt'), note, 'utf8');
console.log(`[Yang-Kura] Desktop validation bundle prepared: ${path.relative(root, outDir)}`);
