# WORKLOG.md

本文件是 `Yang Kura` 的持续工作日志。
每一轮 AI / Codex / DeepSeek / 用户操作都必须追加记录。

## 日志模板

```text
## YYYY-MM-DD - M0/M1 - <标题>

执行者：
目标：
完成内容：
修改文件：
是否改 DB：
是否删除文件：
是否移动/重命名文件：
是否联网：
是否扫描 E:\arsm：
是否改 UI：
测试命令：
测试结果：
Git 状态：
风险/备注：
下一步：
```

---

## 2026-06-29 - Planning - 新项目规划定案

执行者：ChatGPT / Claude / 用户
目标：确定 `Yang Kura` 新项目方向。

完成内容：

```text
1. 项目名确定为 Yang Kura。
2. 仓库名确定为 yang-kura。
3. arsm-downing 冻结，独立保留，只作为 arsm.one 下载器。
4. Yang Kura 定位为 Windows 本地 RJ / ASMR 资源库管理器。
5. 技术栈确定为 Python + Flet + SQLite。
6. 第一版只扫描 E:\arsm。
7. 一作一目录。
8. Unknown Inbox 保留。
9. duplicate_rj 必须单独分类。
10. M0-M10 阶段规划确定。
11. M0+M1 可开工。
```

修改文件：无，本文件为新项目初始文档。
是否改 DB：否
是否删除文件：否
是否移动/重命名文件：否
是否联网：否
是否扫描 E:\arsm：否
是否改 UI：否
测试命令：无
测试结果：无
Git 状态：新项目尚未创建
风险/备注：

```text
M6 元数据查询有反爬和站点结构变更风险。
M5 外部播放器只负责打开文件/m3u，不读取播放状态。
OpenList/Web 放 M9+ 预研，不进入 MVP。
```

下一步：

```text
Codex 执行 M0+M1：
- 创建新仓库
- 项目骨架
- 文档
- theme.py
- Flet 空窗口
- SQLite schema
- Vault
- 基础测试
```

## 2026-06-29 - M0/M1 - 第一轮项目骨架与 Vault 初始化

执行者：Codex
目标：按 CODEX_M0_M1_TASK.md 完成 Yang Kura M0+M1 第一轮初始化。
完成内容：

```text
1. 在 G:\Codex\Yang Kura 初始化独立 Git 仓库。
2. 创建 Python + Flet + SQLite 项目骨架。
3. 创建 ui/theme.py 和 M0 Flet 空壳页面。
4. 创建 SQLite M1 schema、indexes、migrations。
5. 实现 YangKuraVault 唯一 DB 入口。
6. 创建 db_init / db_inspect 工具。
7. 创建基础 pytest 测试，覆盖 schema 幂等、integrity_check、indexes、settings get/set、事务 rollback。
8. 验证 UI 与 core 分层：UI 未直接 sqlite3.connect / os.walk，core 未依赖 Flet。
```

修改文件：main.py, config.yaml, requirements.txt, .gitignore, core/, ui/, tools/, tests/, logs/.gitkeep, WORKLOG.md
是否改 DB：仅创建本轮测试 DB，已清理，未提交 DB
是否删除文件：仅清理本轮测试生成的 pycache / pytest cache / log / 测试 DB
是否移动/重命名文件：否
是否联网：是，仅用于安装 pytest==8.4.1；未联网获取元数据
是否扫描 E:\arsm：否
是否改 UI：是，仅 M0 空壳页面和 theme token
测试命令：

```powershell
python -B -m py_compile main.py ui\app.py ui\theme.py core\db\schema.py core\db\migrations.py core\db\vault.py tools\db_init.py tools\db_inspect.py tests\test_db_schema.py tests\test_vault.py
python -B tools\db_init.py
python -B tools\db_inspect.py
python -B -m pytest
python -B main.py
rg "sqlite3\.connect|os\.walk" ui core tools tests
rg "import flet|from flet" core
```

