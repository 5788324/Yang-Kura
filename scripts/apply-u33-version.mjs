#!/usr/bin/env node
import fs from 'node:fs';

const plan = JSON.parse(fs.readFileSync('release/u33-release-plan.json', 'utf8'));

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = plan.version;
pkg.description = 'Yang-Kura Windows local audio media library Beta: ASMR/RJ and music library, Local JSON Index, HTMLAudio/mpv fallback, subtitles, transactional importer, portable and NSIS.';
pkg.u33BetaRelease = `${plan.version} / ${plan.tag} / ${plan.title}`;
fs.writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');

const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
lock.version = plan.version;
lock.packages[''].version = plan.version;
fs.writeFileSync('package-lock.json', `${JSON.stringify(lock, null, 2)}\n`, 'utf8');

let readme = fs.readFileSync('README.md', 'utf8');
readme = readme.replace(/> 核心版本：`[^`]+`/, `> 核心版本：\`${plan.version}\``);
readme = readme.replace(/> 当前阶段：[^\n]+/, `> 当前阶段：U33 Beta 发布候选；目标 tag \`${plan.tag}\``);
readme = readme.replace(
  /当前 U09 从全屏播放器中抽离键盘\/焦点生命周期与黑胶 reduced-motion 动画 Hook，保持播放器行为不变。/,
  'U02～U32 已完成产品化、播放器可靠性、三主题与窗口矩阵、导入事务、发布候选 UI、portable 和 NSIS 安装链验收；当前进入 U33 Beta 发布。',
);
fs.writeFileSync('README.md', readme, 'utf8');

console.log(`U33 version synchronized: ${plan.version}`);
