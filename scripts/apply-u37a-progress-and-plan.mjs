#!/usr/bin/env node
import fs from 'node:fs';

function replaceRequired(file, before, after) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes(before)) throw new Error(`${file} missing expected source block: ${before.slice(0, 100)}`);
  fs.writeFileSync(file, source.replace(before, after), 'utf8');
}

replaceRequired(
  'src/app/AppRouter.tsx',
  "resetKey={`asmr-detail:${selectedAsmrWork.id}:${selectedAsmrWork.updatedAt ?? ''}`}",
  "resetKey={`asmr-detail:${selectedAsmrWork.id}:${selectedAsmrWork.addedAt ?? ''}`}",
);

replaceRequired(
  'PROJECT_STATE.md',
  `U36-C：Main IPC 分域注册完成\n当前阶段：U37 首页、资源库与详情 UI`,
  `U36-C：Main IPC 分域注册完成\nU37-A：资源库页面状态与错误恢复完成\n当前阶段：U37-B 首页与音声库列表 UI`,
);

replaceRequired(
  'PROJECT_STATE.md',
  `### U37：资源库与详情 UI\n\n- 首页、音声库、RJ 详情、音乐库、专辑/艺术家详情。\n- 多选、批量操作、高级筛选、空状态和错误恢复。\n- 同步拆分被页面触碰的资源库、元数据和 Provider 模块。`,
  `### U37：资源库与详情 UI — 当前阶段\n\n#### U37-A：页面状态与错误恢复 — 已完成\n\n- 新增 \`LibraryPageState\`，统一首页、音声库和音乐库的未连接、空资源库和正常内容状态。\n- 新增 \`LibraryRouteBoundary\`，限制页面渲染异常并提供原地重试。\n- AppRouter 为首页、音声库、RJ 详情和音乐库建立页面级边界。\n- 无效 RJ 详情 ID 显示明确恢复入口。\n\n#### U37-B：首页与音声库列表 — 当前任务\n\n- 整理首页继续播放、最近加入和常用入口。\n- 迁移音声库筛选工具栏、结果摘要、MediaCard/TrackRow。\n- 增加作品多选、全选当前结果和批量加入歌单。\n- 保留大库搜索索引和渲染窗口。\n\n#### U37-C / U37-D：后续\n\n- U37-C：RJ 详情、音轨列表、元数据和字幕状态。\n- U37-D：音乐库、专辑/艺术家/文件夹详情与 U37 全矩阵验收。\n- 详细范围见 \`docs/architecture/U37_EXECUTION_PLAN.md\`。`,
);

replaceRequired(
  'PROJECT_STATE.md',
  `1. 推进 U37 首页、资源库与详情页面级 UI 迁移。`,
  `1. 完成 U37-B 首页与音声库列表 UI。`,
);

replaceRequired(
  'PROJECT_ROADMAP.md',
  `### U36：App Shell、状态与 IPC 契约`,
  `### U36：App Shell、状态与 IPC 契约 — 已完成`,
);

replaceRequired(
  'PROJECT_ROADMAP.md',
  `### U37：资源库与详情纵向迁移\n\n页面：\n\n- 首页与首次启动；\n- 音声库；\n- RJ 详情；\n- 音乐库；\n- 专辑与艺术家详情；\n- 全局搜索结果。\n\n能力：\n\n- 多选和批量操作；\n- 播放/字幕/文件健康筛选；\n- 元数据编辑；\n- DLsite 字段比较与选择性应用；\n- Index 空、损坏、恢复和新增文件提示。\n\n同步整理：LibraryRepository、Index Reader/Writer、Metadata、Provider 和页面状态边界。`,
  `### U37：资源库与详情纵向迁移 — 当前阶段\n\n详细执行计划：\`docs/architecture/U37_EXECUTION_PLAN.md\`。\n\n- **U37-A（完成）**：页面状态、空资源库、无效详情选择和渲染错误恢复。\n- **U37-B（当前）**：首页、音声库列表、筛选工具栏、MediaCard/TrackRow、多选与低风险批量操作。\n- **U37-C**：RJ 详情、音轨列表、元数据编辑、DLsite 字段选择性应用和字幕状态。\n- **U37-D**：音乐库、专辑/艺术家/文件夹详情、批量加入队列/收藏和 U37 全矩阵验收。\n\n同步整理：LibraryRepository、Index Reader/Writer、Metadata、Provider 和页面状态边界。`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',`,
  `  'docs/architecture/U36C_MAIN_IPC_DOMAINS.md',\n  'docs/architecture/U37_EXECUTION_PLAN.md',`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U37 首页、资源库与详情 UI'],`,
  `  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', 'U37-A：完成'],\n  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '当前任务：U37-B 首页与音声库列表 UI'],`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 5. 当前任务：U37'],`,
  `  ['AI_HANDOFF/CURRENT_PROJECT_HANDOFF.md', '## 5. 当前任务：U37-B'],`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  ['AI_HANDOFF/WORKLOG.md', '当前任务：U37'],`,
  `  ['AI_HANDOFF/WORKLOG.md', '### U37-A'],\n  ['AI_HANDOFF/WORKLOG.md', '当前任务：U37-B'],`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  ['PROJECT_STATE.md', '当前阶段：U37 首页、资源库与详情 UI'],`,
  `  ['PROJECT_STATE.md', 'U37-A：资源库页面状态与错误恢复完成'],\n  ['PROJECT_STATE.md', '当前阶段：U37-B 首页与音声库列表 UI'],`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'registerInvokeHandler'],`,
  `  ['docs/architecture/U36C_MAIN_IPC_DOMAINS.md', 'registerInvokeHandler'],\n  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-A：页面状态与错误恢复'],\n  ['docs/architecture/U37_EXECUTION_PLAN.md', 'U37-D：音乐库、专辑与艺术家详情'],`,
);

replaceRequired(
  'scripts/verify-handoff.mjs',
  `console.log('[verify-handoff] U36-C complete and U37 handoff PASS');`,
  `console.log('[verify-handoff] U37-A complete and U37-B handoff PASS');`,
);

console.log('U37-A progress, roadmap and verifier updates applied');
