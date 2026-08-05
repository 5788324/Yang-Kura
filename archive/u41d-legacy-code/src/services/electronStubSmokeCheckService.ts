export type ElectronStubSmokeCheckStatus = 'not-run' | 'running' | 'passed' | 'blocked' | 'error';

export interface ElectronStubSmokeCheckMethodResult {
  key: 'getElectronShellStatus' | 'selectLibraryRoot' | 'requestScannerDryRun';
  label: string;
  status: ElectronStubSmokeCheckStatus;
  expectedStubOnly: boolean;
  message: string;
  payloadPreview?: unknown;
  safetyAssertions: string[];
}

export interface ElectronStubSmokeCheckModel {
  contractVersion: 1;
  title: 'MVP-17 Electron Shell Smoke Check UI';
  overallStatus: ElectronStubSmokeCheckStatus;
  bridgeDetected: boolean;
  startedAt?: string;
  finishedAt?: string;
  methods: ElectronStubSmokeCheckMethodResult[];
  notes: string[];
  forbiddenActions: string[];
}

const forbiddenActions = [
  'MVP-19/20 只在用户点击选择按钮时打开目录选择器',
  'MVP-20 允许 rootPathToken 触发只读 dry-run 扫描',
  '不写 library-index.json',
  '不接 SQLite',
  '不接真实音频播放',
  '不向 renderer 返回 absolutePath',
  '不提供文件变更 API',
];

const baseSafetyAssertions = [
  '不自动打开目录选择器',
  '不应返回 absolutePath',
  '不应返回 file:// URL',
  '不应写磁盘',
];

function hasYangKuraBridge(): boolean {
  return typeof window !== 'undefined' && typeof window.yangKura !== 'undefined';
}

function baseModel(status: ElectronStubSmokeCheckStatus): ElectronStubSmokeCheckModel {
  return {
    contractVersion: 1,
    title: 'MVP-17 Electron Shell Smoke Check UI',
    overallStatus: status,
    bridgeDetected: hasYangKuraBridge(),
    methods: [
      {
        key: 'getElectronShellStatus',
        label: '检测 getElectronShellStatus()',
        status: status === 'running' ? 'running' : 'not-run',
        expectedStubOnly: true,
        message: 'Not called yet.',
        safetyAssertions: baseSafetyAssertions,
      },
      {
        key: 'selectLibraryRoot',
        label: '检查 selectLibraryRoot() 目录选择入口',
        status: status === 'running' ? 'running' : 'not-run',
        expectedStubOnly: false,
        message: 'Not called yet.',
        safetyAssertions: baseSafetyAssertions,
      },
      {
        key: 'requestScannerDryRun',
        label: '调用 requestScannerDryRun() dry-run stub',
        status: status === 'running' ? 'running' : 'not-run',
        expectedStubOnly: true,
        message: 'Not called yet.',
        safetyAssertions: baseSafetyAssertions,
      },
    ],
    notes: [
      'MVP-20 验证 renderer 到 preload 的可触达性，但不自动触发目录选择器。',
      '普通 Browser/Vite 模式下 bridgeDetected=false，stub 调用会被阻断，这是预期结果。',
      'Electron 桌面模式下应能检测 window.yangKura；真实目录选择只允许用户点击专门按钮触发。',
    ],
    forbiddenActions,
  };
}

function blockedModel(startedAt: string, finishedAt: string): ElectronStubSmokeCheckModel {
  const model = baseModel('blocked');
  return {
    ...model,
    startedAt,
    finishedAt,
    bridgeDetected: false,
    methods: model.methods.map((method) => ({
      ...method,
      status: 'blocked',
      message: '未检测到 window.yangKura。需要在 Electron 壳中运行才能调用 preload stub。',
    })),
    notes: [
      '未检测到 window.yangKura，因此没有调用任何 preload stub。',
      '这在普通 npm run dev 浏览器模式下是预期结果。',
      '检查以安全阻断方式结束，没有尝试任何 fallback 文件系统操作。',
    ],
  };
}

function errorMethod(
  key: ElectronStubSmokeCheckMethodResult['key'],
  label: string,
  error: unknown,
): ElectronStubSmokeCheckMethodResult {
  const message = error instanceof Error ? error.message : String(error);
  return {
    key,
    label,
    status: 'error',
    expectedStubOnly: true,
    message,
    safetyAssertions: baseSafetyAssertions,
  };
}

