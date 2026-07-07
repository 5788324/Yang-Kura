export type ElectronRuntimeMode = 'browser-vite' | 'electron-stub' | 'probe-error';

export interface ElectronRuntimeProbeCapability {
  key: string;
  label: string;
  value: boolean | string;
  tone: 'safe' | 'blocked' | 'neutral';
}

export interface ElectronRuntimeProbeModel {
  contractVersion: 1;
  title: 'MVP-16 Renderer-Side Electron Status Probe';
  mode: ElectronRuntimeMode;
  bridgeDetected: boolean;
  checkedVia: 'renderer-window-probe' | 'preload-status-method' | 'probe-error-fallback';
  statusLabel: string;
  shellStatus?: YangKuraElectronShellStatus;
  capabilities: ElectronRuntimeProbeCapability[];
  notes: string[];
  forbiddenActions: string[];
}

const forbiddenActions = [
  'no real directory picker in MVP-16',
  'no scanner IPC implementation in MVP-16',
  'no real directory traversal',
  'no library-index.json writes',
  'no SQLite integration',
  'no real audio playback integration',
  'no absolute path returned to renderer',
  'no file mutation APIs',
];

function hasRendererWindow(): boolean {
  return typeof window !== 'undefined';
}

function hasYangKuraBridge(): boolean {
  return hasRendererWindow() && typeof window.yangKura !== 'undefined';
}

function browserProbe(): ElectronRuntimeProbeModel {
  return {
    contractVersion: 1,
    title: 'MVP-16 Renderer-Side Electron Status Probe',
    mode: 'browser-vite',
    bridgeDetected: false,
    checkedVia: 'renderer-window-probe',
    statusLabel: 'Browser / Vite renderer only',
    capabilities: [
      { key: 'window.yangKura', label: 'Electron preload bridge', value: false, tone: 'neutral' },
      { key: 'directoryPicker', label: 'Directory picker', value: false, tone: 'blocked' },
      { key: 'scannerDryRunIpc', label: 'Scanner dry-run IPC', value: false, tone: 'blocked' },
      { key: 'readDisk', label: 'Read real disk', value: false, tone: 'blocked' },
      { key: 'writeIndex', label: 'Write library-index.json', value: false, tone: 'blocked' },
    ],
    notes: [
      'Running in browser/Vite mode because window.yangKura is not present.',
      'This is expected during npm run dev and static browser preview.',
      'MVP-16 only probes runtime status; it does not request filesystem access.',
    ],
    forbiddenActions,
  };
}

function electronProbe(shellStatus: YangKuraElectronShellStatus): ElectronRuntimeProbeModel {
  return {
    contractVersion: 1,
    title: 'MVP-16 Renderer-Side Electron Status Probe',
    mode: 'electron-stub',
    bridgeDetected: true,
    checkedVia: 'preload-status-method',
    statusLabel: 'Electron shell detected / preload stub active',
    shellStatus,
    capabilities: [
      { key: 'window.yangKura', label: 'Electron preload bridge', value: true, tone: 'safe' },
      { key: 'status', label: 'Shell status', value: shellStatus.status, tone: 'neutral' },
      { key: 'directoryPicker', label: 'Directory picker', value: shellStatus.hasDirectoryPicker, tone: 'blocked' },
      { key: 'scannerDryRunIpc', label: 'Scanner dry-run IPC', value: shellStatus.hasScannerDryRunIpc, tone: 'blocked' },
      { key: 'readDisk', label: 'Read real disk', value: shellStatus.canReadRealDisk, tone: 'blocked' },
      { key: 'writeIndex', label: 'Write library-index.json', value: shellStatus.canWriteLibraryIndex, tone: 'blocked' },
      { key: 'absolutePaths', label: 'Expose absolute paths', value: shellStatus.exposesAbsolutePaths, tone: 'blocked' },
    ],
    notes: [
      'window.yangKura exists and getElectronShellStatus() returned a preload stub status.',
      'The bridge is detection-only at MVP-16: selectLibraryRoot and requestScannerDryRun still return disabled stub responses.',
      'No real directory, scanner, index, SQLite, or playback capability is enabled by this probe.',
    ],
    forbiddenActions,
  };
}

function errorProbe(message: string): ElectronRuntimeProbeModel {
  return {
    contractVersion: 1,
    title: 'MVP-16 Renderer-Side Electron Status Probe',
    mode: 'probe-error',
    bridgeDetected: hasYangKuraBridge(),
    checkedVia: 'probe-error-fallback',
    statusLabel: 'Electron probe failed safely',
    capabilities: [
      { key: 'window.yangKura', label: 'Electron preload bridge', value: hasYangKuraBridge(), tone: 'neutral' },
      { key: 'probeError', label: 'Probe error', value: message, tone: 'blocked' },
      { key: 'readDisk', label: 'Read real disk', value: false, tone: 'blocked' },
      { key: 'writeIndex', label: 'Write library-index.json', value: false, tone: 'blocked' },
    ],
    notes: [
      'The renderer runtime probe caught an error and failed closed.',
      'No fallback filesystem action is attempted.',
      message,
    ],
    forbiddenActions,
  };
}

export const electronRuntimeProbeService = {
  getBrowserProbe: browserProbe,

  getInitialProbe(): ElectronRuntimeProbeModel {
    return hasYangKuraBridge()
      ? {
          ...browserProbe(),
          mode: 'electron-stub',
          bridgeDetected: true,
          statusLabel: 'Electron preload bridge detected / status pending',
          notes: [
            'window.yangKura exists; async getElectronShellStatus() has not completed yet.',
            'No filesystem action is performed while the status probe is pending.',
          ],
        }
      : browserProbe();
  },

  async probe(): Promise<ElectronRuntimeProbeModel> {
    if (!hasYangKuraBridge() || !window.yangKura) {
      return browserProbe();
    }

    try {
      const shellStatus = await window.yangKura.getElectronShellStatus();
      return electronProbe(shellStatus);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return errorProbe(message);
    }
  },
};