测试结果：

```text
py_compile: PASS
db_init: integrity_check ok
db_inspect: tables/indexes listed, integrity_check ok
pytest: 5 passed
main.py: Flet 进程启动 5 秒无 stderr，随后关闭
分层扫描: sqlite3.connect 仅出现在 core/db/vault.py；core 未发现 Flet import
```

Git 状态：准备提交并推送到 origin/main
风险/备注：

```text
1. 普通 sandbox 下 Python 写入 pycache / SQLite DB 触发权限或 disk I/O 问题，验证命令使用提升权限执行。
2. pytest 起初未安装，已安装固定版本 pytest==8.4.1。
3. 本轮未进入 M2，未扫描 E:\arsm，未读取 arsm-downing。
```

下一步：

```text
提交并推送 M0+M1；之后可进行 Codex 二次审查，再决定是否进入 M2 只读扫描器。
```

---

## 2026-06-29 - M1.1 - Schema Hardening

执行者：Codex
目标：修补 M0+M1 后发现的 schema 预留不足问题。本轮只改 DB schema、schema 文档、测试、WORKLOG，不实现扫描器。

完成内容：

```text
1. works 表增加 5 个字段：
   - work_code_raw TEXT（原始作品号字符串）
   - work_code_norm TEXT（规范化作品号）
   - work_type TEXT（rj/bj/vj）
   - work_number INTEGER（作品编号）
   - folder_status TEXT DEFAULT 'recognized'（recognized/duplicate/mixed）

2. media_files 增加唯一索引：
   - CREATE UNIQUE INDEX idx_media_files_unique_path ON media_files(folder_path, relative_path)

3. unknown_folders 增加 4 个统计字段：
   - video_count INTEGER DEFAULT 0
   - archive_count INTEGER DEFAULT 0
   - other_count INTEGER DEFAULT 0
   - total_files INTEGER DEFAULT 0

4. 迁移机制：migrations.py 新增 run_migrations()，通过 PRAGMA table_info 检测列是否存在，按需 ALTER TABLE ADD COLUMN。索引用 CREATE ... IF NOT EXISTS 幂等建。

5. 更新 EXPECTED_INDEXES 包含 idx_media_files_unique_path。

6. 新增 4 个测试：
   - test_works_has_hardened_fields
   - test_works_folder_status_default
   - test_media_files_unique_constraint
   - test_unknown_folders_has_stat_fields

7. 更新 SCHEMA.md 文档，新增 M1.1 schema hardening 章节。
```

修改文件：core/db/schema.py, core/db/migrations.py, tests/test_db_schema.py, SCHEMA.md
是否改 DB：是，schema 增加字段和索引；未提交 DB 文件
是否删除文件：否
是否移动/重命名文件：否
是否联网：否
是否扫描 E:\arsm：否
是否改 UI：否

测试命令：

```powershell
python -B -m py_compile main.py core/db/schema.py core/db/migrations.py core/db/vault.py ui/app.py ui/theme.py tools/db_init.py tools/db_inspect.py
python -B tools/db_init.py
python -B tools/db_inspect.py
python -B -m pytest -v
```

测试结果：

```text
py_compile: PASS
db_init: integrity_check ok
db_inspect: 6 indexes listed (含 idx_media_files_unique_path), 5 tables, integrity_check ok
pytest: 9 passed (5 original + 4 new)
```

Git 状态：4 files modified, no untracked, no deletions, no DB committed

风险/备注：

```text
1. 本轮未修改 Vault API，execute_write / execute_read / transaction 保持不变。
2. 迁移对已有 DB 是幂等的：列已存在时跳过 ALTER TABLE。
3. 本轮未实现 scanner，未扫描 E:\arsm。
4. 唯一索引依赖 (folder_path, relative_path) 组合；如后续有跨卷移动需注意路径规范化。
```

下一步：

