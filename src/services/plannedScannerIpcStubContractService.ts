import type {
  PlannedDryRunScannerResultContract,
  ScannerDryRunRequestContract,
  ScannerDryRunBlockedReasonContract,
} from './plannedDryRunScannerResultContractService';
import { plannedDryRunScannerResultContractService } from './plannedDryRunScannerResultContractService';

export type ScannerIpcChannelName =
  | 'yang-kura:scanner:dry-run:request'
  | 'yang-kura:scanner:dry-run:response'
  | 'yang-kura:scanner:dry-run:error'
  | 'yang-kura:scanner:dry-run:progress'
  | 'yang-kura:scanner:dry-run:cancel';

export type ScannerIpcEnvelopeVersion = 1;
export type ScannerIpcStubStatus = 'planned-stub-only';
export type ScannerIpcErrorCode =
  | 'scanner-ipc-not-implemented'
  | 'scanner-request-rejected'
  | 'scanner-result-not-available'
  | 'scanner-index-write-disabled';

export interface ScannerIpcChannelContract {
  name: ScannerIpcChannelName;
  direction: 'renderer-to-main' | 'main-to-renderer';
  payloadShape: string;
  status: ScannerIpcStubStatus;
  description: string;
}

export interface ScannerIpcRequestEnvelopeContract {
  envelopeVersion: ScannerIpcEnvelopeVersion;
  channel: 'yang-kura:scanner:dry-run:request';
  correlationId: string;
  requestKind: 'scanner-dry-run';
  payloadShape: 'ScannerDryRunRequestContract';
  payload: ScannerDryRunRequestContract;
  rendererOnly: true;
  requiresUserConfirmation: true;
}

export interface ScannerIpcResponseEnvelopeContract {
  envelopeVersion: ScannerIpcEnvelopeVersion;
  channel: 'yang-kura:scanner:dry-run:response';
  correlationId: string;
  ok: true;
  payloadShape: 'PlannedDryRunScannerResultContract';
  payload: PlannedDryRunScannerResultContract;
  indexWriteAllowed: false;
  responseSource: 'planned-stub';
}

export interface ScannerIpcErrorEnvelopeContract {
  envelopeVersion: ScannerIpcEnvelopeVersion;
  channel: 'yang-kura:scanner:dry-run:error';
  correlationId: string;
  ok: false;
  errorCode: ScannerIpcErrorCode;
  message: string;
  hint: string;
  blockedReasons: ScannerDryRunBlockedReasonContract[];
}

export interface ScannerIpcStubFlowStepContract {
  id: string;
  title: string;
  visibleInUi: boolean;
  description: string;
  allowed: boolean;
}

export interface PlannedScannerIpcStubContract {
  contractVersion: 1;
  title: 'MVP-11 Dry-Run IPC Stub Contract';
  status: ScannerIpcStubStatus;
  stageGate: string;
  channels: ScannerIpcChannelContract[];
  requestEnvelope: ScannerIpcRequestEnvelopeContract;
  responseEnvelope: ScannerIpcResponseEnvelopeContract;
  errorEnvelope: ScannerIpcErrorEnvelopeContract;
  stubFlow: ScannerIpcStubFlowStepContract[];
  forbiddenActions: string[];
  nextActions: string[];
}

const CORRELATION_ID = 'demo-dry-run-correlation-001';

