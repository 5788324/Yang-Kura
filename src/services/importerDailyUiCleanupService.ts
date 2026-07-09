import { copyOnlyImportCloseoutService } from "./copyOnlyImportCloseoutService";
import { moveOnlyCloseoutService } from "./moveOnlyCloseoutService";
import {
  moveOnlyStrategyService,
  type Mvp103MoveOnlyStrategyTone,
} from "./moveOnlyStrategyService";

export type Mvp107ImporterDailyUiCleanupTone = Mvp103MoveOnlyStrategyTone;

export interface Mvp107ImporterDailyAction {
  id: string;
  label: string;
  description: string;
  tone: Mvp107ImporterDailyUiCleanupTone;
}

export interface Mvp107ImporterDailyStep {
  id: string;
  title: string;
  detail: string;
}

export interface Mvp107ImporterDailyStatusCard {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: Mvp107ImporterDailyUiCleanupTone;
}

export interface Mvp107ImporterDailyUiCleanupResult {
  cleanupVersion: "mvp107-importer-daily-ui-cleanup-v1";
  mode: "importer-daily-ui-cleanup";
  copyOnlyChainClosed: true;
  moveOnlyChainClosed: true;
  dailyImporterSurfaceEnabled: true;
  aiMaintenanceFoldEnabled: true;
  userFacingFirst: true;
  engineeringDetailsHiddenByDefault: true;
  importerExecutionChanged: false;
  fileOperationsChanged: false;
  libraryIndexWrittenInMvp107: false;
  sqliteWritten: false;
  downloaderTouched: false;
  metadataProviderTouched: false;
  mpvTouched: false;
  absolutePathReturned: false;
  fileUrlReturned: false;
  codexRequired: false;
  nextRecommendedMvp: "MVP108 importer final regression checklist";
}

export interface Mvp107ImporterDailyUiCleanupModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  cleanupResult: Mvp107ImporterDailyUiCleanupResult;
  statusCards: Mvp107ImporterDailyStatusCard[];
  dailyActions: Mvp107ImporterDailyAction[];
  dailySteps: Mvp107ImporterDailyStep[];
  aiMaintenanceFoldSummary: string[];
  userFacingSurface: string[];
  hiddenEngineeringDetails: string[];
  notTouched: string[];
}

function getToneClassName(tone: Mvp107ImporterDailyUiCleanupTone): string {
  return moveOnlyStrategyService.getToneClassName(tone);
}

function getModel(): Mvp107ImporterDailyUiCleanupModel {
  const copyCloseout = copyOnlyImportCloseoutService.getModel();
  const moveCloseout = moveOnlyCloseoutService.getModel();

  return {
    version: "0.145.0-mvp107",
    title: "MVP-107 导入器日常界面简化",
    summary:
      "把导入器主页面从 MVP86-MVP106 的工程说明面板，收口为用户日常能看懂的入口：选择来源、导入预览、冲突、目标位置、复制/移动、结果摘要。工程合同仍保留，但默认折叠进 AI 维护区。",
    baseline: `${copyCloseout.version} + ${moveCloseout.version}`,
    cleanupResult: {
      cleanupVersion: "mvp107-importer-daily-ui-cleanup-v1",
      mode: "importer-daily-ui-cleanup",
      copyOnlyChainClosed: true,
      moveOnlyChainClosed: true,
      dailyImporterSurfaceEnabled: true,
      aiMaintenanceFoldEnabled: true,
      userFacingFirst: true,
      engineeringDetailsHiddenByDefault: true,
      importerExecutionChanged: false,
      fileOperationsChanged: false,
      libraryIndexWrittenInMvp107: false,
      sqliteWritten: false,
      downloaderTouched: false,
      metadataProviderTouched: false,
      mpvTouched: false,
      absolutePathReturned: false,
      fileUrlReturned: false,
      codexRequired: false,
      nextRecommendedMvp: "MVP108 importer final regression checklist",
    },
    statusCards: [
      {
        id: "copy-ready",
        title: "复制导入",
        value: "已闭环",
        detail: "适合日常整理，失败不影响源文件。",
        tone: "emerald",
      },
      {
        id: "move-ready",
        title: "移动导入",
        value: "小样本可用",
        detail: "需要确认，不覆盖，失败停止。",
        tone: "amber",
      },
      {
        id: "index-refresh",
        title: "入库刷新",
        value: "已接通",
        detail: "写入 index 后可刷新音声库 / 音乐库。",
        tone: "sky",
      },
      {
        id: "maintenance-fold",
        title: "工程说明",
        value: "已折叠",
        detail: "保留给 AI 维护，默认不打扰用户。",
        tone: "violet",
      },
    ],
    dailyActions: [
      {
        id: "choose-source",
        label: "选择来源",
        description: "选择已有 RJ、音乐专辑、单曲或混合目录。",
        tone: "sky",
      },
      {
        id: "preview-import",
        label: "查看预览",
        description: "先看识别结果、文件数量、字幕和封面。",
        tone: "emerald",
      },
      {
        id: "resolve-conflict",
        label: "处理冲突",
        description: "发现同 RJ、同专辑、同文件时先提示，不自动覆盖。",
        tone: "amber",
      },
      {
        id: "run-import",
        label: "执行导入",
        description: "默认复制；移动导入需要显式确认。",
        tone: "violet",
      },
    ],
    dailySteps: [
      {
        id: "source",
        title: "1. 选择导入来源",
        detail: "从下载目录、手动整理目录或临时目录开始。",
      },
      {
        id: "preview",
        title: "2. 预览识别结果",
        detail: "确认作品、专辑、音轨、封面、字幕和目标位置。",
      },
      {
        id: "confirm",
        title: "3. 选择复制或移动",
        detail: "复制更稳；移动只用于你确认要把源文件搬入仓库时。",
      },
      {
        id: "finish",
        title: "4. 完成后刷新资源库",
        detail: "导入完成后刷新首页、音声库、音乐库和最近播放状态。",
      },
    ],
    aiMaintenanceFoldSummary: [
      "MVP86-MVP106 的 verifier、IPC、合同、边界卡片仍保留。",
      "用户本人不会阅读和维护工程说明。",
      "复杂说明默认折叠到 mvp107-importer-ai-maintenance-fold。",
      "诊断页继续保留完整 AI 维护区。",
    ],
    userFacingSurface: [
      "导入器主界面只保留日常动作和结果摘要。",
      "减少 MVP 编号、IPC、contract、verifier、stub 等工程词。",
      "把“安全边界”换成用户能理解的“不覆盖 / 可预览 / 有日志”。",
      "copy-only 和 move-only 不再在主界面重复解释几十张卡片。",
    ],
    hiddenEngineeringDetails: [
      "MVP86-MVP106 历史实现细节。",
      "sourceRootToken / targetRootToken / IPC channel 等工程合同。",
      "absolutePath / file:// / fs.copyFile / fs.rename 禁止项说明。",
      "AI 维护和 verifier markers。",
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
      "Codex 非必要不安排。",
    ],
  };
}

export const importerDailyUiCleanupService = {
  getModel,
  getToneClassName,
};
