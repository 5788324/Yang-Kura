import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  FolderOpen, 
  ShieldAlert, 
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Trees,
  Droplet,
  Info,
  Plus,
  Trash2,
  Globe,
  HardDrive,
  Cloud
} from 'lucide-react';
import { ThemeType, LibrarySettings, LibraryPath } from '../types';
import { scannerContractUiFlowService } from '../services';

interface SettingsPageProps {
  settings: LibrarySettings;
  updateSettings: (updates: Partial<LibrarySettings>) => void;
}

export default function SettingsPage({
  settings,
  updateSettings
}: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'paths' | 'about'>('theme');

  // Form states for ASMR paths
  const [newAsmrType, setNewAsmrType] = useState<'local' | 'openlist' | 'webdav'>('local');
  const [newAsmrLabel, setNewAsmrLabel] = useState('');
  const [newAsmrPath, setNewAsmrPath] = useState('');

  // Form states for Pop Music paths
  const [newMusicType, setNewMusicType] = useState<'local' | 'openlist' | 'webdav'>('local');
  const [newMusicLabel, setNewMusicLabel] = useState('');
  const [newMusicPath, setNewMusicPath] = useState('');

  const themes: { id: ThemeType; label: string; icon: any; desc: string; colors: string }[] = [
    { id: 'dark', label: '高雅黑 (Dark)', icon: Moon, desc: '沉浸暗黑色彩，深夜降噪听感加成。', colors: 'border-zinc-800 bg-zinc-950 text-white' },
    { id: 'acrylic-mist', label: '云雾亚克力 (Acrylic)', icon: Sparkles, desc: '浪漫渐变与毛玻璃，极具媒体库氛围。', colors: 'border-indigo-900 bg-gradient-to-br from-slate-900 to-indigo-950 text-indigo-200' },
    { id: 'ocean-drops', label: '微光海洋 (Ocean)', icon: Droplet, desc: '清透深蓝与水滴流光，清新自然。', colors: 'border-cyan-900 bg-gradient-to-br from-sky-950 to-slate-900 text-cyan-200' },
  ];

  const currentThemeObj = themes.find(t => t.id === settings.currentTheme) || themes[0];
  const scannerUiFlow = scannerContractUiFlowService.getFlow();

  const subTabs = [
    { id: 'theme', label: '个性主题', icon: Palette, desc: '界面配色与环境光效' },
    { id: 'paths', label: '存储路径', icon: FolderOpen, desc: '媒体仓库源挂载' },
    { id: 'about', label: '关于与隐私', icon: ShieldAlert, desc: '版本与本地安全说明' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl pb-12">
      
      {/* Header */}
      <div className="border-b border-border-color pb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2.5">
          <Settings className="w-5.5 h-5.5 text-brand-color" />
          <span>系统设置</span>
        </h2>
        <p className="text-xs text-text-muted mt-1">
          配置您的界面偏好、物理音频库挂载路径以及阅读安全隐私条款。
        </p>
      </div>

      {/* Main Grid with Left Navigation & Right Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side Sub-Navigation */}
        <div className="md:col-span-3 space-y-1.5">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left border ${
                  isActive 
                    ? 'bg-brand-color/10 border-brand-color/30 text-brand-color shadow-sm font-bold' 
                    : 'bg-card-bg/20 border-transparent text-text-secondary hover:text-text-primary hover:bg-card-bg/40'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-color' : 'text-text-muted'}`} />
                <div className="min-w-0">
                  <span className="block truncate">{tab.label}</span>
                  <span className="block text-[9px] text-text-muted truncate mt-0.5 font-normal">
                    {tab.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Side Content Area */}
        <div className="md:col-span-9">
          
          {/* TAB 1: 个性主题 */}
          {activeTab === 'theme' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Palette className="w-4.5 h-4.5 text-pink-400" />
                  <h3 className="text-xs font-bold text-text-primary">界面主题外观选择</h3>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  请选择符合您偏好的主题色调。系统会自动适配对应的字体颜色和高对比度显示，确保各类元素完美清晰、不伤眼。
                </p>

                {/* Theme Selector Dropdown */}
                <div className="space-y-4 pt-2">
                  <div className="flex flex-col space-y-1.5 max-w-md">
                    <label className="text-xs text-text-secondary font-medium">选择应用主题</label>
                    <select
                      value={settings.currentTheme}
                      onChange={(e) => updateSettings({ currentTheme: e.target.value as ThemeType })}
                      className="bg-input-bg border border-border-color hover:border-border-color-hover focus:border-brand-color text-text-primary text-xs rounded-lg px-3.5 py-2.5 w-full focus:outline-none transition-all cursor-pointer font-sans"
                    >
                      {themes.map((theme) => (
                        <option key={theme.id} value={theme.id}>
                          {theme.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Theme Preview Card */}
                  <div className="pt-2 max-w-md">
                    <div className={`p-4 rounded-xl border text-left transition-all ${currentThemeObj.colors} flex flex-col justify-between h-28 shadow-sm`}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold">主题效果预览 ({currentThemeObj.label})</span>
                        <currentThemeObj.icon className="w-4 h-4" />
                      </div>
                      <p className="text-[10px] opacity-80 mt-2 leading-relaxed">
                        {currentThemeObj.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 存储路径 */}
          {activeTab === 'paths' && (
            <div className="space-y-5 animate-fade-in">
              

              {/* MVP-07 Scanner Contract UI Flow */}
              <div className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3 border-b border-border-color/30 pb-3">
                  <div className="flex items-start space-x-2.5">
                    <ShieldAlert className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">MVP-07 Scanner Contract UI Flow / 扫描前安全流程</h3>
                      <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
                        这里把未来真实 scanner 的用户操作流提前展示出来。当前仍只保存 Demo 路径文本，不访问真实目录、不写 library-index.json。
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] px-2 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono font-bold whitespace-nowrap">
                    {scannerUiFlow.status}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed font-semibold">
                  <span className="font-mono mr-1">Scanner UI Gate:</span>{scannerUiFlow.gateLabel}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {scannerUiFlow.phases.map((phase) => (
                    <div key={phase.id} className="bg-card-bg/30 border border-border-color/60 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-[11px] font-bold text-text-primary">{phase.title}</h4>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          phase.status === 'current-demo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          phase.status === 'planned' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                          'bg-red-500/10 text-red-300 border border-red-500/20'
                        }`}>
                          {phase.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed">{phase.description}</p>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Allowed</p>
                        {phase.allowedActions.slice(0, 3).map((item) => (
                          <div key={item} className="text-[10px] text-text-secondary leading-relaxed">✓ {item}</div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-wider text-red-300 font-bold">Blocked</p>
                        {phase.blockedActions.slice(0, 3).map((item) => (
                          <div key={item} className="text-[10px] text-red-200/75 leading-relaxed">× {item}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-text-primary">Dry-run 安全限制</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {scannerUiFlow.limits.map((limit) => (
                        <div key={limit.key} className="p-2.5 rounded-lg bg-card-bg/30 border border-border-color/40">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-text-primary">{limit.label}</span>
                            <span className="text-[9px] font-mono text-blue-300">{limit.value}</span>
                          </div>
                          <p className="text-[9px] text-text-muted leading-relaxed mt-1">{limit.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-3">
                    <h4 className="text-[11px] font-bold text-text-primary">扫描前安全确认 Checklist</h4>
                    <div className="space-y-2">
                      {scannerUiFlow.preflightChecklist.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-card-bg/30 border border-border-color/40">
                          <p className="text-[10px] text-text-secondary leading-relaxed">{item.required ? '必选 · ' : ''}{item.label}</p>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-mono whitespace-nowrap ${
                            item.currentState === 'satisfied-by-demo' ? 'bg-emerald-500/10 text-emerald-400' :
                            item.currentState === 'planned-only' ? 'bg-blue-500/10 text-blue-300' :
                            'bg-red-500/10 text-red-300'
                          }`}>
                            {item.currentState}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg/25 border border-border-color/50 rounded-xl p-4 space-y-2">
                  <h4 className="text-[11px] font-bold text-text-primary">用户可见流程</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {scannerUiFlow.userVisibleSteps.map((step, index) => (
                      <div key={step} className="text-[10px] text-text-secondary leading-relaxed bg-card-bg/30 border border-border-color/40 rounded-lg p-2.5">
                        <span className="font-mono text-brand-color mr-1">{index + 1}.</span>{step}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-blue-300 pt-2 font-semibold">下一步：{scannerUiFlow.nextDevelopmentStep}</p>
                </div>
              </div>

              {/* ASMR (RJ) 仓库 */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-color/30 pb-3">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">ASMR (RJ系列) 媒体仓库路径</h3>
                      <p className="text-[10px] text-text-muted mt-0.5">挂载本地音频或挂载 OpenList 网络源以实时对齐元数据。</p>
                    </div>
                  </div>
                </div>

                {/* ASMR Path List */}
                <div className="space-y-2.5">
                  {(settings.asmrPaths || []).map((pathItem) => (
                    <div key={pathItem.id} className="flex items-center justify-between bg-card-bg/20 border border-border-color/60 p-3.5 rounded-xl hover:border-brand-color/30 transition-all">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          {pathItem.type === 'local' ? <HardDrive className="w-4 h-4" /> : pathItem.type === 'openlist' ? <Globe className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-text-primary truncate">{pathItem.label || '未命名仓库'}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              pathItem.type === 'local' ? 'bg-amber-500/15 text-amber-500' :
                              pathItem.type === 'openlist' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-pink-500/15 text-pink-400'
                            }`}>
                              {pathItem.type === 'local' ? '本地路径' : pathItem.type === 'openlist' ? 'OpenList' : 'WebDAV'}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">{pathItem.path}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (settings.asmrPaths || []).filter(p => p.id !== pathItem.id);
                          updateSettings({ asmrPaths: updated });
                        }}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="卸载该仓库"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(settings.asmrPaths || []).length === 0 && (
                    <div className="text-center py-6 text-[11px] text-text-muted">暂无挂载的 ASMR 仓库，请在下方添加</div>
                  )}
                </div>

                {/* Add ASMR Path Form */}
                <div className="bg-card-bg/20 border border-border-color/40 p-4 rounded-xl space-y-3 pt-3">
                  <span className="text-[10px] font-bold text-brand-color uppercase tracking-wider block">添加新 ASMR 挂载源</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">挂载源类型</label>
                      <select
                        value={newAsmrType}
                        onChange={(e) => setNewAsmrType(e.target.value as any)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer"
                      >
                        <option value="local">📁 本地物理文件夹 (Local Folder)</option>
                        <option value="openlist">🌐 OpenList 共享网络列表 (JSON URL)</option>
                        <option value="webdav">☁️ WebDAV / 网盘 (Cloud Storage)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">仓库别名 / 自定义标签</label>
                      <input
                        type="text"
                        placeholder="例如：我的主ASMR文件夹"
                        value={newAsmrLabel}
                        onChange={(e) => setNewAsmrLabel(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">物理路径或网络URL</label>
                      <input
                        type="text"
                        placeholder={newAsmrType === 'local' ? '如：D:/ASMR/RJ库' : newAsmrType === 'openlist' ? '如：https://api.myjson.com/asmr.json' : '如：https://dav.jianguoyun.com/dav/asmr'}
                        value={newAsmrPath}
                        onChange={(e) => setNewAsmrPath(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!newAsmrPath.trim()) {
                          alert('请输入路径或 URL！');
                          return;
                        }
                        const label = newAsmrLabel.trim() || (newAsmrType === 'local' ? '本地 ASMR 仓库' : newAsmrType === 'openlist' ? 'OpenList网络源' : 'WebDAV网盘源');
                        const newPath: LibraryPath = {
                          id: 'asmr-' + Date.now().toString(),
                          type: newAsmrType,
                          path: newAsmrPath.trim(),
                          label
                        };
                        updateSettings({ asmrPaths: [...(settings.asmrPaths || []), newPath] });
                        setNewAsmrLabel('');
                        setNewAsmrPath('');
                      }}
                      className="flex items-center space-x-1.5 px-4.5 py-2 rounded-lg bg-brand-color text-white text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow shadow-brand-color/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>保存 Demo 路径</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Pop Music 仓库 */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-border-color/30 pb-3">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-emerald-400" />
                    <div>
                      <h3 className="text-xs font-bold text-text-primary">流行音乐媒体仓库路径</h3>
                      <p className="text-[10px] text-text-muted mt-0.5">流行音乐媒体库同样支持挂载本地音频、WebDAV 或公开共享歌单。</p>
                    </div>
                  </div>
                </div>

                {/* Music Path List */}
                <div className="space-y-2.5">
                  {(settings.musicPaths || []).map((pathItem) => (
                    <div key={pathItem.id} className="flex items-center justify-between bg-card-bg/20 border border-border-color/60 p-3.5 rounded-xl hover:border-brand-color/30 transition-all">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          {pathItem.type === 'local' ? <HardDrive className="w-4 h-4" /> : pathItem.type === 'openlist' ? <Globe className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-text-primary truncate">{pathItem.label || '未命名仓库'}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              pathItem.type === 'local' ? 'bg-amber-500/15 text-amber-500' :
                              pathItem.type === 'openlist' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-pink-500/15 text-pink-400'
                            }`}>
                              {pathItem.type === 'local' ? '本地路径' : pathItem.type === 'openlist' ? 'OpenList' : 'WebDAV'}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-muted font-mono truncate mt-0.5">{pathItem.path}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updated = (settings.musicPaths || []).filter(p => p.id !== pathItem.id);
                          updateSettings({ musicPaths: updated });
                        }}
                        className="p-1.5 rounded-lg text-text-secondary hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="卸载该仓库"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(settings.musicPaths || []).length === 0 && (
                    <div className="text-center py-6 text-[11px] text-text-muted">暂无挂载的流行音乐仓库，请在下方添加</div>
                  )}
                </div>

                {/* Add Music Path Form */}
                <div className="bg-card-bg/20 border border-border-color/40 p-4 rounded-xl space-y-3 pt-3">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">添加新流行音乐源</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">挂载源类型</label>
                      <select
                        value={newMusicType}
                        onChange={(e) => setNewMusicType(e.target.value as any)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary cursor-pointer"
                      >
                        <option value="local">📁 本地物理文件夹 (Local Folder)</option>
                        <option value="openlist">🌐 OpenList 共享网络列表 (JSON URL)</option>
                        <option value="webdav">☁️ WebDAV / 网盘 (Cloud Storage)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">仓库别名 / 自定义标签</label>
                      <input
                        type="text"
                        placeholder="placeholder"
                        value={newMusicLabel}
                        onChange={(e) => setNewMusicLabel(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-text-secondary font-medium">物理路径或网络URL</label>
                      <input
                        type="text"
                        placeholder={newMusicType === 'local' ? '如：C:/Users/Admin/Music' : newMusicType === 'openlist' ? '如：https://openlist.net/pop.json' : '如：https://dav.jianguoyun.com/dav/pop_music'}
                        value={newMusicPath}
                        onChange={(e) => setNewMusicPath(e.target.value)}
                        className="w-full bg-input-bg border border-border-color focus:border-brand-color focus:outline-none rounded-lg px-2.5 py-2 text-xs text-text-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        if (!newMusicPath.trim()) {
                          alert('请输入路径或 URL！');
                          return;
                        }
                        const label = newMusicLabel.trim() || (newMusicType === 'local' ? '本地音乐仓库' : newMusicType === 'openlist' ? 'OpenList网络源' : 'WebDAV网盘源');
                        const newPath: LibraryPath = {
                          id: 'music-' + Date.now().toString(),
                          type: newMusicType,
                          path: newMusicPath.trim(),
                          label
                        };
                        updateSettings({ musicPaths: [...(settings.musicPaths || []), newPath] });
                        setNewMusicLabel('');
                        setNewMusicPath('');
                      }}
                      className="flex items-center space-x-1.5 px-4.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:scale-102 transition-all cursor-pointer shadow shadow-emerald-600/10"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>保存 Demo 路径</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 关于与隐私 */}
          {activeTab === 'about' && (
            <div className="space-y-5 animate-fade-in">
              {/* About Product */}
              <div className="bg-card-bg/40 border border-border-color p-5 rounded-2xl space-y-4">
                <div className="flex items-center space-x-2">
                  <Info className="w-4.5 h-4.5 text-blue-400" />
                  <h3 className="text-xs font-bold text-text-primary">关于本品</h3>
                </div>
                
                <div className="space-y-2.5 text-xs leading-relaxed text-text-secondary">
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">产品名称</span>
                    <span className="font-mono text-brand-color font-semibold">Yang-Kura Next Windows Desktop Client</span>
                  </div>
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">程序版本</span>
                    <span className="font-mono text-text-primary font-semibold">v2.4.0-desktop-beta</span>
                  </div>
                  <div className="flex justify-between items-center bg-card-bg/30 p-3 rounded-lg border border-border-color/40">
                    <span className="font-bold text-text-primary">内核底层</span>
                    <span className="font-mono text-text-primary">React/Vite UI Prototype · No SQLite / No WASAPI</span>
                  </div>
                  <p className="text-text-muted text-[11px] mt-2">
                    Yang-Kura Next 当前是 React/Vite UI 原型，用于确认本地音频媒体库的产品结构。当前不访问真实磁盘、不读取音频、不写 SQLite。
                  </p>
                </div>
              </div>

              {/* Privacy Card */}
              <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2">
                  <EyeOff className="w-4.5 h-4.5 text-emerald-400 flex-shrink-0" />
                  <h3 className="text-xs font-bold text-emerald-400">本地极致隐私安全保护说明</h3>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p className="text-text-secondary leading-relaxed">
                    Yang-Kura 的核心设计初衷是提供一个绝对安全的独立声音角落，我们承诺并支持以下隐私保护规则：
                  </p>
                  <ul className="list-disc pl-4 space-y-2.5 text-[11px] text-text-muted leading-relaxed pt-1.5">
                    <li><strong>不上传任何音频</strong>：当前原型不会读取或上传任何 ASMR/RJ 与本地音乐文件；后续 Electron 阶段也将保持本地优先。</li>
                    <li><strong>元数据本地持久化</strong>：当前数据仅为 mockData + localStorage；MVP 后续计划使用 library-index.json，SQLite 后置。</li>
                    <li><strong>纯净无广告，不索取高危权限</strong>：无在线听歌习惯数据收集，无后台 telemetry 传输。</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
