import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const requireFile = (file) => {
  if (!fs.existsSync(path.join(root, file))) {
    throw new Error(`Missing required file: ${file}`);
  }
};
const requireIncludes = (file, patterns) => {
  const text = read(file);
  for (const pattern of patterns) {
    if (!text.includes(pattern)) {
      throw new Error(`${file} is missing required marker: ${pattern}`);
    }
  }
};

const pkg = JSON.parse(read('package.json'));
if (!['0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version)) {
  throw new Error(`Expected package version 0.77.0-mvp39 or later compatible MVP-40, got ${pkg.version}`);
}

requireFile('src/services/mediaLibraryExperienceService.ts');
requireFile('docs/CURRENT_ROADMAP_MVP39.md');
requireFile('docs/MEDIA_LIBRARY_EXPERIENCE_MVP39.md');

requireIncludes('src/services/mediaLibraryExperienceService.ts', [
  'MediaLibraryExperienceOverview',
  'getDashboardOverview',
  '继续播放',
  '音声作品',
  '音乐音轨',
  '歌单',
]);

requireIncludes('src/components/Dashboard.tsx', [
  'mediaLibraryExperienceService',
  'mvp39-media-overview',
  '今日入口',
  'mediaOverview.cards.map',
]);

requireIncludes('src/components/SettingsPage.tsx', [
  'showAdvancedLibraryTools',
  'mvp39-advanced-library-tools',
  '高级资源库工具',
  '展开高级工具',
  '收起高级工具',
  '日常使用只需要选择目录',
]);

requireIncludes('src/services/index.ts', [
  "mediaLibraryExperienceService",
]);

requireIncludes('docs/MEDIA_LIBRARY_EXPERIENCE_MVP39.md', [
  'Dashboard',
  'Settings',
  '高级资源库工具',
  'no delete / move / rename',
]);

console.log('MVP-39 media-library polish verification passed.');
