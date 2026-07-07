declare module 'electron' {
  export interface IpcMainInvokeEvent {}

  export interface OpenDialogOptions {
    title?: string;
    buttonLabel?: string;
    properties?: Array<'openFile' | 'openDirectory' | 'multiSelections' | 'showHiddenFiles' | 'createDirectory' | 'promptToCreate' | 'noResolveAliases' | 'treatPackageAsDirectory' | 'dontAddToRecent'>;
  }

  export interface OpenDialogReturnValue {
    canceled: boolean;
    filePaths: string[];
  }

  export const dialog: {
    showOpenDialog(browserWindow: BrowserWindow, options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
    showOpenDialog(options: OpenDialogOptions): Promise<OpenDialogReturnValue>;
  };

  export const ipcMain: {
    handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: unknown[]) => unknown | Promise<unknown>): void;
  };

  export const ipcRenderer: {
    invoke(channel: string, ...args: unknown[]): Promise<unknown>;
  };

  export interface BrowserWindowConstructorOptions {
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    title?: string;
    backgroundColor?: string;
    show?: boolean;
    webPreferences?: {
      preload?: string;
      contextIsolation?: boolean;
      nodeIntegration?: boolean;
      sandbox?: boolean;
      webSecurity?: boolean;
    };
  }

  export class BrowserWindow {
    constructor(options?: BrowserWindowConstructorOptions);
    static getAllWindows(): BrowserWindow[];
    once(event: 'ready-to-show', listener: () => void): this;
    show(): void;
    loadURL(url: string): Promise<void>;
    loadFile(filePath: string): Promise<void>;
  }

  export const app: {
    whenReady(): Promise<void>;
    on(event: 'activate' | 'window-all-closed', listener: () => void | Promise<void>): void;
    quit(): void;
  };



  export const protocol: {
    registerSchemesAsPrivileged(schemes: Array<{
      scheme: string;
      privileges: {
        standard?: boolean;
        secure?: boolean;
        supportFetchAPI?: boolean;
        stream?: boolean;
        corsEnabled?: boolean;
      };
    }>): void;
    handle(scheme: string, handler: (request: Request) => Response | Promise<Response>): void;
  };

  export const net: {
    fetch(url: string): Promise<Response>;
  };

  export const contextBridge: {
    exposeInMainWorld(apiKey: string, api: unknown): void;
  };

  export const shell: {
    openPath(path: string): Promise<string>;
    showItemInFolder(path: string): void;
  };
}
