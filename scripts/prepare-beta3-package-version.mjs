#!/usr/bin/env node
import fs from 'node:fs';

const plan = JSON.parse(fs.readFileSync('release/beta3-release-plan.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));

pkg.version = plan.version;
pkg.u33BetaRelease = `${plan.version} / ${plan.tag} / ${plan.title}`;
lock.version = plan.version;
if (lock.packages?.['']) lock.packages[''].version = plan.version;

fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
fs.writeFileSync('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`, 'utf8');
console.log(`Prepared package metadata for ${plan.version}`);
