import fs from 'node:fs';
import path from 'node:path';

const read = (file) => fs.readFileSync(file, 'utf8');
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.endsWith('\n') ? content : `${content}\n`, 'utf8');
};
const replaceRequired = (source, before, after, label) => {
  if (!source.includes(before)) throw new Error(`Missing replacement anchor: ${label}`);
  return source.replace(before, after);
};

const domainFunction = {
  library: 'registerLibraryHandler',
  media: 'registerMediaHandler',
  player: 'registerPlayerHandler',
  metadata: 'registerMetadataHandler',
  importer: 'registerImporterHandler',
};

const channelMap = {
  'yang-kura:dialog:select-library-root': ['library', 'selectRoot'],
  'yang-kura:scanner:dry-run:request': ['library', 'scanDryRun'],
  'yang-kura:index:write-preview-request': ['library', 'indexWritePreview'],
  'yang-kura:index:write-confirmed-request': ['library', 'indexWriteConfirmed'],
  'yang-kura:index:read-current-request': ['library', 'indexReadCurrent'],
  'yang-kura:index:health-check-request': ['library', 'indexHealthCheck'],
  'yang-kura:index:removal-preview-request': ['library', 'indexRemovalPreview'],
  'yang-kura:index:removal-write-confirmed-request': ['library', 'indexRemovalWrite'],
  'yang-kura:index:backup-list-request': ['library', 'indexBackupList'],
  'yang-kura:index:backup-restore-request': ['library', 'indexBackupRestore'],
  'yang-kura:index:backup-retention-preview-request': ['library', 'indexBackupRetentionPreview'],
  'yang-kura:index:maintenance-history-request': ['library', 'indexMaintenanceHistory'],
  'yang-kura:index:reveal-nearest-parent-request': ['library', 'revealNearestParent'],
  'yang-kura:media:resolve-track-url': ['media', 'resolveTrackUrl'],
  'yang-kura:lyrics:read-track-lyrics': ['media', 'readTrackLyrics'],
  'yang-kura:external:open-file': ['media', 'openExternalFile'],
  'yang-kura:external:open-in-file-manager': ['media', 'openInFileManager'],
  'yang-kura:player:mpv:start': ['player', 'mpvStart'],
  'yang-kura:player:mpv:command': ['player', 'mpvCommand'],
  'yang-kura:player:mpv:status': ['player', 'mpvStatus'],
  'yang-kura:player:mpv:installation-status': ['player', 'mpvInstallationStatus'],
  'yang-kura:player:mpv:select-executable': ['player', 'mpvSelectExecutable'],
  'yang-kura:player:mpv:clear-executable': ['player', 'mpvClearExecutable'],
  'yang-kura:metadata:asmr:single-rj-preview': ['metadata', 'asmrSingleRjPreview'],
  'yang-kura:metadata:asmr:single-rj-cache-clear': ['metadata', 'asmrSingleRjCacheClear'],
  'yang-kura:import:copy-only:preflight': ['importer', 'copyPreflight'],
  'yang-kura:import:copy-only:confirm': ['importer', 'copyConfirm'],
  'yang-kura:import:copy-only:execute': ['importer', 'copyExecute'],
  'yang-kura:import:copy-only:cancel': ['importer', 'copyCancel'],
  'yang-kura:import:post-copy:refresh-preview': ['importer', 'postCopyRefreshPreview'],
  'yang-kura:import:library-index-patch:preview': ['importer', 'indexPatchPreview'],
  'yang-kura:import:library-index-patch:write-readiness': ['importer', 'indexPatchWriteReadiness'],
  'yang-kura:import:library-index-patch:write-confirmed': ['importer', 'indexPatchWriteConfirmed'],
  'yang-kura:import:library-index-patch:refresh-after-write': ['importer', 'indexPatchRefreshAfterWrite'],
  'yang-kura:import:move-only:execute': ['importer', 'moveExecute'],
};

let main = read('electron/main.ts');
main = replaceRequired(
  main,
  "import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron';",
  "import { app, BrowserWindow, dialog, net, protocol, shell } from 'electron';",
  'remove ipcMain from Electron import',
);
main = replaceRequired(
  main,
  "import { IMPORT_TRANSACTION_VERSION, executeCopyOnlyTransaction, executeMoveOnlyTransaction } from './importerTransactionService.js';",
  `import { IMPORT_TRANSACTION_VERSION, executeCopyOnlyTransaction, executeMoveOnlyTransaction } from './importerTransactionService.js';\nimport { IPC_CHANNELS } from './ipc/contracts.js';\nimport { registerLibraryHandler } from './ipc/domains/library.js';\nimport { registerMediaHandler } from './ipc/domains/media.js';\nimport { registerPlayerHandler } from './ipc/domains/player.js';\nimport { registerMetadataHandler } from './ipc/domains/metadata.js';\nimport { registerImporterHandler } from './ipc/domains/importer.js';`,
  'insert Main IPC domain imports',
);

