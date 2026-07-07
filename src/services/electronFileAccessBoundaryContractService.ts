export type ElectronFileAccessBoundaryStatus = 'planned-contract-only';
export type ElectronFileAccessContractVersion = 1;

export type ElectronAllowedIpcChannelName =
  | 'yang-kura:dialog:select-library-root'
  | 'yang-kura:scanner:dry-run:request'
  | 'yang-kura:scanner:dry-run:progress'
  | 'yang-kura:scanner:dry-run:response'
  | 'yang-kura:scanner:dry-run:error'
  | 'yang-kura:scanner:dry-run:cancel'
  | 'yang-kura:index:write-preview-request';

export interface ElectronAllowedIpcSurfaceContract {
  channel: ElectronAllowedIpcChannelName;
  direction: 'renderer-to-main' | 'main-to-renderer';
  allowedInMvp13: boolean;
  futurePermission: 'user-initiated' | 'read-only-dry-run' | 'write-index-confirmed' | 'progress-only' | 'error-only';
  payloadShape: string;
  description: string;
}

export interface DirectoryPickerContract {
  apiName: 'yangKura.selectLibraryRoot';
  channel: 'yang-kura:dialog:select-library-root';
  userGestureRequired: true;
  returnsAbsolutePathToRenderer: false;
  returnsPathToken: true;
  acceptsManualPathText: false;
  allowedSelectionMode: 'directory-only';
  description: string;
  resultShape: {
    ok: boolean;
    rootPathToken: '<opaque-root-token>';
    displayName: string;
    libraryType: 'asmr' | 'music' | 'mixed';
  };
}

export interface ReadOnlyDryRunPermissionContract {
  permissionName: 'scanner.readOnlyDryRun';
  requiresDirectoryPickerToken: true;
  previewOnly: true;
  canReadDirectoryEntries: true;
  canReadFileBytes: false;
  canReadMediaMetadata: false;
  canWriteIndex: false;
  canMutateFiles: false;
  maxEntries: number;
  maxDepth: number;
  followSymlinks: false;
  description: string;
}

export interface PathTokenizationContract {
  policyName: 'path-tokenization-v1';
  rendererReceivesAbsolutePath: false;
  rendererReceivesFileUrl: false;
  rendererReceivesRelativePath: true;
  rendererReceivesDisplayName: true;
  tokenShape: '<root-token>/<relative-path>';
  reason: string;
  examples: string[];
}

export interface ForbiddenFileMutationApiContract {
  apiName: string;
  category: 'delete' | 'move' | 'rename' | 'write' | 'chmod' | 'shell' | 'watch' | 'network';
  forbiddenInMvp13: true;
  reason: string;
}

export interface PreloadExposureContract {
  namespace: 'window.yangKura';
  exposedMethods: string[];
  forbiddenExposure: string[];
  description: string;
}

export interface ElectronImplementationPhaseContract {
  id: string;
  title: string;
  status: 'planned' | 'blocked-until-previous-pass';
  description: string;
}

export interface ElectronFileAccessBoundaryContract {
  contractVersion: ElectronFileAccessContractVersion;
  title: 'MVP-13 Electron Shell Boundary + File Access Contract';
  status: ElectronFileAccessBoundaryStatus;
  stageGate: string;
  allowedIpcSurface: ElectronAllowedIpcSurfaceContract[];
  directoryPicker: DirectoryPickerContract;
  readOnlyDryRunPermission: ReadOnlyDryRunPermissionContract;
  pathTokenization: PathTokenizationContract;
  preloadExposure: PreloadExposureContract;
  forbiddenFileMutationApis: ForbiddenFileMutationApiContract[];
  implementationPhases: ElectronImplementationPhaseContract[];
  forbiddenActions: string[];
  nextActions: string[];
}

