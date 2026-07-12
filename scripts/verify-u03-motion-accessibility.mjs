import fs from 'node:fs';

const indexHtml = fs.readFileSync('index.html', 'utf8');
const main = fs.readFileSync('src/main.tsx', 'utf8');
const accessibility = fs.readFileSync('src/accessibility.css', 'utf8');
const sidebar = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
const failures = [];

for (const marker of ['<html lang="zh-CN">', '<title>Yang-Kura 本地音频媒体库</title>']) {
  if (!indexHtml.includes(marker)) failures.push(`missing document language marker: ${marker}`);
}

if (!main.includes("import './accessibility.css';")) failures.push('accessibility.css is not loaded');
for (const marker of ['@media (prefers-reduced-motion: reduce)', 'animation-iteration-count: 1 !important', '.animate-sound-wave-4', ':focus-visible']) {
  if (!accessibility.includes(marker)) failures.push(`missing accessibility CSS marker: ${marker}`);
}

for (const marker of ['aria-label="主导航"', 'aria-label="页面导航"', 'aria-current={isCurrent ? \'page\' : undefined}', 'aria-label="清除搜索内容"', 'htmlFor="sidebar-search-input"']) {
  if (!sidebar.includes(marker)) failures.push(`missing sidebar accessibility marker: ${marker}`);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('U03 motion and accessibility verifier PASS');
