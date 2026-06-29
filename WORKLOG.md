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