export const electronFileAccessBoundaryContractService = {
  getContract(): ElectronFileAccessBoundaryContract {
    return {
      contractVersion: 1,
      title: 'MVP-13 Electron Shell Boundary + File Access Contract',
      status: 'planned-contract-only',
      stageGate: 'MVP-13 只定义 Electron main/preload 和文件访问边界；当前不创建 Electron main，不创建 preload，不读取真实目录，不写 library-index.json。',
      allowedIpcSurface: [
        {
          channel: 'yang-kura:dialog:select-library-root',
          direction: 'renderer-to-main',
          allowedInMvp13: false,
          futurePermission: 'user-initiated',
          payloadShape: 'DirectoryPickerRequest -> DirectoryPickerResult',
          description: '未来只能由用户点击选择目录触发；MVP-13 只定义合同。',
        },
        {
          channel: 'yang-kura:scanner:dry-run:request',
          direction: 'renderer-to-main',
          allowedInMvp13: false,
          futurePermission: 'read-only-dry-run',
          payloadShape: 'ScannerIpcRequestEnvelopeContract',
          description: '未来 dry-run 请求必须携带 root token、previewOnly=true、followSymlinks=false。',
        },
        {
          channel: 'yang-kura:scanner:dry-run:progress',
          direction: 'main-to-renderer',
          allowedInMvp13: false,
          futurePermission: 'progress-only',
          payloadShape: 'ScannerProgressEnvelopeContract',
          description: '未来只返回数量和阶段，不返回完整绝对路径列表。',
        },
        {
          channel: 'yang-kura:scanner:dry-run:response',
          direction: 'main-to-renderer',
          allowedInMvp13: false,
          futurePermission: 'read-only-dry-run',
          payloadShape: 'ScannerIpcResponseEnvelopeContract',
          description: '未来返回 dry-run preview，indexWriteAllowed 必须先保持 false。',
        },
        {
          channel: 'yang-kura:scanner:dry-run:error',
          direction: 'main-to-renderer',
          allowedInMvp13: false,
          futurePermission: 'error-only',
          payloadShape: 'ScannerIpcErrorEnvelopeContract',
          description: '未来返回拒绝原因、限制命中和恢复建议。',
        },
        {
          channel: 'yang-kura:scanner:dry-run:cancel',
          direction: 'renderer-to-main',
          allowedInMvp13: false,
          futurePermission: 'user-initiated',
          payloadShape: 'ScannerCancelEnvelopeContract',
          description: '未来只取消 read-only dry-run，不做清理、删除或回滚文件操作。',
        },
        {
          channel: 'yang-kura:index:write-preview-request',
          direction: 'renderer-to-main',
          allowedInMvp13: false,
          futurePermission: 'write-index-confirmed',
          payloadShape: 'WriteIndexPreviewRequestContract | future only',
          description: '未来 write-index 必须在 dry-run PASS 后二次确认；MVP-13 不允许实现。',
        },
      ],
      directoryPicker: {
        apiName: 'yangKura.selectLibraryRoot',
        channel: 'yang-kura:dialog:select-library-root',
        userGestureRequired: true,
        returnsAbsolutePathToRenderer: false,
        returnsPathToken: true,
        acceptsManualPathText: false,
        allowedSelectionMode: 'directory-only',
        description: '未来目录选择必须经系统 dialog 和用户手势触发；renderer 不直接拿绝对路径，只拿 root token 和展示名。',
        resultShape: {
          ok: true,
          rootPathToken: '<opaque-root-token>',
          displayName: 'Selected Library Root',
          libraryType: 'mixed',
        },
      },
      readOnlyDryRunPermission: {
        permissionName: 'scanner.readOnlyDryRun',
        requiresDirectoryPickerToken: true,
        previewOnly: true,
        canReadDirectoryEntries: true,
        canReadFileBytes: false,
        canReadMediaMetadata: false,
        canWriteIndex: false,
        canMutateFiles: false,
        maxEntries: 5000,
        maxDepth: 8,
        followSymlinks: false,
        description: '未来第一轮真实目录能力只允许枚举目录项和扩展名，不读取音频内容、不解析媒体时长、不写索引。',
      },
      pathTokenization: {
        policyName: 'path-tokenization-v1',
        rendererReceivesAbsolutePath: false,
        rendererReceivesFileUrl: false,
        rendererReceivesRelativePath: true,
        rendererReceivesDisplayName: true,
        tokenShape: '<root-token>/<relative-path>',
        reason: '先把绝对路径留在 main 侧，renderer 只处理 root token、relativePath 和 displayName，降低误日志、误上传、误拼 file:// 的风险。',
        examples: [
          '<root-token>/RJ01234567_雨音耳かき/01_本編.mp3',
          '<root-token>/Aimer - Walpurgis/01 Walpurgis.flac',
          '<root-token>/RJ06666666_视频ASMR/01_耳かき映像.mp4',
        ],
      },
      preloadExposure: {
        namespace: 'window.yangKura',
        exposedMethods: [
          'selectLibraryRoot()',
          'requestScannerDryRun(envelope)',
          'cancelScannerDryRun(correlationId)',
          'onScannerDryRunProgress(listener)',
          'onScannerDryRunResponse(listener)',
          'onScannerDryRunError(listener)',
        ],
        forbiddenExposure: [
          'fs',
          'path',
          'shell',
          'ipcRenderer raw object',
          'absolutePath passthrough',
          'fileUrl passthrough',
        ],
        description: '未来 preload 只能暴露窄 API；不能把 Node fs/path/shell 或裸 ipcRenderer 暴露给 renderer。',
      },
      forbiddenFileMutationApis: [
        { apiName: 'fs.rm / fs.unlink', category: 'delete', forbiddenInMvp13: true, reason: 'MVP 不允许删除资源文件或索引文件。' },
        { apiName: 'fs.rename', category: 'rename', forbiddenInMvp13: true, reason: 'MVP 不允许改名或移动用户资源。' },
        { apiName: 'fs.writeFile / fs.appendFile', category: 'write', forbiddenInMvp13: true, reason: 'MVP-13 不写 library-index.json；后续写索引也必须单独 gate。' },
        { apiName: 'fs.copyFile', category: 'move', forbiddenInMvp13: true, reason: '扫描阶段不能复制媒体或封面。' },
        { apiName: 'fs.chmod / fs.chown', category: 'chmod', forbiddenInMvp13: true, reason: '不修改文件权限和所有权。' },
        { apiName: 'child_process.exec / spawn', category: 'shell', forbiddenInMvp13: true, reason: '不调用外部命令扫描或播放。' },
        { apiName: 'fs.watch / chokidar', category: 'watch', forbiddenInMvp13: true, reason: 'MVP-13 不做实时监听，避免大量事件和误操作。' },
        { apiName: 'fetch remote metadata', category: 'network', forbiddenInMvp13: true, reason: '扫描阶段不联网，不上传路径或媒体信息。' },
      ],
      implementationPhases: [
        {
          id: 'mvp13-contract-only',
          title: 'Contract only',
          status: 'planned',
          description: '只定义 Electron 边界和 UI 可见合同，不创建 Electron 文件。',
        },
        {
          id: 'mvp14-electron-shell-skeleton',
          title: 'Electron shell skeleton',
          status: 'blocked-until-previous-pass',
          description: '只创建 main/preload 壳和 stub IPC，不读目录。',
        },
        {
          id: 'mvp15-directory-picker-token',
          title: 'Directory picker token',
          status: 'blocked-until-previous-pass',
          description: '只让用户选择小样本目录，并返回 root token，不扫描。',
        },
        {
          id: 'mvp16-read-only-dry-run',
          title: 'Read-only dry-run scanner',
          status: 'blocked-until-previous-pass',
          description: '只枚举小样本目录生成 dry-run preview，不写索引。',
        },
      ],
      forbiddenActions: [
        'no Electron main/preload implementation in MVP-13',
        'no real directory picker call',
        'no real directory read',
        'no library-index.json write',
        'no SQLite access',
        'no media playback',
        'no file deletion / move / rename / metadata mutation',
        'no absolute path or file:// exposure to renderer',
      ],
      nextActions: [
        'MVP-14：创建 Electron shell skeleton 和 preload type contract，但仍只返回 stub。',
        'MVP-15：实现用户选择小样本目录的 token flow，不扫描目录。',
        'MVP-16：对小样本目录执行 read-only dry-run preview，不写 library-index.json。',
      ],
    };
  },
};
