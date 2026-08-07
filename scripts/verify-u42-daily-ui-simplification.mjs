#!/usr/bin/env node
/**
 * U42 daily UI simplification verifier.
 *
 * Static contract checks for the first round of daily-surface simplification:
 * - PlayerBar placeholder More button removed;
 * - batch management is opt-in selection mode on ASMR and Music libraries;
 * - RJ track low-frequency actions moved into a "more" menu;
 * - music metadata backup/restore nested under advanced;
 * - MPV manual configuration nested under a collapsed <details>;
 * - Importer defaults to copy, move lives under advanced options;
 * - maintenance entry renamed to 诊断与修复 and collapsed;
 * - engineering wording replaced with user-facing wording;
 * - theme wording corrected (acrylic-mist is dark).
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');

const playerBarAux = read('src/components/PlayerBarAuxiliaryControls.tsx');
const playerBar = read('src/components/PlayerBar.tsx');
const actionsHook = read('src/hooks/usePlayerBarActions.ts');
const actionModel = read('src/player/playerBarActionModel.ts');
const asmr = read('src/features/library/AsmrLibraryPage.tsx');
const music = read('src/features/library/MusicLibraryPage.tsx');
const rj = read('src/features/library/RjDetailPage.tsx');
const metadata = read('src/components/MusicMetadataManagementPanel.tsx');
const settings = read('src/components/SettingsPageDaily.tsx');
const maintenanceEntry = read('src/components/SettingsMaintenanceEntry.tsx');
const importer = read('src/components/ImporterPage.tsx');
const navigation = read('src/app/navigation.ts');
const diagnostics = read('src/components/DiagnosticsPageShell.tsx');
const appRouter = read('src/app/AppRouter.tsx');

const forbidden = [];
const requireToken = (label, source, token) => {
  if (!source.includes(token)) forbidden.push(`${label} missing ${token}`);
};
const forbidToken = (label, source, token) => {
  if (source.includes(token)) forbidden.push(`${label} retains forbidden token ${token}`);
};

// 1. PlayerBar placeholder More button removed from production DOM/source.
forbidToken('PlayerBarAuxiliaryControls', playerBarAux, '更多播放操作（后续开放）');
forbidToken('PlayerBarAuxiliaryControls', playerBarAux, 'u30-more-control');
forbidToken('PlayerBarAuxiliaryControls', playerBarAux, 'MoreHorizontal');
forbidToken('PlayerBar', playerBar, 'onMoreActions');
forbidToken('usePlayerBarActions', actionsHook, 'showMoreActions');
forbidToken('playerBarActionModel', actionModel, 'MORE_PLAYER_ACTIONS_MESSAGE');
// Other player bar controls must remain.
requireToken('PlayerBarAuxiliaryControls', playerBarAux, '收藏到歌单');
requireToken('PlayerBarAuxiliaryControls', playerBarAux, '歌词浮窗开关');
requireToken('PlayerBarAuxiliaryControls', playerBarAux, '静音');
requireToken('PlayerBarAuxiliaryControls', playerBarAux, '播放完成策略');
requireToken('PlayerBarAuxiliaryControls', playerBarAux, 'mvp59-player-beta-chips');
requireToken('PlayerBarAuxiliaryControls', playerBarAux, 'mvp79-player-ui-bugfix');

// 2. ASMR batch mode is opt-in selection mode; entry hidden while in mode.
requireToken('AsmrLibraryPage', asmr, 'const [selectionMode, setSelectionMode] = useState(false)');
requireToken('AsmrLibraryPage', asmr, "aria-label=\"批量管理\"");
requireToken('AsmrLibraryPage', asmr, 'enterSelectionMode');
requireToken('AsmrLibraryPage', asmr, 'exitSelectionMode');
requireToken('AsmrLibraryPage', asmr, 'selectionMode && (');
requireToken('AsmrLibraryPage', asmr, '!selectionMode ? <Button variant="ghost" size="sm" onClick={enterSelectionMode} aria-label="批量管理">批量管理</Button> : null');
requireToken('AsmrLibraryPage', asmr, '退出批量管理');
requireToken('AsmrLibraryPage', asmr, '全选当前结果');
requireToken('AsmrLibraryPage', asmr, '批量加入歌单');

// 3. Music batch mode is opt-in selection mode; tracks-only entry.
requireToken('MusicLibraryPage', music, 'const [selectionMode, setSelectionMode] = useState(false)');
requireToken('MusicLibraryPage', music, "aria-label=\"批量管理\"");
requireToken('MusicLibraryPage', music, 'enterSelectionMode');
requireToken('MusicLibraryPage', music, 'exitSelectionMode');
requireToken('MusicLibraryPage', music, 'selectionMode && (');
requireToken('MusicLibraryPage', music, "activeView === 'tracks' && !selectionMode");
requireToken('MusicLibraryPage', music, '退出批量管理');
requireToken('MusicLibraryPage', music, '全选当前结果');
requireToken('MusicLibraryPage', music, '批量加入队列');
requireToken('MusicLibraryPage', music, 'setSelectionMode(false);');
requireToken('MusicLibraryPage', music, 'setSelectedTrackIds(new Set<string>());');

// 4. RJ track low-frequency actions moved into a more menu.
requireToken('RjDetailPage', rj, 'openMenuTrackId');
requireToken('RjDetailPage', rj, 'u37c-track-menu');
requireToken('RjDetailPage', rj, '复制文件相对路径');
requireToken('RjDetailPage', rj, '在文件管理器中定位');
requireToken('RjDetailPage', rj, '用系统默认应用打开');
requireToken('RjDetailPage', rj, 'u37c-track-more');
// Keep direct actions on the row.
requireToken('RjDetailPage', rj, '加入播放队列');
requireToken('RjDetailPage', rj, '收藏音轨');
requireToken('RjDetailPage', rj, '播放');
forbidToken('RjDetailPage', rj, '复制相对记录');

// 5. Music metadata backup nested under advanced collapsed details.
requireToken('MusicMetadataManagementPanel', metadata, '高级：备份与恢复');
requireToken('MusicMetadataManagementPanel', metadata, '导出修改');
requireToken('MusicMetadataManagementPanel', metadata, '导入恢复');
requireToken('MusicMetadataManagementPanel', metadata, '合并恢复');
requireToken('MusicMetadataManagementPanel', metadata, '替换当前修改');
requireToken('MusicMetadataManagementPanel', metadata, '<details');
requireToken('MusicMetadataManagementPanel', metadata, '保存专辑');
requireToken('MusicMetadataManagementPanel', metadata, '保存曲目');
requireToken('MusicMetadataManagementPanel', metadata, '还原专辑');
requireToken('MusicMetadataManagementPanel', metadata, '还原曲目');

// 6. MPV manual configuration nested under advanced.
requireToken('SettingsPageDaily', settings, '高级播放组件设置');
requireToken('SettingsPageDaily', settings, '<details');
requireToken('SettingsPageDaily', settings, '重新检测');
requireToken('SettingsPageDaily', settings, '选择播放组件');
requireToken('SettingsPageDaily', settings, '清除手动设置');
requireToken('SettingsPageDaily', settings, '选择本地音频播放后端偏好');

// 7. Importer defaults to copy; move under advanced.
requireToken('ImporterPage', importer, "useState<ImportExecutionMode>('copy')");
requireToken('ImporterPage', importer, '复制到资源库');
requireToken('ImporterPage', importer, '高级导入选项');
requireToken('ImporterPage', importer, '移动到资源库');
requireToken('ImporterPage', importer, 'handleAdvancedToggle');
requireToken('ImporterPage', importer, '移动会把来源文件移出原目录');
requireToken('ImporterPage', importer, '检查文件冲突');
requireToken('ImporterPage', importer, '操作记录');
// Normal area must contain only the real copy action; no fake disabled move button.
forbidToken('ImporterPage', importer, '移动（高级）');
forbidToken('ImporterPage', importer, 'aria-disabled');
forbidToken('ImporterPage', importer, "updateMode('copy')}\" className=\"flex items-center justify-center gap-2 rounded-xl border border-border-color p-3 text-xs font-bold text-text-secondary\"");
requireToken('ImporterPage', importer, 'setOperationPlanId(createImportOperationPlanId())');

// 8. Maintenance renamed and collapsed.
requireToken('SettingsMaintenanceEntry', maintenanceEntry, '诊断与修复');
requireToken('SettingsMaintenanceEntry', maintenanceEntry, '<details');
requireToken('SettingsMaintenanceEntry', maintenanceEntry, 'id="u39b-settings-maintenance-entry"');
requireToken('navigation.ts', navigation, '诊断与修复');
forbidToken('navigation.ts', navigation, "label: 'AI 维护'");
requireToken('DiagnosticsPageShell', diagnostics, '诊断与修复');
forbidToken('SettingsPageDaily', settings, 'AI 维护页面');
// SettingsMaintenanceEntry must render after SettingsPage within the settings branch.
const settingsBlock = appRouter.split('currentPage === \'settings\'')[1] ?? '';
const settingsPageIdx = settingsBlock.indexOf('<SettingsPage ');
const maintenanceIdx = settingsBlock.indexOf('<SettingsMaintenanceEntry ');
requireToken('AppRouter', appRouter, '<SettingsMaintenanceEntry onOpenMaintenance={() => props.setCurrentPage(\'diagnostics\')} />');
if (settingsPageIdx === -1 || maintenanceIdx === -1 || maintenanceIdx < settingsPageIdx) {
  forbidden.push('AppRouter settings branch must render SettingsMaintenanceEntry after SettingsPage');
}

// 9. Engineering wording replaced.
forbidToken('ImporterPage', importer, '冲突预检');
forbidToken('ImporterPage', importer, 'Index 已备份并更新');
forbidToken('ImporterPage', importer, 'Index 更新');
forbidToken('ImporterPage', importer, 'OperationLog');
requireToken('SettingsPageDaily', settings, '失败自动切换播放方式');

// 10. Theme wording corrected.
requireToken('SettingsPageDaily', settings, '云雾深色');
requireToken('SettingsPageDaily', settings, '浅色低饱和蓝色材质');
forbidToken('SettingsPageDaily', settings, '浅色雾面材质');

if (forbidden.length) {
  console.error(forbidden.join('\n'));
  process.exit(1);
}
console.log('[U42 daily UI simplification verifier] PASS');
console.log('player-more=removed; batch=opt-in; rj-menu=more; metadata/advanced; mpv/advanced; importer/copy-default; maintenance/renamed; wording/theme corrected');
