import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const write = (path, value) => fs.writeFileSync(path, value, 'utf8');
const replaceOnce = (source, from, to, label) => {
  const count = source.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one target, found ${count}`);
  return source.replace(from, to);
};

const settingsPath = 'src/components/SettingsPage.tsx';
let settings = read(settingsPath);

settings = replaceOnce(
  settings,
  '  const [showAdvancedLibraryTools, setShowAdvancedLibraryTools] = useState(false);',
  '  const [showAdvancedLibraryTools, setShowAdvancedLibraryTools] = useState(false);\n  const [showLibraryMaintenance, setShowLibraryMaintenance] = useState(false);',
  'add U26 visibility state',
);

const healthOpening = '                <div id="mvp127-library-index-health-management" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">';
const toggleCard = `                <div id="u26-settings-ai-library-maintenance" className="rounded-2xl border border-amber-500/20 bg-card-bg/35 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-300">AI 维护</p>
                      <h3 className="mt-1 text-xs font-bold text-text-primary">资源库检修</h3>
                      <p className="mt-1 text-[10px] leading-relaxed text-text-muted">缺失检查、索引清理、备份恢复和扫描预览默认隐藏，日常无需展开。</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLibraryMaintenance((value) => !value)}
                      aria-expanded={showLibraryMaintenance}
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-100 transition-colors hover:bg-amber-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/60"
                    >
                      {showLibraryMaintenance ? "收起检修工具" : "展开检修工具"}
                    </button>
                  </div>
                </div>

${healthOpening}`;
settings = replaceOnce(settings, healthOpening, toggleCard, 'insert U26 toggle card');

settings = replaceOnce(
  settings,
  healthOpening,
  '                <div id="mvp127-library-index-health-management" hidden={!showLibraryMaintenance} aria-hidden={!showLibraryMaintenance} className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">',
  'gate index health maintenance',
);

settings = replaceOnce(
  settings,
  '              <div id="mvp39-advanced-library-tools" className="rounded-2xl border border-border-color/60 bg-card-bg/45 p-4 space-y-3">',
  '              <div id="mvp39-advanced-library-tools" hidden={!showLibraryMaintenance} aria-hidden={!showLibraryMaintenance} className="rounded-2xl border border-border-color/60 bg-card-bg/45 p-4 space-y-3">',
  'gate advanced library tools',
);

settings = replaceOnce(
  settings,
  '              <div id="mvp54-settings-regression-path" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">',
  '              <div id="mvp54-settings-regression-path" hidden aria-hidden="true" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">',
  'hide MVP54 regression card',
);

write(settingsPath, settings);

const statePath = 'PROJECT_STATE.md';
let state = read(statePath);
state = replaceOnce(
  state,
  '结构、质量与日常 UI 增量：U09～U25 已合入',
  '结构、质量与日常 UI 增量：U09～U26 已合入',
  'advance project state range',
);
state = replaceOnce(
  state,
  '## 项目级 UI 硬规则（长期有效）',
  `### U26（已完成）：资源库检修安全收口

- 从干净 main 重做，放弃跨条件块包裹大段 JSX 的高风险方案；
- 新增独立 showLibraryMaintenance 开关，只控制现有 mvp127 与 mvp39 顶层区域的 hidden；
- 目录选择、上次资源库、读取已有记录、一键扫描和路径管理继续默认可见；
- 缺失检查、受控清理、备份恢复、维护历史和高级预览默认进入 AI 维护；
- MVP54 历史回归卡固定为隐藏兼容标记，底层处理函数与路由均未删除；
- 详细边界见 docs/U26_SAFE_LIBRARY_MAINTENANCE.md。

## 项目级 UI 硬规则（长期有效）`,
  'record U26 project state',
);
write(statePath, state);

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = read(roadmapPath);
roadmap = replaceOnce(
  roadmap,
  'U09～U25：结构、质量与日常 UI 收口已合入',
  'U09～U26：结构、质量与日常 UI 收口已合入',
  'advance roadmap range',
);
roadmap = replaceOnce(
  roadmap,
  '### 长期 UI 硬规则',
  `### U26：资源库检修安全收口（已完成）

- 使用独立布尔开关和顶层 hidden 控制维护区可见性；
- 不移动 mvp127 / mvp128 / mvp129 / mvp39，不创建跨越条件块的新父容器；
- 日常保留目录选择、读取、一键扫描和路径管理；
- 缺失检查、索引清理、备份恢复、维护历史与高级预览默认隐藏；
- 完整功能和 UI 合同由 U02～U26 verifier、稳定回归与生产构建复验。

### 长期 UI 硬规则`,
  'record U26 roadmap',
);
write(roadmapPath, roadmap);

for (const [path, marker] of [
  [settingsPath, 'hidden={!showLibraryMaintenance}'],
  [statePath, 'U09～U26'],
  [roadmapPath, 'U09～U26'],
]) {
  if (!read(path).includes(marker)) throw new Error(`${path}: missing post-patch marker ${marker}`);
}

console.log('U26 safe library maintenance patch applied');
