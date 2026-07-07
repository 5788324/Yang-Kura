export type ElectronDirectoryDialogMvp19Status = 'real-dialog-tokenized-no-scan';
export type ElectronDirectoryDialogMvp19PermissionState = 'user-selected' | 'cancelled' | 'rejected';

export interface ElectronDirectoryDialogMvp19Field {
  key: string;
  label: string;
  rendererVisible: boolean;
  description: string;
}

export interface ElectronDirectoryDialogMvp19FlowStep {
  id: string;
  title: string;
  status: 'implemented' | 'still-blocked' | 'next';
  description: string;
}

export interface ElectronDirectoryDialogMvp19Contract {
  contractVersion: 1;
  title: 'MVP-19 Electron 真实目录选择 Dialog / Tokenized Root';
  status: ElectronDirectoryDialogMvp19Status;
  uiLanguage: 'zh-CN';
  resultFields: ElectronDirectoryDialogMvp19Field[];
  implementedNow: string[];
  stillForbidden: string[];
  flow: ElectronDirectoryDialogMvp19FlowStep[];
  securityRules: string[];
}

const securityRules = [
  '目录选择必须由用户主动点击触发。',
  'Electron main 可以拿到真实 absolutePath，但只能保存在 main 侧 token map。',
  'Renderer 只接收 rootPathToken、displayName、libraryType、permissionState。',
  'Renderer 不接收 absolutePath，不接收 file:// URL。',
  'MVP-19 只选择目录，不扫描目录、不读取文件列表、不写 library-index.json。',
  '后续 dry-run 必须使用 rootPathToken，不能让 Renderer 直接传任意绝对路径。',
];

const stillForbidden = [
  '不扫描真实目录',
  '不读取真实文件列表',
  '不写 library-index.json',
  '不注册真实 scanner IPC',
  '不接 SQLite',
  '不接真实音频播放',
  '不删除 / 移动 / 重命名文件',
  '不向 Renderer 返回 absolutePath 或 file:// URL',
];

export const electronDirectoryDialogMvp19ContractService = {
  getContract(): ElectronDirectoryDialogMvp19Contract {
    return {
      contractVersion: 1,
      title: 'MVP-19 Electron 真实目录选择 Dialog / Tokenized Root',
      status: 'real-dialog-tokenized-no-scan',
      uiLanguage: 'zh-CN',
      resultFields: [
        {
          key: 'rootPathToken',
          label: '根目录安全令牌',
          rendererVisible: true,
          description: 'Renderer 后续只能用 token 请求 dry-run；不能直接传真实路径。',
        },
        {
          key: 'displayName',
          label: '用户可见名称',
          rendererVisible: true,
          description: '只展示目录末级名称或默认媒体库名称，不展示完整路径。',
        },
        {
          key: 'libraryType',
          label: '媒体库类型',
          rendererVisible: true,
          description: 'asmr / music / mixed。',
        },
        {
          key: 'permissionState',
          label: '选择状态',
          rendererVisible: true,
          description: 'user-selected / cancelled / rejected。',
        },
        {
          key: 'absolutePath',
          label: '真实绝对路径',
          rendererVisible: false,
          description: '只能保留在 Electron main 侧 token map，禁止返回给 Renderer。',
        },
        {
          key: 'fileUrl',
          label: 'file:// URL',
          rendererVisible: false,
          description: 'MVP-19 不生成、不返回 file:// URL。',
        },
      ],
      implementedNow: [
        'electron/main.ts 注册 yang-kura:dialog:select-library-root。',
        'electron/main.ts 调用 dialog.showOpenDialog 选择目录。',
        'electron/main.ts 用 rootTokenMap 保存真实 absolutePath。',
        'electron/preload.ts 用 ipcRenderer.invoke 暴露受控 selectLibraryRoot。',
        'src/types/electron-api.d.ts 继续禁止 absolutePath / fileUrl 出现在 Renderer result。',
      ],
      stillForbidden,
      flow: [
        {
          id: 'user-clicks-select',
          title: '用户主动点击选择目录',
          status: 'implemented',
          description: 'Settings 页可调用 window.yangKura.selectLibraryRoot()。普通浏览器模式下保持不可用提示。',
        },
        {
          id: 'main-shows-dialog',
          title: 'Electron main 打开目录选择 Dialog',
          status: 'implemented',
          description: '真实 absolutePath 只在 main 进程中出现。',
        },
        {
          id: 'renderer-receives-token',
          title: 'Renderer 只拿到 tokenized root',
          status: 'implemented',
          description: '返回 rootPathToken / displayName / libraryType / permissionState，不返回 absolutePath。',
        },
        {
          id: 'scanner-dry-run',
          title: '下一步：小样本 dry-run 扫描',
          status: 'next',
          description: 'MVP-20 才允许基于 rootPathToken 做只读 dry-run 预览。',
        },
        {
          id: 'blocked-index-write',
          title: '继续阻断：写入 index / 文件变更',
          status: 'still-blocked',
          description: 'MVP-19 不写 library-index.json，不删除、不移动、不重命名任何文件。',
        },
      ],
      securityRules,
    };
  },
};
