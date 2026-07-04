import {plannedScannerContractService, type PlannedRealScannerContract} from './plannedScannerContractService';

export interface ScannerContractUiPhase {
  id: 'path-demo' | 'dry-run-preview' | 'write-index-confirm';
  title: string;
  status: 'current-demo' | 'planned' | 'blocked';
  description: string;
  allowedActions: string[];
  blockedActions: string[];
}

export interface ScannerSafetyLimit {
  key: 'maxEntries' | 'maxDepth' | 'includeHidden' | 'followSymlinks' | 'mode';
  label: string;
  value: string;
  reason: string;
}

export interface ScannerPreflightChecklistItem {
  id: string;
  label: string;
  required: boolean;
  currentState: 'satisfied-by-demo' | 'planned-only' | 'blocked-until-electron';
}

export interface ScannerContractUiFlow {
  flowVersion: 1;
  title: string;
  status: 'demo-only';
  gateLabel: string;
  contract: PlannedRealScannerContract;
  phases: ScannerContractUiPhase[];
  limits: ScannerSafetyLimit[];
  preflightChecklist: ScannerPreflightChecklistItem[];
  userVisibleSteps: string[];
  nextDevelopmentStep: string;
}

export const scannerContractUiFlowService = {
  getFlow(): ScannerContractUiFlow {
    const contract = plannedScannerContractService.getContract();
    return {
      flowVersion: 1,
      title: 'MVP-07 Scanner Contract UI Flow',
      status: 'demo-only',
      gateLabel: 'Scanner UI Gate: DEMO ONLY · 不读取真实目录 · 不写 library-index.json',
      contract,
      phases: [
        {
          id: 'path-demo',
          title: '阶段 1：保存 Demo 路径',
          status: 'current-demo',
          description: '当前 SettingsPage 只保存用户输入的路径文本，用来验证 UI 流程和配置展示。',
          allowedActions: ['保存路径字符串到前端 settings 状态', '展示 ASMR / music root 的计划配置', '提示当前不会访问磁盘'],
          blockedActions: ['不校验目录是否存在', '不递归读取目录', '不解析媒体文件'],
        },
        {
          id: 'dry-run-preview',
          title: '阶段 2：未来 dry-run scan preview',
          status: 'planned',
          description: '未来 Electron 阶段由用户手动选择小样本目录后，只返回内存 LocalJsonIndex draft 和 ScannerReport。',
          allowedActions: ['previewOnly=true', 'sourceKind=electron-scan', '只返回内存结果', '显示 diagnostics / duplicates / nextActions'],
          blockedActions: ['不写 library-index.json', '不生成 file:// 播放 URL', '不调用播放器'],
        },
        {
          id: 'write-index-confirm',
          title: '阶段 3：未来 write-index 二次确认',
          status: 'blocked',
          description: '只有 dry-run 报告通过后，用户才能二次确认写入 library-index.json；当前阶段完全禁用。',
          allowedActions: ['显示将写入的文件名与 summary', '要求用户确认', '保留备份策略说明'],
          blockedActions: ['当前不实现写入', '不覆盖已有 index', '不自动修复扫描问题'],
        },
      ],
      limits: [
        {key: 'mode', label: 'scan mode', value: 'dry-run first', reason: '第一轮真实能力必须先只读预览，避免误写索引。'},
        {key: 'maxEntries', label: 'maxEntries', value: '建议默认 5000，真实扫描前可调低', reason: '阻止误扫超大目录或全盘。'},
        {key: 'maxDepth', label: 'maxDepth', value: '建议默认 8', reason: '足够覆盖 RJ / 多 disc / 特典目录，同时避免无限递归。'},
        {key: 'includeHidden', label: 'includeHidden', value: 'false', reason: '隐藏目录和系统缓存默认不进入媒体库。'},
        {key: 'followSymlinks', label: 'followSymlinks', value: 'false', reason: '避免符号链接导致循环扫描或跨盘扫描。'},
      ],
      preflightChecklist: [
        {id: 'manual-root', label: '资源库路径必须由用户手动选择或输入，不允许硬编码 E:\\arsm。', required: true, currentState: 'satisfied-by-demo'},
        {id: 'dry-run-first', label: '真实扫描必须先 dry-run，不能直接 write-index。', required: true, currentState: 'planned-only'},
        {id: 'limits-visible', label: 'UI 必须显示 maxEntries / maxDepth / followSymlinks=false。', required: true, currentState: 'satisfied-by-demo'},
        {id: 'no-file-mutation', label: '扫描器不删除、不移动、不重命名、不修复真实文件。', required: true, currentState: 'satisfied-by-demo'},
        {id: 'electron-gate', label: 'Electron IPC 未接入前，不访问真实目录。', required: true, currentState: 'blocked-until-electron'},
        {id: 'write-confirm', label: '写 library-index.json 必须单独二次确认。', required: true, currentState: 'planned-only'},
      ],
      userVisibleSteps: [
        '在设置页保存 ASMR 或流行音乐 Demo 路径。',
        '查看 Scanner UI Flow：确认当前只是路径文本配置。',
        '阅读 dry-run / write-index 两阶段说明。',
        '确认安全限制：maxEntries、maxDepth、includeHidden=false、followSymlinks=false。',
        '下一阶段只能先做 virtual path parser / fixture 用例，不接真实目录。',
      ],
      nextDevelopmentStep: 'MVP-08：virtual path parser 单元用例；继续不读真实盘、不写 library-index.json。',
    };
  },
};
