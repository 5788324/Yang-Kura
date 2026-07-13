import fs from 'node:fs';

function replaceOnce(source, before, after, label) {
  if (!source.includes(before)) {
    throw new Error(`missing replacement anchor: ${label}`);
  }
  return source.replace(before, after);
}

function replacePattern(source, pattern, after, label) {
  if (!pattern.test(source)) {
    throw new Error(`missing pattern anchor: ${label}`);
  }
  return source.replace(pattern, after);
}

const statePath = 'PROJECT_STATE.md';
let state = fs.readFileSync(statePath, 'utf8');

state = replaceOnce(
  state,
  `产品化增量：U02～U08 已合入\n结构、质量与日常 UI 增量：U09～U26 已合入\n当前任务：Windows GUI 日常界面验收与定向修复`,
  `产品化增量：U02～U08 已合入\n结构、质量与日常 UI 增量：U09～U26 已合入\nWindows GUI 验收：U27 已完成，结论 CONDITIONAL GO\n当前任务：U28 原生目录选择与真实媒体闭环补测`,
  'PROJECT_STATE current status',
);

if (!state.includes('## U27 Windows GUI 实机验收（已完成）')) {
  const u27Section = `## U27 Windows GUI 实机验收（已完成）\n\n- 结论：\`CONDITIONAL GO\`。\n- 自动门禁、Electron strict smoke、生产构建和 portable 打包通过。\n- 干净首次启动、空库、AI 维护默认折叠、三主题、常规/最大化窗口和进程回收通过。\n- 0 Blocker、0 Major、1 Minor、2 Observation。\n- MIN-001：导入器未选择来源时仍显示“4 个示例文件”，需在真实导入后复核是否误导。\n- 原生目录选择器无法由当前自动化接口操作，因此扫描、真实播放/Seek、字幕和 copy/move 导入保持 NOT TESTED。\n- 用户原配置已恢复，Git 工作区 clean，无 Yang Kura / Electron / mpv 残留进程。\n- 详细记录见 \`docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md\`。\n\n`;
  state = state.replace('## 当前阶段\n', `${u27Section}## 当前阶段\n`);
}

state = replaceOnce(
  state,
  `产品质量收口\n→ PlayerBar 结构优化已完成\n→ 日常界面去工程化已完成\n→ Windows GUI 用户流程验收\n→ 定向缺陷修复\n→ 重新打包形成新 Beta 基线`,
  `产品质量收口\n→ PlayerBar 结构优化已完成\n→ 日常界面去工程化已完成\n→ U27 Windows GUI 基线验收已完成（CONDITIONAL GO）\n→ U28 原生目录选择与真实媒体闭环补测\n→ U29～U31 定向实机验收与修复\n→ U32～U33 发布候选与新 Beta 收口`,
  'PROJECT_STATE stage chain',
);

state = replaceOnce(
  state,
  '禁止为了代码整齐进行全项目重构。下一步只根据 Windows 实机结果修复明确缺陷。',
  '禁止为了代码整齐进行全项目重构。U28 先补齐 U27 未测试的原生目录选择、扫描、播放、字幕、导入和重启恢复；发现问题先记录，另开定向修复分支。',
  'PROJECT_STATE stage rule',
);

state = replacePattern(
  state,
  /## 仍需完成\n\n[\s\S]*?\n## 长期观察与冻结项/,
  `## 仍需完成\n\n1. U28：人工原生目录授权、ASMR/音乐扫描、Index 写入读取和重启恢复。\n2. U28：真实 HTMLAudio/mpv、Seek、队列和 LRC/SRT/VTT/ASS 字幕补测。\n3. U28：临时副本上的 copy-only / move-only 导入与 MIN-001 复核。\n4. U29～U31：根据真实媒体流程继续播放器、UI、窗口和数据安全验收。\n5. U32：strict smoke、mpv acceptance、portable、NSIS、安装升级卸载和残留进程。\n6. U33：版本号、Release Notes、tag、产物 SHA-256 和新 Beta 发布收口。\n\n## 长期观察与冻结项`,
  'PROJECT_STATE remaining work',
);

fs.writeFileSync(statePath, state, 'utf8');

const roadmapPath = 'PROJECT_ROADMAP.md';
let roadmap = fs.readFileSync(roadmapPath, 'utf8');

