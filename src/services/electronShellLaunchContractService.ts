export type ElectronShellLaunchStatus = 'mvp15-runtime-shell-stub';

export interface ElectronShellLaunchScriptContract {
  scriptName: 'build:electron' | 'desktop:dev' | 'desktop:preview';
  command: string;
  purpose: string;
  readsRealDirectory: false;
  writesLibraryIndex: false;
  registersScannerIpc: false;
}

export interface ElectronShellRuntimeCapabilityContract {
  createsBrowserWindow: true;
  loadsViteDevServer: true;
  loadsBuiltDist: true;
  exposesWindowYangKura: true;
  selectLibraryRootStubOnly: true;
  scannerDryRunStubOnly: true;
  canReadRealDisk: false;
  canWriteLibraryIndex: false;
  canReturnAbsolutePath: false;
}

export interface ElectronShellPreloadStubMethodContract {
  name: 'selectLibraryRoot' | 'requestScannerDryRun' | 'getElectronShellStatus';
  exposedOn: 'window.yangKura';
  implementedAsRuntimeStub: true;
  sendsIpcRendererInvoke: false;
  returnsAbsolutePath: false;
  purpose: string;
}

export interface ElectronShellLaunchContract {
  contractVersion: 1;
  title: 'MVP-15 Electron Dependency + Shell Launch Scripts';
  status: ElectronShellLaunchStatus;
  stageGate: string;
  electronDependency: {
    packageName: 'electron';
    dependencyType: 'optionalDependency';
    minimumSafeRange: '^39.8.1';
    validationInstallMode: 'optional-binary';
  };
  launchScripts: ElectronShellLaunchScriptContract[];
  runtimeCapabilities: ElectronShellRuntimeCapabilityContract;
  preloadStubMethods: ElectronShellPreloadStubMethodContract[];
  shellFiles: string[];
  forbiddenActions: string[];
  nextActions: string[];
}

export const electronShellLaunchContractService = {
  getContract(): ElectronShellLaunchContract {
    return {
      contractVersion: 1,
      title: 'MVP-15 Electron Dependency + Shell Launch Scripts',
      status: 'mvp15-runtime-shell-stub',
      stageGate: 'MVP-15 只让 Electron 壳可构建、可启动，并通过 preload 暴露 window.yangKura stub；不启用目录选择、真实 scanner IPC、真实文件读取或 library-index.json 写入。',
      electronDependency: {
        packageName: 'electron',
        dependencyType: 'optionalDependency',
        minimumSafeRange: '^39.8.1',
        validationInstallMode: 'optional-binary',
      },
      launchScripts: [
        {
          scriptName: 'build:electron',
          command: 'tsc -p tsconfig.electron.json',
          purpose: 'Compile electron/main.ts and electron/preload.ts into dist-electron.',
          readsRealDirectory: false,
          writesLibraryIndex: false,
          registersScannerIpc: false,
        },
        {
          scriptName: 'desktop:dev',
          command: 'npm run build:electron && node scripts/run-electron-dev.mjs',
          purpose: 'Start Vite dev server, then launch Electron against the local dev URL.',
          readsRealDirectory: false,
          writesLibraryIndex: false,
          registersScannerIpc: false,
        },
        {
          scriptName: 'desktop:preview',
          command: 'npm run build && npm run build:electron && node scripts/run-electron-preview.mjs',
          purpose: 'Build the renderer and Electron entries, then load dist/index.html inside the shell.',
          readsRealDirectory: false,
          writesLibraryIndex: false,
          registersScannerIpc: false,
        },
      ],
      runtimeCapabilities: {
        createsBrowserWindow: true,
        loadsViteDevServer: true,
        loadsBuiltDist: true,
        exposesWindowYangKura: true,
        selectLibraryRootStubOnly: true,
        scannerDryRunStubOnly: true,
        canReadRealDisk: false,
        canWriteLibraryIndex: false,
        canReturnAbsolutePath: false,
      },
      preloadStubMethods: [
        {
          name: 'selectLibraryRoot',
          exposedOn: 'window.yangKura',
          implementedAsRuntimeStub: true,
          sendsIpcRendererInvoke: false,
          returnsAbsolutePath: false,
          purpose: 'Return a disabled stub response until a later MVP adds a user-gesture-only directory picker.',
        },
        {
          name: 'requestScannerDryRun',
          exposedOn: 'window.yangKura',
          implementedAsRuntimeStub: true,
          sendsIpcRendererInvoke: false,
          returnsAbsolutePath: false,
          purpose: 'Return a disabled stub response until read-only dry-run IPC is explicitly implemented.',
        },
        {
          name: 'getElectronShellStatus',
          exposedOn: 'window.yangKura',
          implementedAsRuntimeStub: true,
          sendsIpcRendererInvoke: false,
          returnsAbsolutePath: false,
          purpose: 'Allow Diagnostics to detect that the Electron shell bridge exists without granting file access.',
        },
      ],
      shellFiles: [
        'electron/main.ts',
        'electron/preload.ts',
        'tsconfig.electron.json',
        'scripts/run-electron-dev.mjs',
        'src/types/electron-api.d.ts',
      ],
      forbiddenActions: [
        'no directory picker implementation in MVP-15',
        'no scanner IPC handler implementation in MVP-15',
        'no real directory traversal',
        'no library-index.json writes',
        'no SQLite integration',
        'no real audio playback integration',
        'no absolute path returned to renderer',
        'no file mutation APIs',
      ],
      nextActions: [
        'Run npm run build:electron to verify main/preload compilation.',
        'Run npm run desktop:dev for manual shell smoke testing after Vite dependencies are installed.',
        'Only after the shell opens reliably, implement a stub UI probe for window.yangKura status.',
      ],
    };
  },
};