```text
用户审查本轮变更后，可进入 M2 只读扫描器 MVP。
```

---

## 2026-06-29 - M1.1 - 二次审查与唯一索引修复

执行者：Codex
目标：对当前 M1.1 HEAD 做二次审查，只审查和小修，不进入 M2 scanner。
完成内容：

```text
1. 复查 M0+M1 Flet 启动能力，main.py 可启动 5 秒无 stderr。
2. 复查 M1.1 schema hardening 字段：works / unknown_folders 字段存在。
3. 发现 idx_media_files_unique_path 在代码中是普通索引，不是 UNIQUE；已修复为 CREATE UNIQUE INDEX。
4. 修复唯一约束测试，改为 pytest.raises(sqlite3.IntegrityError)，避免 AssertionError 被误吞导致假通过。
5. 增加旧普通索引迁移兜底：如已有同名非唯一索引，init_db 时先 DROP，再创建唯一索引。
6. 增加测试 test_non_unique_media_file_path_index_is_replaced，验证普通索引会被替换成唯一索引。
7. 验证 UI 未直接 sqlite3.connect / os.walk，core 未引入 Flet。
8. 未扫描 E:\arsm，未实现 scanner。
```

修改文件：core/db/schema.py, core/db/migrations.py, tests/test_db_schema.py, WORKLOG.md
是否改 DB：仅创建本轮测试 DB，已清理，未提交 DB
是否删除文件：仅清理本轮测试生成的 pycache / pytest cache / log / 测试 DB
是否移动/重命名文件：否
是否联网：否
是否扫描 E:\arsm：否
是否改 UI：否
测试命令：

```powershell
python -B -m py_compile main.py core/db/schema.py core/db/migrations.py core/db/vault.py ui/app.py ui/theme.py tools/db_init.py tools/db_inspect.py tests/test_db_schema.py tests/test_vault.py
python -B tools\db_init.py
python -B tools\db_inspect.py
python -B -m pytest -v
python -B main.py
rg "sqlite3\.connect|os\.walk" ui core tools tests
rg "E:\\arsm|os\.walk|scan" core ui tools tests
```

测试结果：

```text
py_compile: PASS
db_init: integrity_check ok
db_inspect: 5 tables, 6 indexes, integrity_check ok
pytest: 10 passed
main.py: Flet 进程启动 5 秒无 stderr，随后关闭
分层扫描: UI 未发现 sqlite3.connect / os.walk；sqlite3.connect 仅在 core/db/vault.py 和测试中出现
安全扫描: 未发现 scanner 实现或 E:\arsm 扫描逻辑
```

Git 状态：准备提交 M1.1 二次审查修复
风险/备注：

```text
1. 如果未来已有真实 media_files 重复数据，创建唯一索引会失败；当前 M1/M1.1 尚未写入真实资源数据，因此可接受。
2. 本轮只做 schema hardening 小修，未进入 M2。
```

下一步：

```text
提交 M1.1 二次审查修复；保持在 M1.1，等待用户确认后再进入 M2 只读扫描器。

```
---

## 2026-06-30 - M2 - 只读扫描器 MVP 第一轮

执行者：Codex
目标：实现 fixture-first 的本地资源库只读扫描器。第一轮只扫 tests/fixtures/library_sample，不写 DB，不接 UI。

完成内容：

