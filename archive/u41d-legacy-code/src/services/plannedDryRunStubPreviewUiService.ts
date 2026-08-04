import { plannedScannerIpcStubContractService } from './plannedScannerIpcStubContractService';
import type {
  ScannerIpcRequestEnvelopeContract,
  ScannerIpcResponseEnvelopeContract,
  ScannerIpcErrorEnvelopeContract,
} from './plannedScannerIpcStubContractService';
import type {
  ScannerDryRunDiscoveredEntryContract,
  ScannerDryRunWarningContract,
  ScannerDryRunBlockedReasonContract,
} from './plannedDryRunScannerResultContractService';

export type DryRunStubPreviewStatus = 'stub-preview-only';
export type DryRunPreviewCardTone = 'safe' | 'info' | 'warning' | 'blocked';

export interface DryRunPreviewMetric {
  label: string;
  value: string | number | boolean;
  tone: DryRunPreviewCardTone;
}

export interface DryRunRequestEnvelopePreview {
  title: 'Request envelope preview';
  channel: ScannerIpcRequestEnvelopeContract['channel'];
  correlationId: string;
  requestKind: ScannerIpcRequestEnvelopeContract['requestKind'];
  rootPathToken: '<user-selected-root>';
  previewOnly: true;
  requiresUserConfirmation: true;
  metrics: DryRunPreviewMetric[];
}

export interface DryRunResponsePayloadPreview {
  title: 'Response payload preview';
  channel: ScannerIpcResponseEnvelopeContract['channel'];
  ok: true;
  responseSource: 'planned-stub';
  indexWriteAllowed: false;
  metrics: DryRunPreviewMetric[];
}

export interface DryRunErrorStatePreview {
  title: 'Error state preview';
  channel: ScannerIpcErrorEnvelopeContract['channel'];
  ok: false;
  errorCode: ScannerIpcErrorEnvelopeContract['errorCode'];
  message: string;
  hint: string;
  blockedReasons: ScannerDryRunBlockedReasonContract[];
}

export interface DryRunResultPreviewCard {
  id: string;
  title: string;
  relativePath: string;
  kind: ScannerDryRunDiscoveredEntryContract['entryKind'];
  plannedAction: ScannerDryRunDiscoveredEntryContract['plannedAction'];
  parserStatus: ScannerDryRunDiscoveredEntryContract['parserStatus'];
  tone: DryRunPreviewCardTone;
  meta: string[];
}

export interface DryRunWarningPreviewCard {
  id: string;
  code: string;
  severity: ScannerDryRunWarningContract['severity'];
  tone: DryRunPreviewCardTone;
  message: string;
  hint: string;
}

export interface PlannedDryRunStubPreviewUiModel {
  previewVersion: 1;
  title: 'MVP-12 Dry-Run Stub Response Preview UI';
  status: DryRunStubPreviewStatus;
  stageGate: string;
  requestEnvelopePreview: DryRunRequestEnvelopePreview;
  responsePayloadPreview: DryRunResponsePayloadPreview;
  errorStatePreview: DryRunErrorStatePreview;
  dryRunResultCards: DryRunResultPreviewCard[];
  warningCards: DryRunWarningPreviewCard[];
  flowBadges: string[];
  forbiddenActions: string[];
}

const toneForEntry = (entry: ScannerDryRunDiscoveredEntryContract): DryRunPreviewCardTone => {
  if (entry.parserStatus === 'unsupported') return 'warning';
  if (entry.plannedAction === 'warn-only') return 'warning';
  if (entry.plannedAction === 'ignore') return 'info';
  return 'safe';
};

const toneForWarning = (warning: ScannerDryRunWarningContract): DryRunPreviewCardTone => {
  if (warning.severity === 'error') return 'blocked';
  if (warning.severity === 'warning') return 'warning';
  return 'info';
};

