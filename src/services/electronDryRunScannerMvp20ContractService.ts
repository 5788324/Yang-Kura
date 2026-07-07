export type ElectronDryRunScannerMvp20Status = 'read-only-dry-run-enabled';

export interface ElectronDryRunScannerMvp20Contract {
  title: 'MVP-20 Electron 小样本只读 Dry-run 扫描';
  status: ElectronDryRunScannerMvp20Status;
  currentDecision: string;
  enabledNow: string[];
  stillBlocked: string[];
  acceleratedPlan: string[];
  cleanupResult: string[];
  scannerLimits: Array<{ key: string; value: string; reason: string }>;
  resultGuarantees: string[];
}

export const electronDryRunScannerMvp20ContractService = {
  getContract(): ElectronDryRunScannerMvp20Contract {
    return {
      title: 'MVP-20 Electron 小样本只读 Dry-run 扫描',
      status: 'read-only-dry-run-enabled',
      currentDecision: '个人项目实用优先：用户主动选择目录后，允许 Electron main 做只读 dry-run 扫描；仍不做删除、移动、重命名、索引写入和 SQLite。',
      enabledNow: [
        'Electron main 注册 yang-kura:scanner:dry-run:request。',
        'dry-run 只能使用 MVP-19 生成的 rootPathToken。',
        '扫描真实目录时只读取目录项、文件大小、mtime 和相对路径。',
        'Renderer 可看到 relativePath、entryKind、plannedAction、summary、warnings。',
        'Settings 页可以在选择目录后立即运行小样本 dry-run 预览。',
      ],
      stillBlocked: [
        '不返回 absolutePath。',
        '不返回 file://。',
        '不写 library-index.json。',
        '不接 SQLite。',
        '不删除 / 不移动 / 不重命名文件。',
        '不联网抓元数据。',
        '不接真实音频播放。',
      ],
      acceleratedPlan: [
        'MVP-21：将 dry-run report 做成更正式的 Diagnostics 预览卡。',
        'MVP-22：生成 write-index preview，先让用户二次确认。',
        'MVP-23：写入 library-index.json，完成第一条真实数据闭环。',
        'MVP-24：UI 从真实 library-index.json 读取 ASMR / 音乐集合。',
        'MVP-25：HTMLAudio 本地播放验证。',
        'MVP-26：同名 LRC / SRT / VTT 读取。',
        'MVP-27：视频 / 图片外部打开。',
        'MVP-28：Windows 打包。',
      ],
      cleanupResult: [
        '移除过时的 HANDOFF_SUMMARY_MVP18.md。',
        '新增 CURRENT_ROADMAP_MVP20.md，作为当前主线说明，旧 MVP 文档保留为历史审计记录。',
        '文档边界从“几乎不碰真实目录”调整为“允许用户主动选择目录后的只读扫描”。',
      ],
      scannerLimits: [
        { key: 'maxEntries', value: '默认 10000，上限 50000', reason: '个人项目加快进度，但保留预览截断能力。' },
        { key: 'maxDepth', value: '默认 12，上限 24', reason: '适配常见 ASMR/RJ 文件树和普通音乐专辑目录。' },
        { key: 'followSymlinks', value: 'false', reason: '避免误扫外部位置和循环目录。' },
        { key: 'writeIndex', value: 'false', reason: 'MVP-20 仍只做预览，写 index 放到下一阶段。' },
      ],
      resultGuarantees: [
        'dry-run 结果只包含相对路径和统计。',
        'rootPathToken 对应的 absolutePath 只在 Electron main 内存里使用。',
        'summary.canWriteIndex 必须为 false。',
        'indexWriteAllowed 必须为 false。',
        'absolutePathsReturned / fileUrlReturned 必须为 false。',
      ],
    };
  },
};
