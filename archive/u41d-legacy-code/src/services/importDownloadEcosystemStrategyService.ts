export type Mvp84StrategyTone = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose';

export interface Mvp84StrategyCard {
  id: string;
  title: string;
  status: string;
  detail: string;
  tone: Mvp84StrategyTone;
}

export interface Mvp84StrategyPhase {
  id: string;
  title: string;
  steps: string[];
  guardrail: string;
}

export interface Mvp84ImportDownloadStrategyModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  gitAttempt: string;
  cards: Mvp84StrategyCard[];
  importerFlow: string[];
  roadmapPhases: Mvp84StrategyPhase[];
  metadataRules: string[];
  playerBackendRules: string[];
  safetyBoundaries: string[];
  nextImplementationOrder: string[];
}

function getModel(): Mvp84ImportDownloadStrategyModel {
  return {
    version: '0.122.0-mvp84',
    title: 'MVP-84 导入器 / 下载生态 / 项目总规划并入',
    summary: '吸收 2026-07-07 项目总规划：短期不继续堆 UI 小功能，下一阶段优先做导入器 / 入库器；下载器改为 Yang-Kura 自研生态但后置；mpv 子进程后端作为长期播放器路线；GitHub main 仍不是最新基线。',
    baseline: '0.121.0-mvp83 / Beta 0.1 阶段性收口与推送准备包',
    gitAttempt: '标准 git 访问 GitHub 已实际尝试，当前环境无法解析 github.com；本轮不通过 API 强推，继续输出本地 clean source 包。',
    cards: [
      {
        id: 'importer-first',
        title: '导入器优先',
        status: '下一阶段第一优先级',
        detail: '先吃已有 RJ 专辑、流行音乐、手动下载目录；从预览、冲突、目标路径计划开始，不直接自动移动。',
        tone: 'emerald',
      },
      {
        id: 'download-ecosystem',
        title: '下载生态后置',
        status: '策略冻结',
        detail: 'arsm-downing / musicdl 作为参考经验，不作为长期外部依赖；先统一 DownloadTask / Manifest / Provider 模型。',
        tone: 'sky',
      },
      {
        id: 'controlled-file-ops',
        title: '受控文件操作',
        status: 'copy first',
        detail: '文件操作边界从绝对禁止调整为：预览、确认、操作日志、失败记录、可追踪；第一阶段只 copy，不永久删除。',
        tone: 'amber',
      },
      {
        id: 'metadata-sources',
        title: '元数据分来源',
        status: '后续模型',
        detail: 'localFolder / localText / dlsite / asmrOne / userOverride 分来源保存；userOverride 永远最高。',
        tone: 'violet',
      },
      {
        id: 'mpv-route',
        title: 'mpv 长期路线',
        status: '后置',
        detail: '音声 / 音乐长期走 mpv 子进程后端，HTMLAudio 继续保底；视频和图片仍外部打开。',
        tone: 'rose',
      },
    ],
    importerFlow: [
      '选择下载完成目录 / 手动目录',
      '识别 RJ 专辑 / 音乐专辑 / 单曲 / 混合目录',
      '读取封面 / 字幕 / 标签 / 文件结构',
      '生成导入预览和 ImportTask 草案',
      '检查同 RJ、同文件、同专辑、同 hash 冲突',
      '生成目标路径计划和 copy/move 操作计划',
      '用户确认后执行 copy only 第一版',
      '写入操作日志、失败记录，再触发扫描入库',
    ],
    roadmapPhases: [
      {
        id: 'mvp85-models',
        title: 'MVP-85 类型模型合同',
        steps: ['ImportTask', 'DownloadTask', 'DownloadManifest', 'MetadataSource', 'ImportTargetPlan', 'ImportConflictReport'],
        guardrail: '只写类型、文档和 verifier，不接真实文件操作。',
      },
      {
        id: 'mvp86-ui-shell',
        title: 'MVP-86 导入器 UI 壳',
        steps: ['导入页入口', '选择来源目录占位', '预览表格', '冲突说明', '操作计划占位'],
        guardrail: '只预览，不移动、不复制、不写 index。',
      },
      {
        id: 'mvp87-88-detect',
        title: 'MVP-87/88 RJ 与音乐识别',
        steps: ['RJ 文件夹识别', 'metadata.json / txt 识别', 'ID3 / FLAC tags 读取规划', '封面 / 字幕候选识别'],
        guardrail: '只读识别；真实导入仍需预览和确认。',
      },
      {
        id: 'mvp89-92-controlled-import',
        title: 'MVP-89～92 受控导入',
        steps: ['冲突检测', '目标路径规划', 'copy only 导入', 'move with operation log 后置'],
        guardrail: '禁止无预览自动移动；禁止自动删除；禁止覆盖同名文件。',
      },
      {
        id: 'mvp93-plus-downloader',
        title: 'MVP-93+ 自研下载生态',
        steps: ['DownloadEngine 壳', 'DirectUrlProvider', 'AsmrOneProvider', 'MusicProvider 评估'],
        guardrail: '下载器后置于导入器；不做 DRM/加密绕过。',
      },
    ],
    metadataRules: [
      'userOverride 永远最高。',
      '本地文件结构决定实际音轨。',
      'DLsite 作为官方标题 / 社团 / 发售日优先来源。',
      'ASMR.one 作为标签 / 补充信息 / 下载结构参考。',
      '下载器 manifest 只作为下载状态和文件结果参考。',
      '网易云 / QQ 加密格式只标记为受保护文件，不做解密器。',
    ],
    playerBackendRules: [
      'HTMLAudio 保留为可用 fallback。',
      'mpv.exe 子进程后端作为长期正式路线。',
      'Renderer 不直接碰真实路径，只发 play / pause / seek / volume 等白名单命令。',
      '视频 / MV / 图片继续系统默认程序 / PotPlayer / 外部播放器打开。',
    ],
    safetyBoundaries: [
      '本轮不接 SQLite。',
      '本轮不接真实下载器。',
      '本轮不接 ASMR.one / DLsite / 网易云 / QQ Provider。',
      '本轮不接 mpv 后端。',
      '本轮不复制 / 移动 / 删除 / 重命名真实媒体文件。',
      '任何未来文件操作必须预览、确认、写日志、失败可追踪。',
      '不向 Renderer 暴露 absolutePath 或 file://。',
    ],
    nextImplementationOrder: [
      'MVP85：ImportTask / DownloadTask / Manifest / MetadataSource 数据模型合同。',
      'MVP86：导入器 UI 壳，只预览，不移动。',
      'MVP87：RJ 专辑导入识别。',
      'MVP88：流行音乐导入识别。',
      'MVP89：冲突检测。',
      'MVP90：目标路径规划。',
      'MVP91：copy only 导入。',
    ],
  };
}

function getToneClassName(tone: Mvp84StrategyTone): string {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
    case 'sky':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
    case 'amber':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
    case 'violet':
      return 'border-violet-500/20 bg-violet-500/10 text-violet-50';
    case 'rose':
    default:
      return 'border-rose-500/20 bg-rose-500/10 text-rose-50';
  }
}

export const importDownloadEcosystemStrategyService = {
  getModel,
  getToneClassName,
};