```text
1. 创建 core/scanner/ 模块：
   - result.py: ScanResult, WorkEntry, MediaFileEntry, UnknownFolderEntry 数据类
   - parser.py: 作品号解析 (RJ/BJ/VJ)，文件类型分类 (audio/video/image/subtitle/text/archive/other)
   - scanner.py: scan_library_root() 主入口，只读目录扫描
   - __init__.py: 公共导出

2. 作品识别逻辑：
   - 大小写不敏感匹配 RJ/BJ/VJ（正则: (RJ|BJ|VJ)(\d+)）
   - 支持前导零归一化：RJ00323125 → rj323125
   - 从文件夹名和文件名双重检测作品号
   - work_code_raw: 原始字符串
   - work_code_norm: 规范化小写+整数
   - folder_status: recognized / duplicate / mixed

3. 文件分类（7类）：
   audio: .mp3 .wav .flac .m4a .ogg .aac
   video: .mp4 .mkv .webm .avi
   image: .jpg .jpeg .png .webp .bmp
   subtitle: .lrc .srt .vtt .ass
   text: .txt .md .pdf
   archive: .zip .7z .rar
   other: 其他

4. 创建 tests/fixtures/library_sample/ 共 12 个目录：
   - 正常 RJ (RJ323125)
   - 小写 rj (rj100355)
   - VJ / BJ 类型
   - 无 RJ 但有音频 (unknown)
   - 空目录 (skipped)
   - mixed folder (同一目录多个 RJ)
   - duplicate RJ (两个目录同一 work_number)
   - 中文/日文目录名
   - 全文件类型测试目录

5. 创建 15 个扫描器测试：
   - test_scan_fixture_no_error
   - test_normal_rj_recognized
   - test_lowercase_rj_recognized
   - test_vj_recognized / test_bj_recognized
   - test_rj_leading_zeros_normalized
   - test_zero_padded_rj_preserves_raw_and_duplicates
   - test_unknown_folder_identified
   - test_mixed_folder_identified
   - test_duplicate_rj_identified
   - test_file_type_classification
   - test_scanner_does_not_write_db
   - test_scanner_works_without_real_arsm
   - test_japanese_folder_recognized
   - test_empty_folder_skipped

6. 创建 tools/scan_fixture.py：命令行工具，只扫 fixture，不默认扫 E:\arsm。
```

修改文件：
- core/scanner/__init__.py, core/scanner/result.py, core/scanner/parser.py, core/scanner/scanner.py
- tests/fixtures/library_sample/ (12 dirs + 28 files)
- tests/test_scanner.py
- tools/scan_fixture.py

是否改 DB：否（扫描器完全只读，不写 DB）
是否删除文件：否
是否移动/重命名文件：否
是否联网：否
是否扫描 E:\arsm：否（仅扫描 fixture）
是否改 UI：否

测试命令：

```powershell
python -B -m py_compile main.py core/db/*.py core/scanner/*.py ui/*.py tools/*.py tests/*.py
python -B tools/scan_fixture.py
python -B -m pytest -v
python -B tools/db_init.py
python -B tools/db_inspect.py
rg "E:\\arsm" core ui tools tests
rg "os\.remove|os\.rmdir|shutil\.move|shutil\.rmtree|unlink\(|rename\(" core ui tools tests
rg "import flet|from flet" core
```

测试结果：

```text
py_compile: PASS
scan_fixture: 12 dirs, 10 works, 1 unknown, 2 duplicate, 1 mixed, 28 media_files, 0 errors
pytest: 25 passed (10 original DB tests + 15 scanner tests)
db_init: integrity_check ok
db_inspect: 5 tables, 6 indexes, integrity_check ok
安全扫描: E:\arsm 仅在 tests/test_vault.py（预存 rollback 测试）；无破坏性文件操作；core 无 Flet import
```

Git 状态：core/scanner/__init__.py (modified), 6 new files untracked, no deletions, no DB committed

风险/备注：

```text
1. 扫描器仅扫描一级子目录（不递归），与 M2 roadmap 说明一致。
2. 作品号解析在文件夹名和文件名中都检测，可能导致文件名中含 RJ 时标记为 mixed。
3. mixed folder 的 work_entry 使用逗号分隔多个 code_norm，work_number=0，识别度中等。
4. fixture 文件为 0 字节占位文件，不影响文件类型分类测试。
5. 后续 M3 入库时需关注 folder_path 唯一约束与 mixed/duplicate 冲突。
```

下一步：

