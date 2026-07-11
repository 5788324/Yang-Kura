import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const fail = (message) => {
  console.error(`[MVP110 verify] FAIL ${message}`);
  process.exit(1);
};

const packageJson = JSON.parse(read('package.json'));
if (!['0.148.0-mvp110', '0.149.0-mvp111', '0.150.0-mvp112'].includes(packageJson.version)) {
  fail(`package.json version must be 0.148.0-mvp110 0.149.0-mvp111, or 0.150.0-mvp112, got ${packageJson.version}`);
}
if (!packageJson.scripts?.['verify:mvp110-global-daily-ui-cleanup']) {
  fail('missing verify:mvp110-global-daily-ui-cleanup script');
}
if (!packageJson.scripts?.['verify:all']?.includes('verify:mvp110-global-daily-ui-cleanup')) {
  fail('verify:all must include MVP110 verifier');
}

const service = read('src/services/globalDailyUiCleanupService.ts');
[
  '0.148.0-mvp110',
  '主界面继续日常化',
  'rootPathToken',
  'dry-run',
  '下载页降级为规划入口',
  '不修改 copy-only / move-only 执行器',
].forEach((token) => {
  if (!service.includes(token)) fail(`service missing token: ${token}`);
});

const index = read('src/services/index.ts');
if (!index.includes("globalDailyUiCleanupService")) {
  fail('src/services/index.ts must export globalDailyUiCleanupService');
}

const dashboard = read('src/components/Dashboard.tsx');
[
  'mvp110-dashboard-daily-surface',
  'globalDailyUiCleanupService.getModel()',
  '媒体入口优先',
].forEach((token) => {
  if (!dashboard.includes(token)) fail(`Dashboard missing token: ${token}`);
});

const settings = read('src/components/SettingsPage.tsx');
[
  'mvp110-settings-daily-language',
  '页面只显示目录名称，真实路径不会展示',
  '读取已有记录',
  '正在预览目录内容',
  '不在页面展示真实路径',
].forEach((token) => {
  if (!settings.includes(token)) fail(`SettingsPage missing token: ${token}`);
});
[
  'Renderer 只收到 rootPathToken',
  '无法运行真实目录 dry-run',
  '生成 rootPathToken',
  '正在执行只读 dry-run',
  'dry-run 调用失败',
  '读取现有 index',
  '不返回 absolutePath / file://',
].forEach((token) => {
  if (settings.includes(token)) fail(`SettingsPage still exposes old technical wording: ${token}`);
});

const downloader = read('src/components/DownloaderPage.tsx');
[
  'mvp110-downloader-daily-placeholder',
  '下载功能规划中',
  '不会联网下载',
  '本地暂存区',
  '本地音乐目录',
  '已下载音乐暂存',
  '未来下载来源预留',
].forEach((token) => {
  if (!downloader.includes(token)) fail(`DownloaderPage missing token: ${token}`);
});
[
  'YK_CDN 极速镜像',
  'ASMR.one 社区源',
  'DLsite 官方线路',
  '网易云无损加密通道',
  'QQ音乐 MASTER 缓存提取',
  'YouTube Music 转换器',
  'IPFS 共享音乐对等网络',
  '元数据已成功代理拉取',
  '数据库示范',
].forEach((token) => {
  if (downloader.includes(token)) fail(`DownloaderPage still exposes old misleading wording: ${token}`);
});

const docs = [
  'docs/CURRENT_ROADMAP_MVP110.md',
  'docs/GLOBAL_DAILY_UI_CLEANUP_MVP110.md',
  'HANDOFF_MVP109_TO_MVP110.md',
  'PACKAGE_MANIFEST_MVP110_HANDOFF.txt',
];
for (const doc of docs) {
  if (!fs.existsSync(doc)) fail(`missing ${doc}`);
}

console.log('[MVP110 verify] PASS global daily UI cleanup keeps user-facing surfaces Chinese/media-first while preserving maintenance anchors folded.');