roadmap = replaceOnce(
  roadmap,
  `当前阶段：Windows GUI 实机验收与定向修复\n当前下一轮：U27 Windows GUI 验收基线`,
  `U27 Windows GUI 验收：已完成，结论 CONDITIONAL GO\n当前阶段：U28 原生目录选择与真实媒体闭环补测\n当前下一轮：U28 Windows 原生目录授权、扫描、播放、字幕与导入`,
  'PROJECT_ROADMAP current stage',
);

roadmap = replaceOnce(
  roadmap,
  `### U27：Windows GUI 验收基线\n\n**预计：1 轮。原则上不开发新功能。**`,
  `### U27：Windows GUI 验收基线（已完成）\n\n**预计：1 轮。原则上不开发新功能。**\n\n**实机结果：CONDITIONAL GO。** 0 Blocker、0 Major、1 Minor、2 Observation；自动门禁、strict smoke、portable、空库 UI、三主题和进程回收通过。原生目录选择器受自动化限制，扫描、真实播放/Seek、字幕和导入保持 NOT TESTED，转入 U28 人工补测。详细结果见 \`docs/U27_WINDOWS_GUI_ACCEPTANCE_RESULT.md\`。`,
  'PROJECT_ROADMAP U27 heading',
);

roadmap = replacePattern(
  roadmap,
  /### U28：首次启动与资源库全流程\n\n[\s\S]*?\n### U29：播放器与字幕全流程/,
  `### U28：原生目录选择与真实媒体闭环（当前）\n\n**预计：1 轮。原则上不开发新功能。**\n\nU28 是 U27 \`CONDITIONAL GO\` 的补充实机轮，第一道门是通过 Windows 原生目录选择器人工授权仓库外临时样本。不得用脚本、配置文件或开发者工具注入绝对路径绕过 GUI。\n\n必须完成：\n\n1. 人工选择临时 ASMR 与音乐目录。\n2. 扫描、写入、备份、读取并应用 Local JSON Index。\n3. 音声库和音乐库显示真实临时媒体。\n4. HTMLAudio 真实播放、点击/拖拽/长音频 Seek、队列与续播。\n5. mpv 可用时执行 Windows acceptance、fallback 和进程回收；不可用则明确 NOT TESTED。\n6. LRC、SRT、VTT、ASS 与无字幕状态。\n7. copy-only 临时样本完整闭环。\n8. move-only 仅使用独立临时副本，验证二次确认、不覆盖、不清理源目录和 OperationLog。\n9. 重启后的资源库、播放历史和字幕关联恢复。\n10. 1040×680、小窗口、DPI 和完整键盘流程尽可能补测。\n11. 复核 MIN-001：导入器未选来源时“4 个示例文件”是否仍可能被理解为当前识别结果。\n\n用户只在原生目录对话框中完成目录选择，Codex 继续执行其余 GUI 操作、检查和报告。详细任务见 \`docs/U28_NATIVE_LIBRARY_WORKFLOW_TASK.md\`。\n\n### U29：播放器与字幕全流程`,
  'PROJECT_ROADMAP U28 section',
);

roadmap = replacePattern(
  roadmap,
  /## 6\. 当前 Beta 剩余轮次预算\n\n[\s\S]*?\nU33 完成前不启动/,
  `## 6. 当前 Beta 剩余轮次预算\n\nU27 已完成。剩余预算更新为：\n\n| 情况 | 预计轮数 |\n|---|---:|\n| 理想：U28 补测通过且未发现明显问题 | 6 轮 |\n| 常规：播放器/UI/导入器各有一轮定向修复 | 7～9 轮 |\n| 较差：真实资源、安装或长音频暴露较大问题 | 10～13 轮 |\n\n正式计划按 **8 轮** 预留：\n\n\`\`\`text\nU28 原生媒体闭环 1\n+ 播放与字幕 2\n+ UI 主题 1\n+ 导入与数据安全 1\n+ 安装发布 1\n+ 缺陷缓冲 1\n+ 最终发布 1\n= 8 轮\n\`\`\`\n\nU33 完成前不启动`,
  'PROJECT_ROADMAP remaining budget',
);

fs.writeFileSync(roadmapPath, roadmap, 'utf8');

for (const path of [
  '.github/workflows/u28-apply-project-state.yml',
  'scripts/apply-u27-closeout-u28-state.mjs',
]) {
  if (fs.existsSync(path)) fs.unlinkSync(path);
}

console.log('U27 closeout and U28 project state applied');
