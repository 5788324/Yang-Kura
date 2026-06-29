# CODEX_M0_M1_TASK.md

本文件是给 Codex 的第一轮执行任务。  
只执行 M0 + M1，不扩大范围。

## 0. 创建新项目

创建新仓库：

```text
yang-kura
```

产品名：

```text
Yang Kura
```

技术栈：

```text
Python + Flet + SQLite
```

## 1. 必须先读

```text
00_CODEX_README.md
AGENTS.md
PROJECT_ROADMAP.md
DECISIONS.md
ARCHITECTURE.md
UI_GUIDE.md
SCHEMA.md
TASKS.md
WORKLOG.md
```

## 2. 本轮目标

```text
M0：项目骨架 + theme 系统
M1：SQLite schema + Vault 唯一 DB 入口
```

## 3. 创建目录结构

```text
yang-kura/

├── main.py
├── config.yaml
├── requirements.txt
├── README.md
├── AGENTS.md
├── PROJECT_ROADMAP.md
├── WORKLOG.md
├── DECISIONS.md
├── ARCHITECTURE.md
├── UI_GUIDE.md
├── SCHEMA.md
├── TASKS.md
├── .gitignore
│
├── core/
│   ├── __init__.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── vault.py
│   │   ├── schema.py
│   │   └── migrations.py
│   ├── scanner/
│   │   └── __init__.py
│   ├── library/
│   │   └── __init__.py
│   ├── metadata/
│   │   └── __init__.py
│   ├── reconcile/
│   │   └── __init__.py
│   ├── players/
│   │   └── __init__.py
│   └── sources/
│       └── __init__.py
│
├── ui/
│   ├── __init__.py
│   ├── app.py
│   ├── theme.py
│   ├── layout.py
│   ├── components/
│   │   └── __init__.py
│   └── views/
│       └── __init__.py
│
├── tools/
│   ├── db_init.py
│   └── db_inspect.py
│
├── tests/
│   ├── test_db_schema.py
│   └── test_vault.py
│
└── logs/
    └── .gitkeep
```

## 4. Flet 空窗口

`python main.py` 应启动 Flet。

窗口标题：

```text
Yang Kura
```

页面显示：

```text
Yang Kura
Local RJ / ASMR Library Manager
Current stage: M0 + M1
```

## 5. theme.py

创建 `ui/theme.py`，至少包含：

```python
APP_NAME = "Yang Kura"

LIGHT_THEME = {...}
DARK_THEME = {...}

SPACING = {...}
RADIUS = {...}
FONT_SIZE = {...}
```

页面禁止散写颜色，必须从 theme 引用。

M0 不需要完整主题切换，但结构必须预留。

## 6. config.yaml

创建：

```yaml
app:
  name: "Yang Kura"
  stage: "M0+M1"

library:
  root: "E:\\arsm"

database:
  path: "yang_kura.db"

ui:
  theme: "system"
```

## 7. requirements.txt

固定版本。  
至少：

```text
flet
pyyaml
pytest
```

如果本机可查询版本，请写明确版本。  
不要写完全不固定的大范围依赖。

## 8. SQLite schema

按 `SCHEMA.md` 创建 M1 初始表：

```text
works
media_files
unknown_folders
scan_runs
settings
```

并创建 indexes。

## 9. YangKuraVault

`core/db/vault.py` 实现 `YangKuraVault`。

最低方法：

```text
__init__(db_path)
connect()
close()
init_db()
integrity_check()
execute_read(sql, params=None)
execute_write(sql, params=None)
execute_many(sql, seq_of_params)
transaction()
get_setting(key, default=None)
set_setting(key, value)
```

要求：

```text
写入明确 commit / rollback
schema 初始化幂等
integrity_check 返回 ok / error
UI 不直接 sqlite3.connect
```

## 10. tools

### tools/db_init.py

功能：

```text
初始化 DB
运行 integrity_check
输出 DB 路径和结果
```

### tools/db_inspect.py

功能：

```text
列出表
列出 indexes
运行 integrity_check
```

## 11. tests

至少覆盖：

```text
init_db 可执行
init_db 可重复执行
works 表存在
media_files 表存在
unknown_folders 表存在
scan_runs 表存在
settings 表存在
indexes 存在
integrity_check ok
set_setting / get_setting 正常
```

运行：

```powershell
python -m pytest
```

## 12. .gitignore

必须排除：

```text
__pycache__/
*.pyc
.venv/
venv/
.env
*.db
*.db-wal
*.db-shm
logs/*.log
.local_backups/
output/
cache/
*.tmp
```

保留：

```text
logs/.gitkeep
```

## 13. 禁止事项

本轮禁止：

```text
不实现扫描器
不扫描 E:\arsm
不写入真实用户资源库数据
不联网
不获取元数据
不下载
不删除文件
不移动文件
不重命名文件
不读取 arsm-downing history.db
不接 OpenList/Web
不做播放器
不做复杂 UI 页面
不让 UI 直接 sqlite3.connect
不让 UI 直接 os.walk
```

## 14. 运行检查

```powershell
python main.py
python tools\db_init.py
python tools\db_inspect.py
python -m pytest
git status --short
```

## 15. Git

确认没有提交：

```text
*.db
logs/*.log
.local_backups
用户资源文件
E:\arsm 内容
```

提交：

```powershell
git add .
git commit -m "chore: initialize Yang Kura project skeleton"
git push origin main
```

## 16. 最终汇报格式

```text
Yang Kura M0+M1 结论：PASS / NEEDS_FIX / STOP

Git：
- repo:
- HEAD:
- pushed:
- git status clean:

Files：
- added:
- modified:

Docs：
- AGENTS.md:
- PROJECT_ROADMAP.md:
- WORKLOG.md:
- DECISIONS.md:
- ARCHITECTURE.md:
- UI_GUIDE.md:
- SCHEMA.md:
- TASKS.md:
- README.md:

M0：
- Flet app starts:
- window title:
- theme.py:
- config.yaml:
- requirements fixed:
- .gitignore:

M1：
- Vault:
- schema:
- migrations:
- integrity_check:
- UI direct sqlite3.connect:
- DB files committed:

Tests：
- commands run:
- passed:
- failed:

Safety：
- scanned E:\arsm:
- network used:
- files deleted:
- files moved/renamed:
- arsm-downing touched:
- DB created:
- DB committed:

Decision：
- 是否允许进入 M2 只读扫描器:
- 是否需要 Codex 二次审查:
- 是否建议回滚:
```
