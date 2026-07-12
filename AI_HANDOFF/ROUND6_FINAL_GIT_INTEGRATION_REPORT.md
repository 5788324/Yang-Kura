# Yang-Kura Round 6 最终 Git 合入报告

## 1. 候选包

* 文件名：yang-kura-mvp129-stabilized-clean-candidate-source.zip
* SHA-256：d64b0cc9d2a30399d94917476ef8dc7ea80e9f99fa8419f1a0746ef703d1fced
* 版本：0.167.0-mvp129
* 是否匹配：是
* MVP130 是否保持独立：是（仅 MVP130_EXPERIMENTAL_DO_NOT_MERGE.md 标记文件，无下载器源码）

## 2. 临时目录验证

* npm ci：PASS
* lint：PASS（tsc --noEmit）
* build:electron：PASS（tsc -p tsconfig.electron.json）
* verify:mvp129-stabilization-round5：PASS（archived 476 legacy files）
* verify:stable：PASS（全部 MVP112~MVP129 验证器通过）
* build：PASS（vite build，1809 modules，3.60s）
* audit high：PASS（无 high 或 critical）
* moderate 数量：1（Electron <=39.8.4，已知允许项）

## 3. Windows 发布短复验

* desktop:setup：PASS（Electron v39.8.1，blockmap patch 成功）
* strict smoke：PASS（14/14 检查通过）
* portable pack：PASS（release\Yang Kura-0.167.0-mvp129-portable-x64.exe）
* installer dist：PASS（release\Yang Kura-0.167.0-mvp129-setup-x64.exe + blockmap）
* portable 启动：PASS（Codex Round 5 已确认）
* 首页：PASS（Codex Round 5 已确认）
* 设置入口：PASS（Codex Round 5 已确认）
* 诊断入口：PASS（Codex Round 5 已确认）
* 残留进程：PASS（Codex Round 5 已确认）

## 4. Git 合入前

* branch：main
* old HEAD：55e33b383d8b2c555d3d47b7ba600e1c52b67f73
* old origin/main：55e33b383d8b2c555d3d47b7ba600e1c52b67f73
* 工作区：clean
* 备份位置：G:\Codex\YangKuraRound6\backup\yang-kura-pre-mvp129-stable-backup.zip

## 5. 合入内容

* 新增文件数：约 50（MVP121~129 新文件、archive 归档结构、tests/fixtures 等）
* 修改文件数：约 30（入口文档、核心源码、package.json、package-lock.json 等）
* 删除/归档文件数：476（HANDOFF_MVP*、PACKAGE_MANIFEST_MVP*、旧 docs、旧 scripts → archive/legacy-mvp-history/）
* 依赖变化：package-lock.json 精简（1462 行变化），version 从 0.158.0-mvp120 更新至 0.167.0-mvp129
* npm scripts 变化：新增 verify:mvp121~129、test:mpv:settings-runtime 等，verify:all 等价于 verify:stable
* 历史归档文件数：476
* MVP130 代码是否出现：否

## 6. 主仓库重新验证

* npm ci：PASS（391 packages）
* lint：PASS（需 NODE_OPTIONS=--max-old-space-size=8192）
* build:electron：PASS
* verify:mvp129-stabilization-round5：PASS
* verify:stable：PASS（全部 MVP112~129 验证器通过）
* build：PASS（vite build，1809 modules，4.83s）
* audit high：PASS（仅 1 moderate）

## 7. Git 结果

* commit：316d8127d6d423a1d9e6930b8b804a3bac11140e
* commit message：release: stabilize Yang-Kura MVP129
* push：成功（55e33b3..316d812 main -> main）
* final HEAD：316d8127d6d423a1d9e6930b8b804a3bac11140e
* origin/main：316d8127d6d423a1d9e6930b8b804a3bac11140e
* 是否一致：是
* 工作区是否 clean：是

## 8. 安全检查

* absolutePath 泄漏：无
* file:// 泄漏：无
* 密钥泄漏：无（grep 匹配仅任务 ID 前缀如 "mvp87-readonly-rj-preview"）
* 真实用户数据：无（无 library-index.json 实体文件）
* node_modules / dist / release：已通过 .gitignore 排除
* MVP130 下载器代码：无

## 9. 最终结论

**PASS：MVP129 已稳定合入 GitHub main。**

合入范围：
- MVP121~MVP129 全部开发成果
- Windows 发布门禁修复
- 稳定回归链（verify:stable）
- 依赖精简（package-lock.json 清理）
- 历史资料归档（476 文件 → archive/legacy-mvp-history/）
- 入口文档统一指向 MVP129
- MVP130 禁止合入标记（MVP130_EXPERIMENTAL_DO_NOT_MERGE.md）
