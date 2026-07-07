export type Mvp83PushPrepTone = 'emerald' | 'sky' | 'amber' | 'violet';

export interface Mvp83PushPrepCard {
  id: string;
  title: string;
  status: string;
  detail: string;
  tone: Mvp83PushPrepTone;
}

export interface Mvp83PushCommandGroup {
  id: string;
  title: string;
  commands: string[];
  note: string;
}

export interface Mvp83BetaCloseoutPushPrepModel {
  version: string;
  title: string;
  summary: string;
  baseline: string;
  companyNetworkNote: string;
  readinessCards: Mvp83PushPrepCard[];
  validationCommands: string[];
  pushCommandGroups: Mvp83PushCommandGroup[];
  handoffFiles: string[];
  safetyBoundaries: string[];
  nextDecisions: string[];
}

function getModel(): Mvp83BetaCloseoutPushPrepModel {
  return {
    version: '0.121.0-mvp83',
    title: 'MVP-83 Beta 0.1 阶段性收口 / GitHub 推送准备',
    summary: '整理 MVP70～MVP83 的本地源码包、验证命令、回住所推送步骤和当前安全边界；公司网络下不执行 GitHub 推送，不把远程 main 当成最新基线。',
    baseline: '0.120.0-mvp82 / DeepSeek UI bug sweep 后的本地源码包',
    companyNetworkNote: '公司网络可能阻止 git clone / fetch / push；本轮只生成本地可交接源码包和推送说明，实际上传留到回住所后执行。',
    readinessCards: [
      {
        id: 'local-source-baseline',
        title: '本地源码基线',
        status: '已固定',
        detail: '当前开发基线为本地 MVP83 源码包；GitHub main 暂时不是最新开发基线。',
        tone: 'emerald',
      },
      {
        id: 'validation-chain',
        title: '验证链路',
        status: '待本机复跑',
        detail: '回住所后优先执行 npm ci、lint、build:electron、verify:all、build、audit high。',
        tone: 'sky',
      },
      {
        id: 'github-push',
        title: 'GitHub 推送',
        status: '后置',
        detail: '公司网络不推送；回住所后从 clean source 新分支提交 MVP70～MVP83。',
        tone: 'amber',
      },
      {
        id: 'feature-freeze',
        title: '功能边界',
        status: '冻结',
        detail: '本轮不新增扫描、播放、下载、SQLite、mpv 或文件变更能力，只做交接和推送准备。',
        tone: 'violet',
      },
    ],
    validationCommands: [
      'npm ci --ignore-scripts',
      'npm run lint',
      'npm run build:electron',
      'npm run verify:mvp83-beta-closeout-push-prep',
      'npm run verify:all',
      'npm run build',
      'npm audit --audit-level=high',
    ],
    pushCommandGroups: [
      {
        id: 'prepare-local-branch',
        title: '1. 回住所后准备分支',
        commands: [
          'git clone https://github.com/5788324/Yang-Kura.git Yang-Kura-mvp83',
          'cd Yang-Kura-mvp83',
          'git checkout -b mvp83-beta-closeout-push-prep',
        ],
        note: '如果 clone 失败，先确认网络；不要把当前 GitHub main 当成最新源码。',
      },
      {
        id: 'replace-clean-source',
        title: '2. 用本地源码包替换工作树',
        commands: [
          '保留 .git 目录',
          '清空仓库工作树中的旧源码文件',
          '解压并复制 yang-kura-mvp83-beta-closeout-push-prep-source.zip 的全部内容到仓库根目录',
        ],
        note: '复制后先运行验证命令，再 commit。',
      },
      {
        id: 'verify-and-push',
        title: '3. 验证、提交、推送',
        commands: [
          'npm ci --ignore-scripts',
          'npm run verify:all',
          'npm run build',
          'git status',
          'git add .',
          'git commit -m "chore: beta 0.1 mvp83 closeout package"',
          'git push -u origin mvp83-beta-closeout-push-prep',
        ],
        note: '推送失败不要反复乱试；保留本地 zip 和命令输出。',
      },
    ],
    handoffFiles: [
      'README.md',
      'PROJECT_STATE.md',
      'NEXT_CHAT_HANDOFF.md',
      'RUN_ME_FIRST.md',
      'docs/CURRENT_ROADMAP_MVP83.md',
      'docs/BETA_CLOSEOUT_PUSH_PREP_MVP83.md',
      'docs/GITHUB_PUSH_PREP_MVP83.md',
      'HANDOFF_MVP82_TO_MVP83.md',
      'PACKAGE_MANIFEST_MVP83_HANDOFF.txt',
    ],
    safetyBoundaries: [
      '不接 SQLite',
      '不接下载器',
      '不接 ASMR.one / DLsite / 网易云元数据抓取',
      '不接 mpv',
      '不删除 / 移动 / 重命名真实媒体文件',
      '不向 Renderer 暴露 absolutePath / file://',
      '不改真实扫描 / 写 index / 播放内核链路',
    ],
    nextDecisions: [
      '若 DeepSeek 继续发现 bug，下一轮继续做 MVP84 bugfix。',
      '若没有新 bug，回住所后优先完成 GitHub 推送。',
      '推送后再决定是否进入 Electron moderate 依赖升级或 Beta 0.1 打包复测。',
    ],
  };
}

function getToneClassName(tone: Mvp83PushPrepTone): string {
  switch (tone) {
    case 'emerald':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100';
    case 'sky':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-100';
    case 'amber':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-100';
    case 'violet':
    default:
      return 'border-violet-500/20 bg-violet-500/10 text-violet-100';
  }
}

export const betaCloseoutPushPrepService = {
  getModel,
  getToneClassName,
};
