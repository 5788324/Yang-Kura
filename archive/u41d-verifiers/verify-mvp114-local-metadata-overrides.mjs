import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const required = (text, token, label) => { if (!text.includes(token)) throw new Error(`Missing ${label}: ${token}`); };
const forbidden = (text, token, label) => { if (text.includes(token)) throw new Error(`Forbidden ${label}: ${token}`); };

const pkg = JSON.parse(read('package.json'));
if (!['0.152.0-mvp114', '0.153.0-mvp115', '0.154.0-mvp116', '0.155.0-mvp117', '0.156.0-mvp118', '0.157.0-mvp119', '0.158.0-mvp120', '0.159.0-mvp121', '0.160.0-mvp122', '0.161.0-mvp123', '0.162.0-mvp124', '0.163.0-mvp125', '0.164.0-mvp126', '0.165.0-mvp127', '0.166.0-mvp128', '0.167.0-mvp129'].includes(pkg.version)) throw new Error(`Unexpected version: ${pkg.version}`);
required(read('scripts/run-stable-regression.mjs'), 'verify:mvp114-local-metadata-overrides', 'verify:stable chain');

const service = read('src/services/metadataOverrideService.ts');
required(service, "yang_kura_metadata_overrides_v1", 'versioned storage key');
required(service, 'MetadataOverrideStoreV1', 'override store model');
required(service, 'AsmrMetadataOverride', 'ASMR override model');
required(service, 'MusicAlbumMetadataOverride', 'music album override model');
required(service, 'TrackMetadataOverride', 'track override model');
required(service, 'buildAsmrPatch', 'minimal diff builder');
required(service, 'applyAsmrOverrides', 'ASMR merge layer');
required(service, 'exportSnapshot', 'portable JSON export contract');
forbidden(service, 'absolutePath', 'absolute path field');
forbidden(service, 'file://', 'file URL');
forbidden(service, 'fetch(', 'network provider call');
forbidden(service, 'fs.writeFile', 'filesystem write');
forbidden(service, 'sqlite', 'SQLite integration');

const app = read('src/App.tsx');
required(app, "import { metadataOverrideService }", 'App metadata service import');
required(app, 'metadataOverrideService.applyAsmrOverrides(mapped.rjWorks)', 'index reload merge');
required(app, 'metadataOverrideService.buildAsmrPatch(base, updated)', 'minimal update persistence');
required(app, 'metadataOverrideService.upsertAsmrOverride(updated.id, patch)', 'override write');

const detail = read('src/components/AsmrDetail.tsx');
required(detail, '本地修改 {metadataOverrideService.getAsmrOverrideFieldCount', 'override status chip');
required(detail, '独立的本地元数据覆盖层', 'user-facing persistence explanation');
required(detail, '重新扫描后仍会保留', 'save feedback');

console.log('PASS MVP114 local metadata overrides verifier');
