import fs from 'node:fs';

const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one target, found ${count}`);
  return text.replace(from, to);
};

const replaceRegexOnce = (text, pattern, replacement, label) => {
  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`))];
  if (matches.length !== 1) throw new Error(`${label}: expected one target, found ${matches.length}`);
  return text.replace(pattern, replacement);
};

const settingsPath = 'src/components/SettingsPage.tsx';
let settings = fs.readFileSync(settingsPath, 'utf8');

const healthOpening = '                <div id="mvp127-library-index-health-management" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">';
const maintenanceOpening = `                <details id="u26-settings-ai-library-maintenance" className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                  <summary className="cursor-pointer list-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-color/60">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold text-amber-200 tracking-wider">AI 维护</p>
                        <h3 className="mt-1 text-xs font-bold text-text-primary">资源库检修</h3>
                        <p className="mt-1 text-[10px] text-text-muted leading-relaxed">缺失检查、索引清理、备份恢复和扫描预览集中在这里，日常无需展开。</p>
                      </div>
                      <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-100 whitespace-nowrap">默认折叠</span>
                    </div>
                  </summary>
                  <div id="u26-settings-ai-library-maintenance-panel" className="mt-4 space-y-5">
${healthOpening}`;
settings = replaceOnce(settings, healthOpening, maintenanceOpening, 'U26 maintenance opening');

settings = replaceRegexOnce(
  settings,
  /              \)\}\r?\n\r?\n              \{\/\* ASMR \(RJ\) 仓库 \*\/\}/,
  `              )}
                  </div>
                </details>

              {/* ASMR (RJ) 仓库 */}`,
  'U26 maintenance closing',
);

const regressionOpening = '              <div id="mvp54-settings-regression-path" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">';
const regressionHidden = '              <div id="mvp54-settings-regression-path" hidden aria-hidden="true" className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">';
settings = replaceOnce(settings, regressionOpening, regressionHidden, 'MVP54 hidden compatibility');
fs.writeFileSync(settingsPath, settings);

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = replaceOnce(state, '结构、质量与日常 UI 增量：U09～U25 已合入', '结构、质量与日常 UI 增量：U09～U26 已合入', 'state U26 status');
state = replaceRegexOnce(
  state,
  /\r?\n## 项目级 UI 硬规则（长期有效）/,
  `
### U26（已完成）：资源库检修集中到 AI 维护

- 资源库设置页新增默认折叠的“AI 维护 · 资源库检修”；
- 缺失文件检查、受控索引清理、备份恢复、维护历史和高级扫描预览统一进入该区域；
- 目录选择、上次资源库、读取已有记录、一键扫描并应用和路径管理继续默认可见；
- MVP127～129、MVP39 处理函数与测试合同完整保留，MVP54 历史回归卡改为隐藏兼容标记；
- 详细边界见 docs/U26_AI_LIBRARY_MAINTENANCE.md。

## 项目级 UI 硬规则（长期有效）`,
  'state U26 section',
);
fs.writeFileSync(statePath, state);

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = replaceOnce(roadmap, 'U09～U25：结构、质量与日常 UI 收口已合入', 'U09～U26：结构、质量与日常 UI 收口已合入', 'roadmap U26 status');
roadmap = replaceRegexOnce(
  roadmap,
  /\r?\n### 长期 UI 硬规则/,
  `
### U26：资源库检修集中到 AI 维护（已完成）

- 普通资源库设置只保留目录、记录读取、快速扫描和路径管理；
- 缺失检查、索引清理、备份恢复、维护历史和高级预览进入默认折叠的 AI 维护区；
- 所有底层处理函数和历史合同继续保留，不删除检修能力；
- 资源库设置分层正式写入长期 UI 硬规则。

### 长期 UI 硬规则`,
  'roadmap U26 section',
);
fs.writeFileSync(roadmapPath, roadmap);

console.log('U26 AI library maintenance patch applied');