export const plannedScannerIpcStubContractService = {
  getContract(): PlannedScannerIpcStubContract {
    const dryRunContract = plannedDryRunScannerResultContractService.getContract();

    const channels: ScannerIpcChannelContract[] = [
      {
        name: 'yang-kura:scanner:dry-run:request',
        direction: 'renderer-to-main',
        payloadShape: 'ScannerIpcRequestEnvelopeContract',
        status: 'planned-stub-only',
        description: '未来由 SettingsPage 发起 dry-run 请求；MVP-11 只展示合同，不发送真实 IPC。',
      },
      {
        name: 'yang-kura:scanner:dry-run:response',
        direction: 'main-to-renderer',
        payloadShape: 'ScannerIpcResponseEnvelopeContract',
        status: 'planned-stub-only',
        description: '未来返回 dry-run preview；MVP-11 只复用 planned dry-run contract 作为 stub 结果。',
      },
      {
        name: 'yang-kura:scanner:dry-run:error',
        direction: 'main-to-renderer',
        payloadShape: 'ScannerIpcErrorEnvelopeContract',
        status: 'planned-stub-only',
        description: '未来返回拒绝原因和安全阻断；MVP-11 只定义 envelope。',
      },
      {
        name: 'yang-kura:scanner:dry-run:progress',
        direction: 'main-to-renderer',
        payloadShape: 'ScannerProgressEnvelopeContract | planned later',
        status: 'planned-stub-only',
        description: '未来用于长目录扫描进度；MVP-11 不实现。',
      },
      {
        name: 'yang-kura:scanner:dry-run:cancel',
        direction: 'renderer-to-main',
        payloadShape: 'ScannerCancelEnvelopeContract | planned later',
        status: 'planned-stub-only',
        description: '未来用于取消 dry-run；MVP-11 不实现。',
      },
    ];

    const requestEnvelope: ScannerIpcRequestEnvelopeContract = {
      envelopeVersion: 1,
      channel: 'yang-kura:scanner:dry-run:request',
      correlationId: CORRELATION_ID,
      requestKind: 'scanner-dry-run',
      payloadShape: 'ScannerDryRunRequestContract',
      payload: dryRunContract.request,
      rendererOnly: true,
      requiresUserConfirmation: true,
    };

    const responseEnvelope: ScannerIpcResponseEnvelopeContract = {
      envelopeVersion: 1,
      channel: 'yang-kura:scanner:dry-run:response',
      correlationId: CORRELATION_ID,
      ok: true,
      payloadShape: 'PlannedDryRunScannerResultContract',
      payload: dryRunContract,
      indexWriteAllowed: false,
      responseSource: 'planned-stub',
    };

    const errorEnvelope: ScannerIpcErrorEnvelopeContract = {
      envelopeVersion: 1,
      channel: 'yang-kura:scanner:dry-run:error',
      correlationId: CORRELATION_ID,
      ok: false,
      errorCode: 'scanner-ipc-not-implemented',
      message: '当前还没有真实 main/preload bridge；dry-run IPC 只作为 UI 和合同占位。',
      hint: '下一阶段先接 stub response，再考虑受控小样本目录 read-only dry-run。',
      blockedReasons: dryRunContract.blockedReasons,
    };

    return {
      contractVersion: 1,
      title: 'MVP-11 Dry-Run IPC Stub Contract',
      status: 'planned-stub-only',
      stageGate: 'MVP-11 只定义 dry-run IPC channel、request/response envelope、error envelope 和 stub flow；不实现真实 Electron IPC，不读取真实目录。',
      channels,
      requestEnvelope,
      responseEnvelope,
      errorEnvelope,
      stubFlow: [
        {
          id: 'settings-user-confirms-dry-run',
          title: 'Settings 显示 dry-run 用户确认',
          visibleInUi: true,
          description: '用户先看到安全 checklist 和 demo-only gate，再触发未来 dry-run。',
          allowed: true,
        },
        {
          id: 'renderer-builds-envelope',
          title: 'Renderer 组装 request envelope',
          visibleInUi: true,
          description: '请求必须携带 correlationId、mode=dry-run、previewOnly=true、followSymlinks=false。',
          allowed: true,
        },
        {
          id: 'main-returns-stub-result',
          title: 'Main 返回 stub result',
          visibleInUi: true,
          description: 'MVP-11 没有真实 main；UI 只展示 planned-stub response 形状。',
          allowed: true,
        },
        {
          id: 'write-index-disabled',
          title: 'Write index stays disabled',
          visibleInUi: true,
          description: 'dry-run response 中 indexWriteAllowed 必须是 false。',
          allowed: false,
        },
      ],
      forbiddenActions: [
        'no real Electron IPC implementation in MVP-11',
        'no real directory access',
        'no library-index.json write',
        'no SQLite access',
        'no media playback',
        'no file deletion/move/metadata mutation',
      ],
      nextActions: [
        'MVP-12：在 UI 中提供 dry-run stub response preview，不连接真实文件系统。',
        'MVP-13：设计 Electron main/preload 文件访问边界，仍以小样本 dry-run 为先。',
        'MVP-14：用户选择受控测试目录，生成 read-only dry-run preview。',
      ],
    };
  },
};