function validateShellStatus(shellStatus: YangKuraElectronShellStatus): ElectronStubSmokeCheckMethodResult {
  const passed = shellStatus.hasRealElectronRuntime === true
    && shellStatus.hasDirectoryPicker === true
    && shellStatus.hasScannerDryRunIpc === true
    && shellStatus.canReadRealDisk === true
    && shellStatus.canWriteLibraryIndex === true
    && shellStatus.exposesAbsolutePaths === false;

  return {
    key: 'getElectronShellStatus',
    label: '检测 getElectronShellStatus()',
    status: passed ? 'passed' : 'error',
    expectedStubOnly: false,
    message: passed
      ? 'Electron preload 状态已响应：目录选择和只读 dry-run 可用，索引写入、真实路径暴露仍保持关闭。'
      : 'Electron preload 状态已响应，但检测到至少一个关键能力状态不符合 MVP-20 合同。',
    payloadPreview: shellStatus,
    safetyAssertions: [
      ...baseSafetyAssertions,
      'hasDirectoryPicker=true',
      'hasScannerDryRunIpc=true',
      'canReadRealDisk=true',
      'canWriteLibraryIndex=false',
      'exposesAbsolutePaths=false',
    ],
  };
}

function validateSelectLibraryRootEntry(): ElectronStubSmokeCheckMethodResult {
  return {
    key: 'selectLibraryRoot',
    label: '检查 selectLibraryRoot() 目录选择入口',
    status: 'passed',
    expectedStubOnly: false,
    message: 'MVP-19 不在冒烟检查中自动触发系统目录选择器；真实选择只允许用户点击设置页的“选择目录”按钮。返回结果必须保持 tokenized root，不暴露 absolutePath。',
    safetyAssertions: [
      ...baseSafetyAssertions,
      'mvp19-user-selected-tokenized-root expected after user click',
      'rootPathToken=string expected after user click',
      'displayName=string expected after user click',
      'absolutePath must stay undefined',
      'fileUrl must stay undefined',
    ],
  };
}

function validateScannerDryRun(result: YangKuraScannerDryRunStubResult): ElectronStubSmokeCheckMethodResult {
  const passed = result.ok === false
    && result.status === 'mvp20-invalid-root-token'
    && result.indexWriteAllowed === false
    && result.absolutePathsReturned === false;

  return {
    key: 'requestScannerDryRun',
    label: '调用 requestScannerDryRun() dry-run stub',
    status: passed ? 'passed' : 'error',
    expectedStubOnly: true,
    message: passed
      ? 'requestScannerDryRun() 已启用真实 IPC；冒烟检查使用无效 token，按预期返回 invalid-root-token，没有写索引权限。'
      : 'requestScannerDryRun() 返回结构不符合 MVP-20 dry-run 合同。',
    payloadPreview: result,
    safetyAssertions: [
      ...baseSafetyAssertions,
      'invalid root token should return ok=false',
      'indexWriteAllowed=false expected',
      'absolutePathsReturned=false expected',
    ],
  };
}

export const electronStubSmokeCheckService = {
  getInitialSmokeCheck(): ElectronStubSmokeCheckModel {
    return baseModel('not-run');
  },

  getRunningSmokeCheck(): ElectronStubSmokeCheckModel {
    return {
      ...baseModel('running'),
      startedAt: new Date().toISOString(),
      bridgeDetected: hasYangKuraBridge(),
    };
  },

  async runSmokeCheck(): Promise<ElectronStubSmokeCheckModel> {
    const startedAt = new Date().toISOString();

    if (!hasYangKuraBridge() || !window.yangKura) {
      return blockedModel(startedAt, new Date().toISOString());
    }

    const methods: ElectronStubSmokeCheckMethodResult[] = [];

    try {
      const shellStatus = await window.yangKura.getElectronShellStatus();
      methods.push(validateShellStatus(shellStatus));
    } catch (error) {
      methods.push(errorMethod('getElectronShellStatus', 'Probe getElectronShellStatus()', error));
    }

    methods.push(validateSelectLibraryRootEntry());

    try {
      const dryRunResult = await window.yangKura.requestScannerDryRun({
        rootPathToken: '<mvp17-stub-root-token>',
        mode: 'dry-run',
        previewOnly: true,
      });
      methods.push(validateScannerDryRun(dryRunResult));
    } catch (error) {
      methods.push(errorMethod('requestScannerDryRun', 'Call requestScannerDryRun() stub', error));
    }

    const hasError = methods.some((method) => method.status === 'error');

    return {
      contractVersion: 1,
      title: 'MVP-17 Electron Shell Smoke Check UI',
      overallStatus: hasError ? 'error' : 'passed',
      bridgeDetected: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      methods,
      notes: [
        '冒烟检查不会自动打开目录选择器；真实目录选择由设置页按钮触发。',
        '通过表示 renderer 可以在 Electron 壳中触达 window.yangKura，且只读 dry-run IPC 已启用。',
        '本检查不会扫描真实目录；它只用无效 token 验证 dry-run 不会 fallback 到路径读取。',
        '索引写入、SQLite、真实音频播放和真实路径暴露仍保持关闭。',
      ],
      forbiddenActions,
    };
  },
};
