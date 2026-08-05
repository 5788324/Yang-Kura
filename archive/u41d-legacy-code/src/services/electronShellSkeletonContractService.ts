export type ElectronShellSkeletonStatus = 'stub-only-no-runtime';

export interface ElectronShellStubFileContract {
  path: 'electron/main.ts' | 'electron/preload.ts' | 'src/types/electron-api.d.ts';
  role: string;
  implemented: true;
  importsElectron: false;
  readsDisk: false;
  writesDisk: false;
  sendsIpc: false;
}

export interface ElectronPreloadMethodTypeContract {
  name: 'selectLibraryRoot' | 'requestScannerDryRun' | 'getElectronShellStatus';
  windowNamespace: 'window.yangKura';
  implementedInRuntime: false;
  returnsAbsolutePath: false;
  sendsRealIpc: false;
  description: string;
}

export interface ElectronShellSkeletonContract {
  contractVersion: 1;
  title: 'MVP-14 Electron Shell Skeleton + Preload Type Contract';
  status: ElectronShellSkeletonStatus;
  stageGate: string;
  shellFiles: ElectronShellStubFileContract[];
  preloadNamespace: 'window.yangKura';
  typedApiMethods: ElectronPreloadMethodTypeContract[];
  stubCapabilities: {
    hasElectronRuntime: false;
    createsBrowserWindow: false;
    registersRealIpcHandlers: false;
    opensDirectoryDialog: false;
    readsRealDirectory: false;
    writesLibraryIndex: false;
    exposesAbsolutePaths: false;
  };
  futureImplementationOrder: string[];
  forbiddenActions: string[];
  nextActions: string[];
}

export const electronShellSkeletonContractService = {
  getContract(): ElectronShellSkeletonContract {
    return {
      contractVersion: 1,
      title: 'MVP-14 Electron Shell Skeleton + Preload Type Contract',
      status: 'stub-only-no-runtime',
      stageGate: 'MVP-14 创建 Electron main/preload/type 合同文件，但不引入 Electron 运行时、不注册真实 IPC、不读取真实目录、不写 library-index.json。',
      shellFiles: [
        {
          path: 'electron/main.ts',
          role: 'Future main-process entry skeleton. It exports a contract object only and does not import electron or node:fs.',
          implemented: true,
          importsElectron: false,
          readsDisk: false,
          writesDisk: false,
          sendsIpc: false,
        },
        {
          path: 'electron/preload.ts',
          role: 'Future preload skeleton. It declares the planned window.yangKura surface without contextBridge/ipcRenderer calls.',
          implemented: true,
          importsElectron: false,
          readsDisk: false,
          writesDisk: false,
          sendsIpc: false,
        },
        {
          path: 'src/types/electron-api.d.ts',
          role: 'Renderer-side global type contract for optional window.yangKura methods.',
          implemented: true,
          importsElectron: false,
          readsDisk: false,
          writesDisk: false,
          sendsIpc: false,
        },
      ],
      preloadNamespace: 'window.yangKura',
      typedApiMethods: [
        {
          name: 'selectLibraryRoot',
          windowNamespace: 'window.yangKura',
          implementedInRuntime: false,
          returnsAbsolutePath: false,
          sendsRealIpc: false,
          description: 'Future directory picker. It must return a rootPathToken and displayName, not an absolute path.',
        },
        {
          name: 'requestScannerDryRun',
          windowNamespace: 'window.yangKura',
          implementedInRuntime: false,
          returnsAbsolutePath: false,
          sendsRealIpc: false,
          description: 'Future read-only dry-run scanner request. It must keep previewOnly=true and indexWriteAllowed=false first.',
        },
        {
          name: 'getElectronShellStatus',
          windowNamespace: 'window.yangKura',
          implementedInRuntime: false,
          returnsAbsolutePath: false,
          sendsRealIpc: false,
          description: 'Future diagnostics helper for showing whether the Electron bridge is active.',
        },
      ],
      stubCapabilities: {
        hasElectronRuntime: false,
        createsBrowserWindow: false,
        registersRealIpcHandlers: false,
        opensDirectoryDialog: false,
        readsRealDirectory: false,
        writesLibraryIndex: false,
        exposesAbsolutePaths: false,
      },
      futureImplementationOrder: [
        'MVP-15: add Electron dependency and build scripts without enabling file access',
        'MVP-16: run Vite UI inside Electron shell with preload namespace still stubbed',
        'MVP-17: implement user-gesture-only directory picker returning root token only',
        'MVP-18: implement read-only dry-run scanner for a small selected sample directory',
        'MVP-19: add write-index preview and second confirmation gate',
      ],
      forbiddenActions: [
        'import electron runtime in MVP-14',
        'create BrowserWindow',
        'contextBridge.exposeInMainWorld runtime call',
        'ipcMain.handle / ipcRenderer.invoke runtime call',
        'read real directories',
        'write library-index.json',
        'return absolutePath to renderer',
        'generate file:// URLs',
        'delete / move / rename files',
      ],
      nextActions: [
        'Keep validating Vite UI in browser mode.',
        'Let Codex review that electron/main.ts and electron/preload.ts are contract-only.',
        'Only after MVP-14 PASS, decide whether to add Electron dependency and package scripts.',
      ],
    };
  },
};
