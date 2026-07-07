import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`[mvp38] FAIL: ${message}`);
  process.exit(1);
};
const mustInclude = (path, text) => {
  if (!read(path).includes(text)) fail(`${path} must include: ${text}`);
};
const mustNotInclude = (path, text) => {
  if (read(path).includes(text)) fail(`${path} must not include: ${text}`);
};

const pkg = JSON.parse(read('package.json'));
if (!['0.76.0-mvp38', '0.77.0-mvp39', '0.78.0-mvp40', '0.79.0-mvp41', '0.80.0-mvp42', '0.81.0-mvp43', '0.82.0-mvp44', '0.83.0-mvp45', '0.84.0-mvp46', '0.85.0-mvp47', '0.86.0-mvp48', '0.87.0-mvp49', '0.88.0-mvp50', '0.89.0-mvp51', '0.90.0-mvp52', '0.91.0-mvp53', '0.92.0-mvp54', '0.93.0-mvp55', '0.94.0-mvp56', '0.95.0-mvp57', '0.96.0-mvp58', '0.97.0-mvp59', '0.98.0-mvp60', '0.99.0-mvp61', '0.100.0-mvp62', '0.101.0-mvp63', '0.102.0-mvp64', '0.103.0-mvp65', '0.104.0-mvp66', '0.105.0-mvp67', '0.106.0-mvp68', '0.107.0-mvp69', '0.108.0-mvp70', '0.109.0-mvp71', '0.110.0-mvp72', '0.111.0-mvp73', '0.112.0-mvp74', '0.113.0-mvp75', '0.114.0-mvp76', '0.115.0-mvp77', '0.116.0-mvp78', '0.117.0-mvp79', '0.118.0-mvp80', '0.119.0-mvp81', '0.120.0-mvp82', '0.121.0-mvp83', '0.122.0-mvp84', '0.123.0-mvp85'].includes(pkg.version)) fail(`package version is ${pkg.version}, expected 0.76.0-mvp38`);
if (!pkg.scripts['verify:all'].includes('verify:mvp38-ui-copy-cleanup')) {
  fail('verify:all must include verify:mvp38-ui-copy-cleanup');
}

const appText = read('src/App.tsx');
if (!appText.includes('本地封面 / 资源库体验') && !appText.includes('日常播放 / 媒体库体验') && !appText.includes('详情导航 / 媒体库体验')) fail('src/App.tsx must include MVP-38 or later media-library header copy');
mustInclude('src/App.tsx', 'Yang-Kura 本地音频媒体库');
mustNotInclude('src/App.tsx', 'MVP-37 / 本地封面 / JSON Index');
mustNotInclude('src/App.tsx', 'Windows Desktop Audio Library');

mustInclude('src/components/Sidebar.tsx', '本地媒体库');
mustInclude('src/components/Sidebar.tsx', '导入规划');
mustInclude('src/components/Sidebar.tsx', '诊断工具');
mustNotInclude('src/components/Sidebar.tsx', 'Next Dev Build');
mustNotInclude('src/components/Sidebar.tsx', '下载器入口');

mustInclude('src/components/Dashboard.tsx', '资源库状态');
mustInclude('src/components/Dashboard.tsx', '尚未读取资源库记录');
mustNotInclude('src/components/Dashboard.tsx', '尚未读取本地 index');

mustInclude('src/components/AsmrLibrary.tsx', '本地资源');
mustInclude('src/components/AsmrLibrary.tsx', '示例资源');
mustInclude('src/components/AsmrLibrary.tsx', '资源状态');
mustNotInclude('src/components/AsmrLibrary.tsx', '真实 index 资源');
mustNotInclude('src/components/AsmrLibrary.tsx', '诊断状态');

mustInclude('src/components/PlaylistPage.tsx', '系统示例');
mustNotInclude('src/components/PlaylistPage.tsx', '系统演示');

mustInclude('src/components/DownloaderPage.tsx', '导入与下载规划 · Coming Soon');
mustInclude('src/components/DownloaderPage.tsx', '任务管理预览（无真实下载）');
mustNotInclude('src/components/DownloaderPage.tsx', '写入本地 SQLite');
mustNotInclude('src/components/DownloaderPage.tsx', 'Aria2c 极速引擎');
mustNotInclude('src/components/DownloaderPage.tsx', 'Dm-Consistency');
mustNotInclude('src/components/DownloaderPage.tsx', '物理磁盘数据就绪');
mustNotInclude('src/components/DownloaderPage.tsx', '系统资源管理器 - 本地虚拟安全沙箱');

mustInclude('docs/CURRENT_ROADMAP_MVP38.md', 'MVP-38');
mustInclude('docs/UI_COPY_CLEANUP_MVP38.md', '主界面媒体感优先');

console.log('[mvp38] UI copy cleanup checks passed.');
