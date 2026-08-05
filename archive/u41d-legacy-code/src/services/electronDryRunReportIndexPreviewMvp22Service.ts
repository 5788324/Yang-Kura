export type ElectronDryRunReportIndexPreviewMvp22Status = 'report-and-index-preview-enabled';

export interface ElectronDryRunReportIndexPreviewMvp22Contract {
  title: 'MVP-21/22 Dry-run 报告与 Index 写入预览';
  status: ElectronDryRunReportIndexPreviewMvp22Status;
  currentDecision: string;
  enabledNow: string[];
  stillBlocked: string[];
  diagnosticsPreviewFields: string[];
  writeIndexPreviewFields: string[];
  nextStep: string[];
}

export const electronDryRunReportIndexPreviewMvp22Service = {
  getContract(): ElectronDryRunReportIndexPreviewMvp22Contract {
    return {
      title: 'MVP-21/22 Dry-run 报告与 Index 写入预览',
      status: 'report-and-index-preview-enabled',
      currentDecision: '加快真实数据闭环：dry-run 结果可以持久化为最近一次预览报告，并可生成 library-index.json 写入预览；但本轮仍不真正写入 index 文件。',
      enabledNow: [
        'Settings 页保存最近一次 dry-run report 到 localStorage，方便 Diagnostics 正式查看。',
        'Electron main 新增 yang-kura:index:write-preview-request。',
        'write-index preview 从最近一次 dry-run 结果生成 LocalJsonIndex 预览对象。',
        'previewIndex 使用 rootPathToken 和 relativePath，不包含 absolutePath / file://。',
        'Diagnostics 页展示最近一次 dry-run report 和 index preview 摘要。',
      ],
      stillBlocked: [
        '不真正写 library-index.json。',
        '不接 SQLite。',
        '不删除 / 不移动 / 不重命名文件。',
        '不返回 absolutePath。',
        '不返回 file://。',
        '不联网抓元数据。',
      ],
      diagnosticsPreviewFields: [
        'displayName / libraryType',
        'discoveredEntryCount / fileCount / directoryCount',
        'collectionCandidateCount / trackCandidateCount',
        'coverCandidateCount / subtitleCandidateCount',
        'warnings / blockedReasons',
        '前若干条 relativePath 预览',
      ],
      writeIndexPreviewFields: [
        'schemaVersion / generatedAt / sourceKind',
        'roots：只存 rootPathToken，不存真实路径',
        'collections：按 collectionCandidate 分组',
        'tracks：按 include-track 条目生成',
        'covers：按 cover 候选生成',
        'subtitles：按 subtitle 候选生成',
        'warnings：合并 dry-run warning 与 blocked reason',
      ],
      nextStep: [
        'MVP-23：用户确认后真正写入 library-index.json。',
        'MVP-24：UI 从真实 library-index.json 读取资源库。',
        'MVP-25：HTMLAudio 本地音频播放验证。',
      ],
    };
  },
};
