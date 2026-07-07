export type ElectronLibraryIndexWriteMvp23Status = 'confirmed-index-write-enabled';

export interface ElectronLibraryIndexWriteMvp23Contract {
  title: 'MVP-23 Confirmed library-index.json 写入';
  status: ElectronLibraryIndexWriteMvp23Status;
  currentDecision: string;
  enabledNow: string[];
  stillBlocked: string[];
  writeResultFields: string[];
  nextStep: string[];
}

export const electronLibraryIndexWriteMvp23Service = {
  getContract(): ElectronLibraryIndexWriteMvp23Contract {
    return {
      title: 'MVP-23 Confirmed library-index.json 写入',
      status: 'confirmed-index-write-enabled',
      currentDecision:
        '加快进入真实数据闭环：用户主动选择目录、完成 dry-run、生成 index preview 后，可以确认写入 library-index.json。写入位置是用户选择的目录根部，写入前会备份同名旧文件，写入后会读回校验。',
      enabledNow: [
        'Electron main 新增 yang-kura:index:write-confirmed-request。',
        'Settings 页新增“确认写入 index”按钮。',
        '写入内容来自最近一次 dry-run + write-index preview。',
        '如果目标目录已有 library-index.json，会先写 library-index.backup-*.json。',
        '写入后读回校验 schemaVersion / roots / collections / tracks。',
        'Renderer 只收到 indexRelativePath / backupRelativePath / sha256 / 统计，不收到 absolutePath / file://。',
      ],
      stillBlocked: [
        '不删除 / 不移动 / 不重命名任何媒体文件。',
        '不接 SQLite。',
        '不接真实音频播放。',
        '不读取 LRC 正文。',
        '不联网抓元数据。',
        '不返回 absolutePath / file:// 给 Renderer。',
      ],
      writeResultFields: [
        'indexRelativePath：固定 library-index.json',
        'backupRelativePath：如存在旧文件则返回相对备份文件名',
        'bytesWritten / sha256',
        'schemaVersion / rootCount / collectionCount / trackCount',
        'coverCount / subtitleCount / warningCount',
      ],
      nextStep: [
        'MVP-24：UI 从真实 library-index.json 读取资源库。',
        'MVP-25：HTMLAudio 本地音频播放验证。',
        'MVP-26：LRC / 字幕读取。',
      ],
    };
  },
};
