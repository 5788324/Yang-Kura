import { copyOnlyImportCloseoutService } from "./copyOnlyImportCloseoutService";
import { importerDailyUiCleanupService } from "./importerDailyUiCleanupService";
import { moveOnlyCloseoutService } from "./moveOnlyCloseoutService";
import {
  moveOnlyStrategyService,
  type Mvp103MoveOnlyStrategyTone,
} from "./moveOnlyStrategyService";

export type Mvp108ImporterFinalRegressionTone = Mvp103MoveOnlyStrategyTone;

export interface Mvp108RegressionChecklistItem {
  id: string;
  title: string;
  expected: string;
  status: "ready" | "manual-check" | "blocked";
  tone: Mvp108ImporterFinalRegressionTone;
}

export interface Mvp108RegressionGroup {
  id: string;
  title: string;
  summary: string;
  items: Mvp108RegressionChecklistItem[];
}

export interface Mvp108ImporterAuditFinding {
  id: string;
  title: string;
  finding: string;
  recommendation: string;
  tone: Mvp108ImporterFinalRegressionTone;
}

export interface Mvp108ImporterFinalRegressionResult {
  checklistVersion: "mvp108-importer-final-regression-checklist-v1";
  mode: "importer-final-regression-checklist";
  developmentPausedAfterCloseout: true;
  copyOnlyChainClosed: true;
  moveOnlyChainClosed: true;
  importerUiCleanupDone: true;
  requiresManualPackagedRegression: true;
  codexRequired: false;
  fileOperationsChanged: false;
  libraryIndexWrittenInMvp108: false;
  sqliteWritten: false;
  downloaderTouched: false;
  metadataProviderTouched: false;
  mpvTouched: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  nextRecommendedAction: "pause development and run human review";
}

export interface Mvp108ImporterFinalRegressionModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  closeoutResult: Mvp108ImporterFinalRegressionResult;
  releaseGateCards: Mvp108RegressionChecklistItem[];
  regressionGroups: Mvp108RegressionGroup[];
  auditFindings: Mvp108ImporterAuditFinding[];
  manualReviewSteps: string[];
  pauseScope: string[];
  notTouched: string[];
}

function getToneClassName(tone: Mvp108ImporterFinalRegressionTone): string {
  return moveOnlyStrategyService.getToneClassName(tone);
}