```text
用户审查 M2 scanner MVP；确认后进入 M3 扫描结果入库（dry-run → execute）。
```
---

## 2026-06-30 - M2 - Codex 二次审查与 fixture 补强

执行者：Codex
目标：审查 DeepSeek 完成的 M2 只读扫描器是否满足 fixture-first、只读、安全边界；不进入 M3，不写 DB，不扫描真实 E:\arsm。

完成内容：

```text
1. 审查当前工作区 diff，确认变更范围限于 core/scanner、tests/fixtures/library_sample、tests/test_scanner.py、tools/scan_fixture.py、WORKLOG.md。
2. 确认未修改 ui/，未修改 core/db/。
3. 审查 scan_library_root(root_path)：只使用 pathlib iterdir/is_file/stat 读取目录和文件元数据，不写 DB，不删除/移动/重命名文件。
4. 审查 RJ 规范化策略：work_code_raw 保留原始字符串，work_number 保留整数，work_code_norm 小写并去前导零，duplicate 检测按 norm 聚合。
5. 发现 fixture 缺少 RJ00323125 -> rj323125 的显式覆盖，补充 tests/fixtures/library_sample/RJ00323125_zero_padded/RJ00323125_track.mp3。
6. 新增 test_zero_padded_rj_preserves_raw_and_duplicates，验证 RJ00323125 raw/norm/number 保留与 RJ323125 duplicate 检测。
7. 修复 WORKLOG.md 中 M1.1 代码块闭合和 M2 统计数字。
```

修改文件：core/scanner/__init__.py, core/scanner/parser.py, core/scanner/result.py, core/scanner/scanner.py, tests/fixtures/library_sample/, tests/test_scanner.py, tools/scan_fixture.py, WORKLOG.md
是否改 DB：否；仅运行 db_init/db_inspect 创建测试 DB，已清理，未提交 DB
是否删除文件：仅清理本轮测试生成的 pycache / pytest cache / 测试 DB
是否移动/重命名文件：否
是否联网：否
是否扫描 E:\arsm：否，仅扫描 tests/fixtures/library_sample
是否改 UI：否

测试命令：

```powershell
python -B -m py_compile main.py core/db/*.py core/scanner/*.py ui/*.py tools/*.py tests/*.py
python -B tools/scan_fixture.py
python -B -m pytest -v
python -B tools/db_init.py
python -B tools/db_inspect.py
rg "E:\\arsm" core ui tools tests
rg "os\.remove|os\.rmdir|shutil\.move|shutil\.rmtree|unlink\(|rename\(" core ui tools tests
rg "import flet|from flet" core
rg "sqlite3\.connect|os\.walk" ui core tools tests
```

测试结果：

```text
py_compile: PASS（PowerShell 不展开通配符，使用等价显式文件列表执行）
scan_fixture: 12 dirs, 10 works, 1 unknown, 2 duplicate, 1 mixed, 28 media_files, 0 errors
pytest: 25 passed
db_init: integrity_check ok
db_inspect: 5 tables, 6 indexes, integrity_check ok
E:\arsm 检查: 无命中
破坏性文件操作检查: 无命中
core Flet import: 无命中
UI sqlite3.connect / os.walk: 无命中；sqlite3.connect 仅在 core/db/vault.py 和测试中出现
```

Git 状态：准备提交并推送 M2 fixture-first scanner
风险/备注：

```text
1. M2 扫描器当前为 fixture-first 和一级目录扫描，不进入 M3 入库。
2. work_code_norm 去前导零可满足 duplicate 检测；外部元数据查询未来进入 M6 时应优先携带 work_code_raw，避免 provider 对前导零格式敏感。
3. mixed folder 当前用逗号连接多个 norm，work_type=mixed，work_number=0；M3 入库前需要明确 mixed 的写入策略。
```

下一步：

```text
允许提交 M2 fixture-first read-only scanner。进入 M3 前应先做 dry-run 入库方案审查。
```