const cleanupLoop = /\n\s*for \(const channel of \[\s*(?:'yang-kura:[^']+',?\s*)+\]\) \{\s*ipcMain\.removeHandler\(channel\);\s*\}\s*/g;
const cleanupMatches = main.match(cleanupLoop) ?? [];
if (cleanupMatches.length !== 2) throw new Error(`Expected 2 legacy removeHandler loops, found ${cleanupMatches.length}`);
main = main.replace(cleanupLoop, '\n');

let replacementCount = 0;
for (const [channel, [domain, key]] of Object.entries(channelMap)) {
  const replacement = `${domainFunction[domain]}('${key}',`;
  const single = `ipcMain.handle('${channel}',`;
  const double = `ipcMain.handle(\"${channel}\",`;
  const hits = Number(main.includes(single)) + Number(main.includes(double));
  if (hits !== 1) throw new Error(`Expected one handler for ${channel}, found ${hits}`);
  main = main.replace(single, replacement).replace(double, replacement);
  replacementCount += 1;
}
if (replacementCount !== 35) throw new Error(`Unexpected handler replacement count: ${replacementCount}`);

main = replaceRequired(
  main,
  "mainWindow.webContents.send('yang-kura:player:mpv:event', event);",
  'mainWindow.webContents.send(IPC_CHANNELS.player.mpvEvent, event);',
  'mpv event channel',
);
if (/ipcMain\.(?:handle|removeHandler)\s*\(/.test(main)) throw new Error('Main still owns ipcMain handler registration');
const rawMainChannels = [...main.matchAll(/['\"](yang-kura:[^'\"]+)['\"]/g)].map((match) => match[1]);
if (rawMainChannels.length > 0) throw new Error(`Main retains raw IPC channel literals: ${rawMainChannels.join(', ')}`);
write('electron/main.ts', main);

write('electron/ipc/registerInvokeHandler.ts', `import { ipcMain } from 'electron';
import type { IpcChannel } from './contracts.js';

export type IpcInvokeHandler = Parameters<typeof ipcMain.handle>[1];

export function registerInvokeHandler(channel: IpcChannel, handler: IpcInvokeHandler): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, handler);
}
`);

for (const domain of Object.keys(domainFunction)) {
  const fn = domainFunction[domain];
  const typeName = `${domain[0].toUpperCase()}${domain.slice(1)}ChannelKey`;
  write(`electron/ipc/domains/${domain}.ts`, `import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type ${typeName} = keyof typeof IPC_CHANNELS.${domain};

export function ${fn}(channel: ${typeName}, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.${domain}[channel], handler);
}
`);
}

write('scripts/verify-u36c-main-ipc-domains.mjs', `#!/usr/bin/env node
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const failures = [];
const required = [
  'electron/ipc/registerInvokeHandler.ts',
  'electron/ipc/domains/library.ts',
  'electron/ipc/domains/media.ts',
  'electron/ipc/domains/player.ts',
  'electron/ipc/domains/metadata.ts',
  'electron/ipc/domains/importer.ts',
  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',
  'PROJECT_STATE.md',
  'AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md',
  'AI_HANDOFF/WORKLOG.md',
];
for (const file of required) if (!fs.existsSync(file)) failures.push('missing U36-C file: ' + file);
if (failures.length === 0) {
  const main = read('electron/main.ts');
  const contracts = read('electron/ipc/contracts.ts');
  const registrar = read('electron/ipc/registerInvokeHandler.ts');
  const state = read('PROJECT_STATE.md');
  const handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
  const worklog = read('AI_HANDOFF/WORKLOG.md');
  for (const marker of [
    "import { IPC_CHANNELS } from './ipc/contracts.js';",
    "import { registerLibraryHandler } from './ipc/domains/library.js';",
    "import { registerMediaHandler } from './ipc/domains/media.js';",
    "import { registerPlayerHandler } from './ipc/domains/player.js';",
    "import { registerMetadataHandler } from './ipc/domains/metadata.js';",
    "import { registerImporterHandler } from './ipc/domains/importer.js';",
    'mainWindow.webContents.send(IPC_CHANNELS.player.mpvEvent, event);',
  ]) if (!main.includes(marker)) failures.push('Main domain boundary missing: ' + marker);
  if (/ipcMain\\.(?:handle|removeHandler)\\s*\\(/.test(main)) failures.push('electron/main.ts still owns ipcMain registration');
  if (/['\"]yang-kura:[^'\"]+['\"]/.test(main)) failures.push('electron/main.ts contains a raw IPC channel literal');
  if (!registrar.includes('ipcMain.removeHandler(channel);') || !registrar.includes('ipcMain.handle(channel, handler);')) failures.push('shared invoke registrar does not replace handlers safely');
  for (const domain of ['library', 'media', 'player', 'metadata', 'importer']) {
    const source = read('electron/ipc/domains/' + domain + '.ts');
    if (!source.includes('IPC_CHANNELS.' + domain + '[channel]')) failures.push(domain + ' domain does not own canonical channel lookup');
    if (!source.includes('registerInvokeHandler')) failures.push(domain + ' domain does not use shared registrar');
  }
  const contractChannelCount = (contracts.match(/'yang-kura:/g) || []).length;
  if (contractChannelCount !== 36) failures.push('canonical channel count changed unexpectedly: ' + contractChannelCount);
  for (const [label, source, markers] of [
    ['PROJECT_STATE.md', state, ['U36-C：Main IPC 分域注册完成', '当前阶段：U37']],
    ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff, ['U36-C：完成', '当前任务：U37']],
    ['AI_HANDOFF/WORKLOG.md', worklog, ['### U36-C', '当前任务：U37']],
  ]) for (const marker of markers) if (!source.includes(marker)) failures.push(label + ' missing progress marker: ' + marker);
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('U36-C Main IPC domain registration PASS');
`);

write('docs/architecture/U36C_MAIN_IPC_DOMAINS.md', `# U36-C Main IPC 分域注册

## 结论

U36-C 完成 Electron Main 注册层分域。业务实现、文件事务、Index 写入、mpv 后端、Provider 和返回模型保持不变。

## 新边界

- \`electron/ipc/registerInvokeHandler.ts\`：唯一低层 \`ipcMain.removeHandler/handle\` 所有者。
- \`electron/ipc/domains/library.ts\`：目录授权、扫描、Index 与维护注册。
- \`electron/ipc/domains/media.ts\`：媒体 URL、字幕、外部打开与文件管理器注册。
- \`electron/ipc/domains/player.ts\`：mpv 播放与设置注册。
- \`electron/ipc/domains/metadata.ts\`：ASMR 元数据 Provider 注册。
- \`electron/ipc/domains/importer.ts\`：copy-only、move-only 与 Index patch 注册。

## 不可破坏行为

- Renderer 只接收 root token 与相对路径，不接收 absolute path 或 \`file://\`。
- copy-only、move-only、Index patch、备份恢复和受控清理事务逻辑不变。
- mpv 自动 fallback、Seek、状态事件和退出清理不变。
- \`window.yangKura\` 与 Preload API 不变。

## 自动门禁

\`scripts/verify-u36c-main-ipc-domains.mjs\` 要求：

1. \`electron/main.ts\` 不再调用 \`ipcMain.handle/removeHandler\`。
2. Main 不得出现裸 \`yang-kura:*\` channel 字符串。
3. 五个领域模块必须从 \`IPC_CHANNELS\` 解析 channel。
4. 共享 registrar 在注册前移除旧 handler，兼容窗口重建和测试重复初始化。

## 下一阶段

进入 U37：首页、资源库和详情页面级 UI 迁移；Main 业务实现继续按被页面触碰的纵向切片渐进拆分，不进行一次性重写。
`);

let state = read('PROJECT_STATE.md');
state = replaceRequired(state,
  'U36-B：App Shell、Router 与 Overlay 拆分完成\n当前阶段：U36-C Main IPC 分域注册',
  'U36-B：App Shell、Router 与 Overlay 拆分完成\nU36-C：Main IPC 分域注册完成\n当前阶段：U37 首页、资源库与详情 UI',
  'PROJECT_STATE top stage',
);
state = replaceRequired(state, '## U36：应用壳与契约统一 — 当前阶段', '## U36：应用壳与契约统一 — 已完成', 'PROJECT_STATE U36 heading');
state = replaceRequired(state,
  `### U36-C：当前任务

- 统计 \`electron/main.ts\` 全部 \`ipcMain.handle/on\`。
- 按 Library、Media、Player、Metadata、Importer 分域建立注册模块。
- Main 注册层统一使用 \`IPC_CHANNELS\`。
- 业务实现函数、事务边界和返回模型不改。
- 建立禁止 Main 新增裸 \`yang-kura:*\` channel 的自动门禁。`,
  `### U36-C：Main IPC 分域注册 — 已完成

- 建立 Library、Media、Player、Metadata、Importer 五个 Main 注册模块。
- 建立共享 \`registerInvokeHandler\`，统一注册前的旧 handler 清理。
- \`electron/main.ts\` 不再直接调用 \`ipcMain.handle/removeHandler\`。
- Main channel 统一从 \`IPC_CHANNELS\` 解析，并增加裸 channel 自动门禁。
- 业务实现函数、事务边界、返回模型和 Preload API 保持不变。`,
  'PROJECT_STATE U36-C section',
);
state = replaceRequired(state, '1. 完成 U36-C Main IPC 分域注册。', '1. 推进 U37 首页、资源库与详情页面级 UI 迁移。', 'PROJECT_STATE priority');
write('PROJECT_STATE.md', state);

let handoff = read('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md');
handoff = replaceRequired(handoff,
  'U36-B：完成\n当前任务：U36-C Main IPC 分域注册',
  'U36-B：完成\nU36-C：完成\n当前任务：U37 首页、资源库与详情 UI',
  'handoff top stage',
);
handoff = replaceRequired(handoff,
  '11. `docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md`\n12. `docs/DESIGN.md`\n13. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`\n14. `docs/RELEASE_NOTES_0.168.0-beta.1.md`\n15. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`',
  '11. `docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md`\n12. `docs/architecture/U36C_MAIN_IPC_DOMAINS.md`\n13. `docs/DESIGN.md`\n14. `AI_HANDOFF/AUTONOMOUS_DELIVERY_RULES.md`\n15. `docs/RELEASE_NOTES_0.168.0-beta.1.md`\n16. `MVP130_EXPERIMENTAL_DO_NOT_MERGE.md`',
  'handoff read order',
);
handoff = replaceRequired(handoff,
  `## 5. 当前任务：U36-C

\`\`\`text
Main ipcMain.handle domain registry
+ Library / Media / Player / Metadata / Importer registration modules
+ IPC_CHANNELS-only channel ownership
+ request/response contract mapping
+ electron/main.ts responsibility reduction
\`\`\`

执行顺序：

1. 先统计 \`electron/main.ts\` 的全部 \`ipcMain.handle/on\` 和 channel。
2. 按 Library、Media、Player、Metadata、Importer 分域建立注册函数。
3. 注册层使用 \`IPC_CHANNELS\`，业务实现函数和事务边界不改。
4. 自动门禁禁止 Main 新增裸 \`yang-kura:*\` channel。
5. 完成后进入 U37 页面级 UI 迁移。

明确不做：

- 不同时重写资源库页面；
- 不同时重写播放器核心；
- 不进行 SQLite、OpenList/WebDAV、下载器或 AI Agent 开发；
- 不新增历史字符串 verifier 锚点。`,
  `### U36-C：完成

- Main 注册层按 Library、Media、Player、Metadata、Importer 分域。
- \`electron/main.ts\` 不再直接拥有 \`ipcMain.handle/removeHandler\`。
- 注册 channel 全部来自 \`IPC_CHANNELS\`。
- 文件事务、Index、mpv、Provider、Preload API 和路径安全边界未改变。

## 5. 当前任务：U37

\`\`\`text
首页信息架构与空状态
+ 音声库 / 音乐库页面级 Design System 迁移
+ RJ / 专辑详情层级
+ 高级筛选、多选与错误恢复
+ 被页面触碰的资源库与元数据模块纵向整理
\`\`\`

执行原则：

1. 先迁移首页与资源库日常主路径，再处理详情与高级操作。
2. 每次只拆被当前页面触碰的业务模块，不横向重写全部 Service。
3. 深色、浅色、键盘、窗口尺寸和 reduced-motion 同步验收。
4. 保持真实 Index、播放、元数据覆盖和导入入口可用。

明确不做：

- 不同时重写播放器核心；
- 不进行 SQLite、OpenList/WebDAV、下载器或 AI Agent 开发；
- 不新增历史字符串 verifier 锚点。`,
  'handoff current task section',
);
handoff = replaceRequired(handoff,
  'U36-C Main IPC 分域注册\n→ U37 首页/资源库/详情',
  'U37 首页/资源库/详情',
  'handoff next order',
);
write('AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', handoff);

let worklog = read('AI_HANDOFF/WORKLOG.md');
worklog = replaceRequired(worklog,
  '- 分支：`agent/u36b-app-shell-router-overlays`',
  '- PR：#60\n- 合并提交：`00a2bad8ca24f68048aa4d48d5cc20a0407ecb1a`',
  'worklog U36-B merge fact',
);
worklog = replaceRequired(worklog,
  '- 当前任务：U36-C Main IPC 分域注册。\n\n## 当前结论',
  `- PR #60 的完整 Electron、稳定回归、portable/NSIS 与 Beta 资产门禁通过。

### U36-C — Main IPC 分域注册

- 分支：\`agent/u36c-main-ipc-domains\`。
- 建立共享 invoke registrar 与五个领域注册模块。
- Main 不再直接调用 \`ipcMain.handle/removeHandler\`，channel 全部来自 \`IPC_CHANNELS\`。
- 业务实现、事务、Index、mpv、Provider、Preload API 与路径安全边界保持不变。
- 当前任务：U37 首页、资源库与详情 UI。

## 当前结论`,
  'worklog U36-C entry',
);
worklog = replaceRequired(worklog,
  'U36-B：代码完成，等待本分支最终门禁与合并\n当前任务：U36-C',
  'U36-B：完成\nU36-C：完成\n当前任务：U37',
  'worklog conclusion',
);
write('AI_HANDOFF/WORKLOG.md', worklog);

let handoffVerifier = read('scripts/verify-handoff.mjs');
handoffVerifier = replaceRequired(handoffVerifier,
  "  'docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md',",
  "  'docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md',\n  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',",
  'verify-handoff required U36-C doc',
);
handoffVerifier = replaceRequired(handoffVerifier,
  "  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U36-C Main IPC 分域注册'],\n  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 5. 当前任务：U36-C'],",
  "  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U36-C：完成'],\n  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U37 首页、资源库与详情 UI'],\n  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 5. 当前任务：U37'],",
  'verify-handoff current handoff tokens',
);
handoffVerifier = replaceRequired(handoffVerifier,
  "  ['AI_HANDOFF/WORKLOG.md', '当前任务：U36-C'],",
  "  ['AI_HANDOFF/WORKLOG.md', '### U36-C'],\n  ['AI_HANDOFF/WORKLOG.md', '当前任务：U37'],",
  'verify-handoff worklog tokens',
);
handoffVerifier = replaceRequired(handoffVerifier,
  "  ['PROJECT_STATE.md', '当前阶段：U36-C Main IPC 分域注册'],",
  "  ['PROJECT_STATE.md', 'U36-C：Main IPC 分域注册完成'],\n  ['PROJECT_STATE.md', '当前阶段：U37 首页、资源库与详情 UI'],",
  'verify-handoff state tokens',
);
handoffVerifier = replaceRequired(handoffVerifier,
  "  ['docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md', 'Player Overlay Host'],",
  "  ['docs/architecture/U36B_APP_SHELL_ROUTER_OVERLAYS.md', 'Player Overlay Host'],\n  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'Main IPC 分域注册'],\n  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'registerInvokeHandler'],",
  'verify-handoff architecture tokens',
);
handoffVerifier = replaceRequired(handoffVerifier,
  "console.log('[verify-handoff] U36-B complete and U36-C handoff PASS');",
  "console.log('[verify-handoff] U36-C complete and U37 handoff PASS');",
  'verify-handoff conclusion',
);
write('scripts/verify-handoff.mjs', handoffVerifier);

const verifierFiles = fs.readdirSync('scripts')
  .filter((name) => name.startsWith('verify-') && name.endsWith('.mjs'))
  .map((name) => path.join('scripts', name));
for (const file of verifierFiles) {
  let source = read(file);
  const before = source;
  source = source
    .replaceAll("'当前阶段：U36-C Main IPC 分域注册'", "'U36-C：Main IPC 分域注册完成'")
    .replaceAll("'当前任务：U36-C Main IPC 分域注册'", "'U36-C：完成'")
    .replaceAll("'当前阶段：U36-C'", "'U36-C：Main IPC 分域注册完成'")
    .replaceAll("'当前任务：U36-C'", "'U36-C：完成'");
  if (source !== before) write(file, source);
}

console.log(`U36-C transform complete: ${replacementCount} invoke handlers migrated.`);
