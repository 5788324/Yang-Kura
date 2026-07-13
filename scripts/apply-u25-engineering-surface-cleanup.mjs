import fs from 'node:fs';

const replaceOnce = (text, from, to, label) => {
  const count = text.split(from).length - 1;
  if (count !== 1) throw new Error(`${label}: expected one target, found ${count}`);
  return text.replace(from, to);
};

const hideOpeningTagById = (text, id) => {
  const pattern = new RegExp(`<section id="${id}"([^>]*)>`);
  const matches = text.match(new RegExp(pattern.source, 'g')) ?? [];
  if (matches.length !== 1) {
    throw new Error(`${id}: expected exactly one section, found ${matches.length}`);
  }
  return text.replace(pattern, (opening, rest) => {
    if (/\shidden(?:\s|>|=)/.test(opening) && /aria-hidden="true"/.test(opening)) return opening;
    return `<section id="${id}" hidden aria-hidden="true"${rest}>`;
  });
};

const hideMaintenancePrefixSections = (text) => {
  const prefixPattern = /<section id="(mvp(?:54|55|60|61|62|63|64|66|67|68|69|70)-[^"]+)"([^>]*)>/g;
  let count = 0;
  const next = text.replace(prefixPattern, (opening, id, rest) => {
    count += 1;
    if (/\shidden(?:\s|>|=)/.test(opening) && /aria-hidden="true"/.test(opening)) return opening;
    return `<section id="${id}" hidden aria-hidden="true"${rest}>`;
  });
  if (count < 8) throw new Error(`expected maintenance history sections, found only ${count}`);
  return next;
};

const dashboardPath = 'src/components/Dashboard.tsx';
let dashboard = fs.readFileSync(dashboardPath, 'utf8');
dashboard = hideOpeningTagById(dashboard, 'mvp71-home-user-facing-simplification');
fs.writeFileSync(dashboardPath, dashboard);

const settingsPath = 'src/components/SettingsPage.tsx';
let settings = fs.readFileSync(settingsPath, 'utf8');
for (const id of [
  'mvp124-mpv-stability-diagnostics',
  'mvp125-player-acceptance-checklist',
  'mvp123-mpv-windows-sample-check',
  'mvp44-settings-daily-flow',
  'mvp58-settings-personal-workflow',
  'mvp71-settings-user-facing-simplification',
  'mvp80-settings-daily-finalize',
  'mvp110-settings-daily-language',
  'mvp111-github-baseline-sync',
]) {
  settings = hideOpeningTagById(settings, id);
}
settings = hideMaintenancePrefixSections(settings);

const scannerMarker = '              {/* MVP-07 Scanner Contract UI Flow */}\n              <div className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">';
const scannerReplacement = '              {/* MVP-07 Scanner Contract UI Flow */}\n              <div hidden aria-hidden="true" className="bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl space-y-4">';
settings = replaceOnce(settings, scannerMarker, scannerReplacement, 'scanner contract block');
fs.writeFileSync(settingsPath, settings);

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');
state = replaceOnce(state, '结构与质量增量：U09～U24 已合入', '结构、质量与日常 UI 增量：U09～U25 已合入', 'state U25 status');
state = replaceOnce(
  state,
  '\n## 当前阶段\n',
  `\n### U25（已完成）：工程窗口与历史验收卡清理\n\n- 首页历史“日常使用说明”卡改为隐藏兼容标记，不再占据日常首页；\n- 设置页的播放稳定性诊断、命令行快检、Scanner 合同和 Beta/RC/交接记录默认隐藏；\n- 主题、播放偏好、mpv 选择、资源库目录、扫描、索引操作与隐私说明继续保留；\n- 历史 verifier ID 与服务输出继续存在，但通过 hidden / aria-hidden 退出产品视觉层。\n\n## 项目级 UI 硬规则（长期有效）\n\n> 日常层只展示用户实际会使用的功能；诊断、回归、工程状态、测试入口、命令行说明、MVP/版本收口信息和检修工具统一进入 AI 维护或隐藏兼容层，不得长期污染主界面。\n\n- 该规则不随 U24/U25 结束而失效，后续所有 UI 任务必须遵守；\n- 有排障价值的底层能力可以保留，但默认不得成为日常卡片、窗口或一级入口；\n- verifier 需要历史锚点时，必须使用 hidden 与 aria-hidden，不得重新显示给普通用户；\n- 新增 UI 无法明确回答“用户日常是否会直接操作”时，默认进入 AI 维护。\n- 详细规则见 docs/UI_DAILY_SURFACE_RULES.md。\n\n## 当前阶段\n`,
  'state U25 section',
);
fs.writeFileSync(statePath, state);

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');
roadmap = replaceOnce(roadmap, 'U09～U24：结构、质量与日常 UI 收口已合入', 'U09～U25：结构、质量与日常 UI 收口已合入', 'roadmap U25 status');
roadmap = replaceOnce(
  roadmap,
  '\n### 当前验收顺序\n',
  `\n### U25：工程窗口与历史验收卡清理（已完成）\n\n- 首页不再显示用于解释“日常首页”的历史开发卡；\n- 设置页不再显示稳定性诊断、命令行快检、Scanner 合同和 Beta/RC/交接面板；\n- 用户真实操作能力继续保留，历史测试锚点转为隐藏兼容层；\n- 建立 docs/UI_DAILY_SURFACE_RULES.md 作为长期 UI 硬规则。\n\n### 长期 UI 硬规则\n\n日常层只展示用户实际会使用的功能。诊断、回归、工程状态、测试入口、命令行说明和版本收口信息必须进入 AI 维护或隐藏兼容层，不得长期污染主界面。\n\n### 当前验收顺序\n`,
  'roadmap U25 section',
);
roadmap = replaceOnce(
  roadmap,
  '3. 工程和检修功能可以保留，但默认不得干扰日常使用观感。',
  '3. 工程和检修功能可以保留，但诊断、回归、工程状态、测试入口和版本收口信息必须进入 AI 维护或隐藏兼容层，默认不得出现在日常界面。',
  'roadmap UI principle',
);
fs.writeFileSync(roadmapPath, roadmap);

console.log('U25 engineering surface cleanup patch applied');