export const plannedDryRunStubPreviewUiService = {
  getPreview(): PlannedDryRunStubPreviewUiModel {
    const ipcContract = plannedScannerIpcStubContractService.getContract();
    const request = ipcContract.requestEnvelope.payload;
    const response = ipcContract.responseEnvelope.payload;

    const requestEnvelopePreview: DryRunRequestEnvelopePreview = {
      title: 'Request envelope preview',
      channel: ipcContract.requestEnvelope.channel,
      correlationId: ipcContract.requestEnvelope.correlationId,
      requestKind: ipcContract.requestEnvelope.requestKind,
      rootPathToken: request.rootPathToken,
      previewOnly: request.previewOnly,
      requiresUserConfirmation: ipcContract.requestEnvelope.requiresUserConfirmation,
      metrics: [
        { label: 'mode', value: request.mode, tone: 'safe' },
        { label: 'libraryType', value: request.libraryType, tone: 'info' },
        { label: 'scanProfile', value: request.scanProfile, tone: 'info' },
        { label: 'maxEntries', value: request.limits.maxEntries, tone: 'info' },
        { label: 'maxDepth', value: request.limits.maxDepth, tone: 'info' },
        { label: 'followSymlinks', value: request.limits.followSymlinks, tone: 'blocked' },
      ],
    };

    const responsePayloadPreview: DryRunResponsePayloadPreview = {
      title: 'Response payload preview',
      channel: ipcContract.responseEnvelope.channel,
      ok: ipcContract.responseEnvelope.ok,
      responseSource: ipcContract.responseEnvelope.responseSource,
      indexWriteAllowed: ipcContract.responseEnvelope.indexWriteAllowed,
      metrics: [
        { label: 'discovered entries', value: response.summary.discoveredEntryCount, tone: 'info' },
        { label: 'collection candidates', value: response.summary.collectionCandidateCount, tone: 'info' },
        { label: 'track candidates', value: response.summary.trackCandidateCount, tone: 'safe' },
        { label: 'cover candidates', value: response.summary.coverCandidateCount, tone: 'safe' },
        { label: 'subtitle candidates', value: response.summary.subtitleCandidateCount, tone: 'safe' },
        { label: 'canWriteIndex', value: response.summary.canWriteIndex, tone: 'blocked' },
      ],
    };

    const errorStatePreview: DryRunErrorStatePreview = {
      title: 'Error state preview',
      channel: ipcContract.errorEnvelope.channel,
      ok: ipcContract.errorEnvelope.ok,
      errorCode: ipcContract.errorEnvelope.errorCode,
      message: ipcContract.errorEnvelope.message,
      hint: ipcContract.errorEnvelope.hint,
      blockedReasons: ipcContract.errorEnvelope.blockedReasons,
    };

    const dryRunResultCards: DryRunResultPreviewCard[] = response.discoveredEntries.map((entry) => ({
      id: entry.id,
      title: entry.trackCandidate ?? entry.collectionCandidate ?? entry.relativePath,
      relativePath: entry.relativePath,
      kind: entry.entryKind,
      plannedAction: entry.plannedAction,
      parserStatus: entry.parserStatus,
      tone: toneForEntry(entry),
      meta: [
        entry.collectionCandidate ? `collection: ${entry.collectionCandidate}` : undefined,
        entry.rjIdNorm ? `rj: ${entry.rjIdNorm}` : undefined,
        entry.warningCodes.length ? `warnings: ${entry.warningCodes.join(', ')}` : undefined,
      ].filter((value): value is string => Boolean(value)),
    }));

    const warningCards: DryRunWarningPreviewCard[] = response.warnings.map((warning) => ({
      id: warning.code,
      code: warning.code,
      severity: warning.severity,
      tone: toneForWarning(warning),
      message: warning.message,
      hint: warning.hint,
    }));

    return {
      previewVersion: 1,
      title: 'MVP-12 Dry-Run Stub Response Preview UI',
      status: 'stub-preview-only',
      stageGate: 'MVP-12 只把 MVP-11 的 stub response 转成 UI 预览模型；不发送真实 IPC，不读取真实目录，不写 library-index.json。',
      requestEnvelopePreview,
      responsePayloadPreview,
      errorStatePreview,
      dryRunResultCards,
      warningCards,
      flowBadges: [
        'request envelope preview',
        'response payload preview',
        'error state preview',
        'dry-run result cards',
        'still no real Electron IPC',
      ],
      forbiddenActions: [
        'no real Electron IPC call',
        'no real directory read',
        'no library-index.json write',
        'no SQLite access',
        'no media playback',
        'no file mutation',
      ],
    };
  },
};
