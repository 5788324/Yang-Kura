export type Mvp80DailyTone = 'daily' | 'safe' | 'advanced' | 'blocked';

export interface Mvp80DailyCard {
  id: string;
  title: string;
  description: string;
  tone: Mvp80DailyTone;
  items: string[];
}

export interface Mvp80SurfaceAuditItem {
  id: string;
  label: string;
  status: string;
  description: string;
  tone: Mvp80DailyTone;
}

export interface Mvp80SettingsDiagnosticsDailyFinalizeModel {
  title: string;
  summary: string;
  settingsCards: Mvp80DailyCard[];
  diagnosticsCards: Mvp80DailyCard[];
  surfaceAudit: Mvp80SurfaceAuditItem[];
  hiddenEngineeringTerms: string[];
  guardrails: string[];
  hiddenMaintenanceNote: string;
}

class SettingsDiagnosticsDailyFinalizeService {
  getModel(): Mvp80SettingsDiagnosticsDailyFinalizeModel {
    return {
      title: '设置页 / 诊断页日常化最终检查',
      summary:
        'MVP-80 继续把普通用户可见内容收成“资源库、主题、外部打开、隐私、安全摘要”，工程历史和验证细节只保留在高级诊断与 AI 维护区。',
      settingsCards: [
        {
          id: 'library-root',
          title: '资源库入口',
          description: '设置页优先展示选择目录、读取记录、一键扫描并应用。',
          tone: 'daily',
          items: ['选择目录', '读取记录', '扫描并应用'],
        },
        {
          id: 'appearance',
          title: '外观与主题',
          description: '主题、视觉偏好和基础使用说明保留在日常设置里。',
          tone: 'daily',
          items: ['主题', '界面观感', '中文提示'],
        },
        {
          id: 'privacy',
          title: '隐私与文件安全',
          description: '文件安全规则保持可见；真实路径、file://、工程验证继续不进入主界面。',
          tone: 'safe',
          items: ['不上传媒体', '不暴露真实路径', '不改媒体文件'],
        },
        {
          id: 'advanced-maintenance',
          title: '高级维护后置',
          description: 'Scanner / Contract / Bridge / IPC / MVP 历史默认折叠，只供 AI 维护时展开。',
          tone: 'advanced',
          items: ['高级工具', '历史验证', 'AI 维护'],
        },
      ],
      diagnosticsCards: [
        {
          id: 'daily-summary',
          title: '日常摘要',
          description: '诊断页默认先显示资源库状态、播放链路、安全提示。',
          tone: 'daily',
          items: ['资源状态', '播放状态', '安全提示'],
        },
        {
          id: 'folded-history',
          title: '历史折叠',
          description: 'MVP 历史、verifier、IPC、Contract、Scanner 细节继续默认折叠。',
          tone: 'advanced',
          items: ['历史分组', '默认折叠', '按需展开'],
        },
        {
          id: 'safe-boundary',
          title: '安全边界',
          description: '本轮只做可见层级和文案收口，不接新能力。',
          tone: 'safe',
          items: ['不接 SQLite', '不接下载器', '不接 mpv'],
        },
      ],
      surfaceAudit: [
        {
          id: 'settings-user-copy',
          label: '设置页日常文案',
          status: '收口',
          description: '资源库页签中的高危工程词继续后置；按钮文案改为用户能理解的扫描预览 / 应用记录。',
          tone: 'daily',
        },
        {
          id: 'settings-history-fold',
          label: '设置页历史记录',
          status: '默认折叠',
          description: 'Beta 候选、GUI 回归、Electron 修复等历史维护记录不再直接铺满关于页。',
          tone: 'advanced',
        },
        {
          id: 'diagnostics-daily-first',
          label: '诊断页日常优先',
          status: '保留',
          description: '诊断页继续以日常诊断摘要开头，历史验证与工程合同默认折叠。',
          tone: 'safe',
        },
      ],
      hiddenEngineeringTerms: ['Scanner', 'Contract', 'Bridge', 'Dry-run', 'IPC', 'Stub', 'MVP 编号'],
      guardrails: [
        '不修改真实扫描、写 index、播放内核链路。',
        '不新增 SQLite、下载器、ASMR.one / DLsite / 网易云元数据抓取、mpv。',
        '不删除、移动、重命名真实媒体文件。',
        '不向 Renderer 暴露 absolutePath。',
        '不向 Renderer 暴露 file://。',
      ],
      hiddenMaintenanceNote:
        'mvp80-settings-diagnostics-daily-finalize：设置页与诊断页日常化收口；工程信息保留在默认折叠维护区。',
    };
  }

  getToneClassName(tone: Mvp80DailyTone): string {
    switch (tone) {
      case 'daily':
        return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-50';
      case 'safe':
        return 'border-sky-500/20 bg-sky-500/10 text-sky-50';
      case 'advanced':
        return 'border-amber-500/20 bg-amber-500/10 text-amber-50';
      case 'blocked':
        return 'border-rose-500/20 bg-rose-500/10 text-rose-50';
      default:
        return 'border-border-color/50 bg-card-bg/35 text-text-secondary';
    }
  }
}

export const settingsDiagnosticsDailyFinalizeService = new SettingsDiagnosticsDailyFinalizeService();
