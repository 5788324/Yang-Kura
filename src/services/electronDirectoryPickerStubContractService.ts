export type ElectronDirectoryPickerStubPermissionState = 'stub-only' | 'planned-user-consent' | 'disabled';

export interface ElectronDirectoryPickerTokenizedRootStubResult {
  ok: true;
  status: 'mvp18-tokenized-root-stub';
  rootPathToken: string;
  displayName: string;
  libraryType: YangKuraLibraryType;
  permissionState: ElectronDirectoryPickerStubPermissionState;
  source: 'mvp18-stub';
  absolutePathReturned: false;
  fileUrlReturned: false;
  message: string;
  safetyNotes: string[];
}

export interface ElectronDirectoryPickerFutureContractField {
  key: string;
  label: string;
  required: boolean;
  rendererVisible: boolean;
  description: string;
}

export interface ElectronDirectoryPickerStubFlowStep {
  id: string;
  title: string;
  status: 'current-stub' | 'planned' | 'blocked';
  description: string;
}

export interface ElectronDirectoryPickerStubContract {
  contractVersion: 1;
  title: 'MVP-18 Electron 目录选择 Stub 合同';
  status: 'stub-only-no-dialog';
  uiLanguage: 'zh-CN';
  stubResult: ElectronDirectoryPickerTokenizedRootStubResult;
  futureResultFields: ElectronDirectoryPickerFutureContractField[];
  flow: ElectronDirectoryPickerStubFlowStep[];
  securityRules: string[];
  forbiddenActions: string[];
}

const securityRules = [
  'Renderer 只接收 rootPathToken，不接收 absolutePath。',
  'Renderer 只展示 displayName 和 libraryType。',
  '真实 absolute path 未来只能保留在 Electron main 侧。',
  '目录选择必须由用户主动触发，不能启动时自动扫描。',
  'dry-run 之前必须先经过扫描前安全确认。',
  'write-index 必须晚于 dry-run，并且需要二次确认。',
];

const forbiddenActions = [
  '不打开真实目录选择器',
  '不读取真实目录',
  '不返回 absolutePath',
  '不返回 file:// URL',
  '不写 library-index.json',
  '不注册真实 scanner IPC',
  '不删除 / 移动 / 重命名文件',
  '不接 SQLite',
];

export const electronDirectoryPickerStubContractService = {
  getContract(): ElectronDirectoryPickerStubContract {
    return {
      contractVersion: 1,
      title: 'MVP-18 Electron 目录选择 Stub 合同',
      status: 'stub-only-no-dialog',
      uiLanguage: 'zh-CN',
      stubResult: {
        ok: true,
        status: 'mvp18-tokenized-root-stub',
        rootPathToken: 'yk-root-stub-asmr-001',
        displayName: '示例音声库（Stub，不是真实路径）',
        libraryType: 'asmr',
        permissionState: 'stub-only',
        source: 'mvp18-stub',
        absolutePathReturned: false,
        fileUrlReturned: false,
        message: 'MVP-18 只返回 tokenized root stub；没有打开真实目录选择器。',
        safetyNotes: securityRules,
      },
      futureResultFields: [
        {
          key: 'ok',
          label: '是否完成用户选择',
          required: true,
          rendererVisible: true,
          description: '真实实现时，只有用户主动选择目录后才允许为 true。MVP-18 为 stub true，用于验证返回结构。',
        },
        {
          key: 'rootPathToken',
          label: '根目录安全令牌',
          required: true,
          rendererVisible: true,
          description: 'Renderer 后续用 token 请求 dry-run，不直接持有 absolute path。',
        },
        {
          key: 'displayName',
          label: '用户可见名称',
          required: true,
          rendererVisible: true,
          description: '用于 UI 展示，例如“ASMR 本地库”或“Music”。',
        },
        {
          key: 'libraryType',
          label: '媒体库类型',
          required: true,
          rendererVisible: true,
          description: 'asmr / music / mixed。',
        },
        {
          key: 'permissionState',
          label: '权限状态',
          required: true,
          rendererVisible: true,
          description: 'MVP-18 为 stub-only；未来真实 dialog 后可变为 planned-user-consent。',
        },
        {
          key: 'absolutePath',
          label: '真实绝对路径',
          required: false,
          rendererVisible: false,
          description: '禁止返回给 renderer；未来只能保留在 main 侧的 token map。',
        },
      ],
      flow: [
        {
          id: 'mvp18-stub-return',
          title: '当前：返回 tokenized root stub',
          status: 'current-stub',
          description: 'selectLibraryRoot() 不打开 dialog，只返回固定 rootPathToken / displayName / libraryType。',
        },
        {
          id: 'future-user-dialog',
          title: '未来：用户主动选择目录',
          status: 'planned',
          description: 'Electron main 调用安全目录选择器，renderer 仍只拿到 token。',
        },
        {
          id: 'future-dry-run',
          title: '未来：用 token 发起 dry-run',
          status: 'planned',
          description: 'Scanner dry-run 使用 rootPathToken，不接受 renderer 提供的任意绝对路径。',
        },
        {
          id: 'blocked-file-mutation',
          title: '继续禁止：任何文件变更',
          status: 'blocked',
          description: 'MVP-18 不提供删除、移动、重命名、写索引能力。',
        },
      ],
      securityRules,
      forbiddenActions,
    };
  },
};
