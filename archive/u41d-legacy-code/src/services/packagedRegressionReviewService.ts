export type Mvp77RegressionTone = 'emerald' | 'sky' | 'amber' | 'purple' | 'slate';

export interface Mvp77RegressionCheckItem {
  id: string;
  label: string;
  description: string;
  expected: string;
  tone: Mvp77RegressionTone;
}

export interface Mvp77RegressionSection {
  id: string;
  title: string;
  description: string;
  checks: Mvp77RegressionCheckItem[];
}

export interface Mvp77DeepSeekReviewPrompt {
  title: string;
  copyTarget: string;
  prompt: string[];
}

export interface Mvp77PackagedRegressionReviewModel {
  title: string;
  description: string;
  machineChecks: Mvp77RegressionCheckItem[];
  uiLayoutChecks: Mvp77RegressionSection[];
  manualChecks: Mvp77RegressionSection[];
  deepSeekPrompt: Mvp77DeepSeekReviewPrompt;
  guardrails: string[];
}

const makeCheck = (
  id: string,
  label: string,
  description: string,
  expected: string,
  tone: Mvp77RegressionTone,
): Mvp77RegressionCheckItem => ({ id, label, description, expected, tone });

// mvp77-packaged-regression-review: packaged app regression checklist and independent review prompt.
export const packagedRegressionReviewService = {
  getToneClassName(tone: Mvp77RegressionTone): string {
    switch (tone) {
      case 'emerald':
        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-50';
      case 'sky':
        return 'border-sky-500/20 bg-sky-500/5 text-sky-50';
      case 'amber':
        return 'border-amber-500/20 bg-amber-500/5 text-amber-50';
      case 'purple':
        return 'border-purple-500/20 bg-purple-500/5 text-purple-50';
      case 'slate':
      default:
        return 'border-border-color/60 bg-card-bg/30 text-text-secondary';
    }
  },

  getModel(): Mvp77PackagedRegressionReviewModel {
    return {
      title: 'MVP-77 打包版回归验收 / UI 布局审查',
      description: '当前在公司不方便人工验收，本轮把 MVP71～MVP76 的 UI 收口转成机器验收、静态布局审查、人工验收清单和 DeepSeek 对照审查提示词。',
      machineChecks: [
        makeCheck('lint', 'TypeScript 检查', '运行 npm run lint。', '无 TypeScript 错误。', 'emerald'),
        makeCheck('electron-build', 'Electron TS 构建', '运行 npm run build:electron。', 'main/preload 构建通过。', 'sky'),
        makeCheck('mvp77-verifier', 'MVP77 verifier', '运行 npm run verify:mvp77-packaged-regression-review。', '回归清单、DeepSeek 提示词、诊断区锚点全部存在。', 'purple'),
        makeCheck('build', 'Vite 构建', '运行 npm run build。', '构建成功，允许 chunk size warning。', 'amber'),
        makeCheck('audit', '高危依赖检查', '运行 npm audit --audit-level=high。', '无 high / critical 漏洞。', 'slate'),
      ],
      uiLayoutChecks: [
        {
          id: 'mvp77-home-playerbar-layout',
          title: '首页 / 播放栏布局',
          description: 'MVP71～MVP75 后主界面不应再像工程面板，播放栏不应挤满状态 chip。',
          checks: [
            makeCheck('home-daily', '首页日常入口', '首页优先显示继续播放、最近播放、最近加入、音声库、音乐库、歌单。', '不直接显示大量 MVP / Contract / Scanner 工程区块。', 'emerald'),
            makeCheck('playerbar-progress', '播放进度条', '播放栏进度条使用 clamp 和安全 duration。', '进度不越界、不 NaN，拖拽时不明显滞后。', 'sky'),
            makeCheck('playerbar-actions', '播放栏操作区', '底栏只保留播放、队列、喜欢、歌词、音量、结束策略等日常动作。', '状态说明后置，主操作不被挤压。', 'purple'),
          ],
        },
        {
          id: 'mvp77-library-card-layout',
          title: '音声库 / 音乐库卡片布局',
          description: 'MVP76 后媒体库卡片应保持安全列宽、封面比例、长标题截断和窄屏换行。',
          checks: [
            makeCheck('asmr-grid', '音声库卡片墙', '检查 1 / 2 / 3 / 4 列断点。', '普通桌面宽度下卡片不窄、不溢出。', 'emerald'),
            makeCheck('music-track-row', '音乐歌曲行', '窄屏下操作按钮换到下一行。', '标题和封面不被按钮挤压。', 'amber'),
            makeCheck('album-card', '音乐专辑卡片', '标题两行截断，底部信息对齐。', '同一行卡片高度相对稳定。', 'purple'),
          ],
        },
        {
          id: 'mvp77-diagnostics-layout',
          title: '诊断页折叠',
          description: 'MVP75 后诊断页应默认只显示日常摘要，历史 verifier 按阶段折叠。',
          checks: [
            makeCheck('diagnostics-folded', '历史分组默认折叠', '打开诊断页不应一眼看到几十个 MVP 历史块。', '资源库、Electron、播放、UI 收口、Beta 历史分组折叠。', 'sky'),
            makeCheck('diagnostics-ai-maintenance', 'AI 维护信息后置', '工程词保留在 AI 维护区。', '主界面不被 Stub / IPC / Contract 信息污染。', 'slate'),
          ],
        },
      ],
      manualChecks: [
        {
          id: 'mvp77-user-chain',
          title: '用户本机最小回归链路',
          description: '回住所后优先跑这一条，不需要先测下载器、SQLite 或元数据。',
          checks: [
            makeCheck('select-root', '选择资源库目录', '在设置页选择音声库或音乐库目录。', '只返回 tokenized root，Renderer 不显示 absolutePath / file://。', 'emerald'),
            makeCheck('scan-apply', '一键扫描并应用', '执行扫描、写入/读取 library-index.json。', '音声库 / 音乐库显示真实资源。', 'sky'),
            makeCheck('play-audio', '音频播放', '播放 mp3 / wav / flac / m4a 中至少一种真实样本。', '播放、暂停、进度条、继续播放可用。', 'purple'),
            makeCheck('lyrics', '歌词 / 字幕', '选择有 LRC / SRT / VTT / ASS 的样本。', '歌词页可读取并显示字幕。', 'amber'),
            makeCheck('external-open', '图片 / 视频外部打开', '打开封面、视频或文件所在位置。', '由系统默认应用或外部程序打开，不删除/移动/重命名文件。', 'slate'),
          ],
        },
      ],
      deepSeekPrompt: {
        title: 'DeepSeek 对照审查提示词',
        copyTarget: 'docs/DEEPSEEK_REVIEW_PROMPT_MVP77.md',
        prompt: [
          '请审查 Yang-Kura MVP77 源码包，重点检查 MVP71～MVP76 的 UI 收口是否破坏主链路。',
          '不要改代码；只做静态审查和命令验证。',
          '必须检查 package.json version 是否为 0.115.0-mvp77。',
          '运行 npm ci --ignore-scripts、npm run lint、npm run build:electron、npm run verify:mvp77-packaged-regression-review、npm run build、npm audit --audit-level=high。',
          '如果 verify:all 超时，记录超时点，不要乱改；分段补跑 MVP61～MVP77 verifier。',
          '重点看 PlayerBar 进度条是否 clamp、Dashboard 是否仍有工程区块可见、AsmrLibrary/MusicLibrary 是否有卡片溢出风险、DiagnosticsPage 是否默认折叠历史。',
          '严禁接 SQLite、下载器、元数据抓取、mpv；严禁删除/移动/重命名真实媒体文件；严禁向 Renderer 暴露 absolutePath 或 file://。',
        ],
      },
      guardrails: [
        '不接 SQLite',
        '不接下载器',
        '不接 ASMR.one / DLsite / 网易云元数据抓取',
        '不接 mpv',
        '不删除、移动、重命名真实媒体文件',
        '不向 Renderer 暴露 absolutePath',
        '不向 Renderer 暴露 file://',
        '不改真实扫描 / 写 index / 播放内核链路',
      ],
    };
  },
};
