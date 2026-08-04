import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const required = (text, token, label) => { if (!text.includes(token)) throw new Error(`Missing ${label}: ${token}`); };
const forbidden = (text, token, label) => { if (text.includes(token)) throw new Error(`Forbidden ${label}: ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (!['0.153.0-mvp115', '0.154.0-mvp116', '0.155.0-mvp117', '0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`Unexpected version: ${pkg.version}`);
required(read('scripts/run-stable-regression.mjs'), 'verify:mvp115-music-metadata-management', 'verify:stable chain');

const service = read('src/services/metadataOverrideService.ts');
required(service, 'buildMusicAlbumPatch', 'album diff builder');
required(service, 'buildTrackPatch', 'track diff builder');
required(service, 'applyMusicAlbumOverrides', 'music merge layer');
required(service, 'clearMusicAlbumOverride', 'album reset');
required(service, 'clearTrackOverride', 'track reset');
required(service, 'importSnapshot', 'backup restore');
required(service, 'exportSnapshot', 'backup export');
required(service, "mode: 'replace' | 'merge'", 'restore modes');
forbidden(service, 'fs.writeFile', 'filesystem metadata write');
forbidden(service, 'fetch(', 'network provider');
forbidden(service, 'absolutePath', 'absolute path field');
forbidden(service, 'file://', 'file URL');

const panel = read('src/components/MusicMetadataManagementPanel.tsx');
required(panel, '整理音乐信息', 'daily metadata panel');
required(panel, '保存专辑', 'album save action');
required(panel, '保存曲目', 'track save action');
required(panel, '还原专辑', 'album reset action');
required(panel, '还原曲目', 'track reset action');
required(panel, '导出修改', 'backup export action');
required(panel, '导入恢复', 'backup restore action');
required(panel, '不会改写音频文件标签', 'file safety copy');

const app = read('src/App.tsx');
required(app, 'metadataOverrideService.applyMusicAlbumOverrides(mapped.musicAlbums)', 'index reload music merge');
required(app, 'metadataOverrideService.buildMusicAlbumPatch', 'album update persistence');
required(app, 'metadataOverrideService.buildTrackPatch', 'track update persistence');
required(app, 'onMetadataStoreChanged={refreshAllMetadataFromBase}', 'restore refresh');

console.log('PASS MVP115 music metadata management verifier');
