#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sourceFiles = [
  'src/styles/design-tokens.css',
  'src/styles/theme-contrast-bridge.css',
];

function themeDeclarations(file) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/\.theme-mist-ivory\s*\{([\s\S]*?)\}/);
  assert.ok(match, `${file} 缺少 .theme-mist-ivory`);
  return Object.fromEntries(
    [...match[1].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)]
      .map((item) => [item[1], item[2].trim()]),
  );
}

const tokens = Object.assign({}, ...sourceFiles.map(themeDeclarations));

function parseHex(value, token) {
  assert.match(value ?? '', /^#[0-9a-f]{6}$/i, `${token} 必须使用可审计的 6 位十六进制颜色`);
  return [1, 3, 5].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
}

function relativeLuminance(value, token) {
  const channels = parseHex(value, token).map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foregroundToken, backgroundToken) {
  const foreground = relativeLuminance(tokens[foregroundToken], foregroundToken);
  const background = relativeLuminance(tokens[backgroundToken], backgroundToken);
  const [lighter, darker] = foreground >= background
    ? [foreground, background]
    : [background, foreground];
  return (lighter + 0.05) / (darker + 0.05);
}

function assertContrast(foregroundToken, backgroundToken, minimum) {
  const ratio = contrastRatio(foregroundToken, backgroundToken);
  assert.ok(
    ratio >= minimum,
    `${foregroundToken} / ${backgroundToken} 对比度 ${ratio.toFixed(2)} 低于 ${minimum}:1`,
  );
  return ratio;
}

const surfaces = ['--yk-canvas', '--yk-surface-1', '--yk-surface-2', '--yk-surface-3'];
const textTokens = ['--yk-text-1', '--yk-text-2', '--yk-text-3'];
const semanticTextTokens = ['--yk-accent', '--yk-success', '--yk-warning', '--yk-danger', '--yk-info'];
const report = [];

for (const foreground of [...textTokens, ...semanticTextTokens]) {
  for (const background of surfaces) {
    report.push({ foreground, background, ratio: assertContrast(foreground, background, 4.5) });
  }
}

for (const border of ['--yk-border-subtle', '--yk-border-strong']) {
  for (const background of surfaces) {
    report.push({ foreground: border, background, ratio: assertContrast(border, background, 3) });
  }
}

const whiteLuminance = 1;
for (const token of ['--yk-accent', '--yk-accent-hover']) {
  const background = relativeLuminance(tokens[token], token);
  const ratio = (whiteLuminance + 0.05) / (background + 0.05);
  assert.ok(ratio >= 4.5, `白字 / ${token} 对比度 ${ratio.toFixed(2)} 低于 4.5:1`);
  report.push({ foreground: '#ffffff', background: token, ratio });
}

const bridge = fs.readFileSync('src/styles/theme-contrast-bridge.css', 'utf8');
for (const legacyToken of ['--text-muted', '--brand-color', '--brand-color-hover', '--border-color', '--border-color-hover']) {
  assert.ok(legacyToken in tokens, `浅色主题未同步旧变量 ${legacyToken}`);
}
assert.ok(bridge.includes('.theme-mist-ivory select option'), '原生下拉选项未覆盖浅色主题');
assert.ok(bridge.includes(':focus-visible'), '浅色主题缺少可见焦点覆盖');

console.log('[verify-u39d-light-theme-contrast] PASS');
for (const item of report) {
  console.log(`${item.foreground}\t${item.background}\t${item.ratio.toFixed(2)}:1`);
}