function getModel(): Mvp108ImporterFinalRegressionModel {
  const copyCloseout = copyOnlyImportCloseoutService.getModel();
  const moveCloseout = moveOnlyCloseoutService.getModel();
  const uiCleanup = importerDailyUiCleanupService.getModel();

  const releaseGateCards: Mvp108RegressionChecklistItem[] = [
    {
      id: "copy-only-chain",
      title: "复制导入闭环",
      expected: "MVP95-MVP102 已闭环，copy-only 仍是默认推荐导入方式。",
      status: "ready",
      tone: "emerald",
    },
    {
      id: "move-only-chain",
      title: "移动导入闭环",
      expected: "MVP103-MVP106 已闭环到小样本 executor，仍需用户显式确认。",
      status: "manual-check",
      tone: "amber",
    },
    {
      id: "daily-ui",
      title: "导入器日常界面",
      expected: "MVP107 已把工程说明折叠，主页面面向日常使用。",
      status: "ready",
      tone: "sky",
    },
    {
      id: "pause-development",
      title: "暂停开发审查",
      expected: "MVP108 后暂停新增功能，先审导入器链路与打包版表现。",
      status: "manual-check",
      tone: "violet",
    },
  ];

  return {
    version: "0.146.0-mvp108",
    title: "MVP-108 导入器最终回归清单 / 暂停开发审查",
    summary:
      "导入器 copy-only、move-only 与日常 UI 已阶段性收口。本轮不再新增真实能力，只提供最终回归清单、审查结论和暂停开发范围，避免继续堆功能导致真实链路未经复核。",
    baseline: `${copyCloseout.version} + ${moveCloseout.version} + ${uiCleanup.version}`,
    closeoutResult: {
      checklistVersion: "mvp108-importer-final-regression-checklist-v1",
      mode: "importer-final-regression-checklist",
      developmentPausedAfterCloseout: true,
      copyOnlyChainClosed: true,
      moveOnlyChainClosed: true,
      importerUiCleanupDone: true,
      requiresManualPackagedRegression: true,
      codexRequired: false,
      fileOperationsChanged: false,
      libraryIndexWrittenInMvp108: false,
      sqliteWritten: false,
      downloaderTouched: false,
      metadataProviderTouched: false,
      mpvTouched: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      nextRecommendedAction: "pause development and run human review",
    },
    releaseGateCards,
    regressionGroups: [
      {
        id: "copy-only-regression",
        title: "复制导入回归",
        summary: "确认复制导入仍是最安全的日常入口。",
        items: [
          {
            id: "copy-confirmation",
            title: "二次确认",
            expected: "copy-only 执行前仍需要确认，不覆盖同名文件。",
            status: "manual-check",
            tone: "emerald",
          },
          {
            id: "copy-operation-log",
            title: "操作日志",
            expected: "复制结果写 OperationLog，失败列表可见。",
            status: "manual-check",
            tone: "sky",
          },
          {
            id: "copy-index-refresh",
            title: "索引刷新",
            expected: "写入 library-index.json patch 后 UI 能刷新资源库。",
            status: "manual-check",
            tone: "violet",
          },
        ],
      },
      {
        id: "move-only-regression",
        title: "移动导入回归",
        summary: "确认 move-only 仍处于小样本、显式确认、失败停止范围。",
        items: [
          {
            id: "move-small-sample",
            title: "小样本限制",
            expected: "一次最多 20 个文件，真实大批量 move 后置。",
            status: "manual-check",
            tone: "amber",
          },
          {
            id: "move-no-overwrite",
            title: "不覆盖",
            expected: "目标存在时跳过或阻塞，不覆盖。",
            status: "manual-check",
            tone: "rose",
          },
          {
            id: "move-no-source-cleanup",
            title: "不清理源目录",
            expected: "移动后不自动删除空目录、不做清理。",
            status: "ready",
            tone: "violet",
          },
        ],
      },
      {
        id: "ui-regression",
        title: "导入器 UI 回归",
        summary: "确认用户主页面不再被工程维护说明淹没。",
        items: [
          {
            id: "daily-actions-visible",
            title: "日常动作可见",
            expected: "选择来源、预览、冲突、复制/移动、结果摘要清晰可见。",
            status: "manual-check",
            tone: "sky",
          },
          {
            id: "maintenance-folded",
            title: "AI 维护区折叠",
            expected: "MVP、IPC、verifier、合同细节默认折叠。",
            status: "ready",
            tone: "violet",
          },
        ],
      },
      {
        id: "path-privacy-regression",
        title: "路径与文件安全回归",
        summary: "确认主界面和 renderer 仍不暴露真实路径协议。",
        items: [
          {
            id: "no-absolute-path",
            title: "不暴露 absolutePath",
            expected: "Renderer 仍只接收 token / displayName / relativePath。",
            status: "manual-check",
            tone: "rose",
          },
          {
            id: "no-file-url",
            title: "不暴露 file://",
            expected: "UI 与 IPC 结果不返回 file://。",
            status: "manual-check",
            tone: "rose",
          },
        ],
      },
    ],
    auditFindings: [
      {
        id: "importer-mainline-complete",
        title: "导入器主线已阶段性完成",
        finding:
          "copy-only 已完整闭环，move-only 已完成小样本执行闭环，导入器已经可以从工程推进阶段转入回归审查阶段。",
        recommendation: "暂停新增导入器功能，先做打包版和小样本回归。",
        tone: "emerald",
      },
      {
        id: "move-only-risk-remains",
        title: "move-only 仍需谨慎",
        finding:
          "move-only 已具备真实文件移动能力，但仍是小样本能力，不应直接扩到大批量或自动整理。",
        recommendation: "大批量移动、源目录清理、自动合并目录继续后置。",
        tone: "amber",
      },
      {
        id: "ui-maintenance-info",
        title: "工程说明仍然很多",
        finding:
          "工程说明保留对 AI 维护有价值，但用户本人不会阅读。MVP107 已折叠主页面，诊断页仍保留维护信息。",
        recommendation: "后续 UI 只继续向日常使用收口，不再把工程卡片放回主流程。",
        tone: "sky",
      },
      {
        id: "next-feature-should-wait",
        title: "下个大功能应等待审查后再选",
        finding:
          "下载器、元数据 Provider、mpv、SQLite 都不是导入器收尾的阻塞项。",
        recommendation: "回归通过后再决定下一大方向。",
        tone: "violet",
      },
    ],
    manualReviewSteps: [
      "用小样本库跑 copy-only 导入，确认 backup、index patch、UI refresh。",
      "用可丢弃小样本跑 move-only，确认二次确认、不覆盖、失败停止、OperationLog。",
      "检查导入器主页面是否只保留日常入口，AI 维护信息是否默认折叠。",
      "检查打包版启动、导入、播放、字幕、外部打开是否仍正常。",
      "检查 renderer/UI 结果中没有 absolutePath / file://。",
    ],
    pauseScope: [
      "MVP108 后暂停新增导入器功能。",
      "暂停下载器、元数据 Provider、mpv、SQLite 新功能开发。",
      "先做人工审查和必要小样本回归。",
      "Codex 非必要不安排；只有真实打包版或本机小样本失败时再使用。",
    ],
    notTouched: [
      "不改 copy-only executor。",
      "不改 move-only executor。",
      "不再次写 library-index.json。",
      "不接 SQLite。",
      "不接下载器。",
      "不接元数据 Provider。",
      "不接 mpv。",
      "不返回 absolutePath。",
      "不返回 file://。",
      "不安排 Codex。",
    ],
  };
}

export const importerFinalRegressionChecklistService = {
  getModel,
  getToneClassName,
};
