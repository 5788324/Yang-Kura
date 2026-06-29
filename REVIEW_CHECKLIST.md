# REVIEW_CHECKLIST.md

Codex / ChatGPT / 用户审查 `Yang Kura` 每轮结果时使用。

## 1. Git 审查

```powershell
git status --short
git log --oneline -5
```

确认没有提交：

```text
*.db
*.db-wal
*.db-shm
logs/*.log
.local_backups
E:\arsm 内容
用户资源文件
下载内容
```

## 2. 文档审查

必须存在：

```text
AGENTS.md
PROJECT_ROADMAP.md
WORKLOG.md
DECISIONS.md
ARCHITECTURE.md
UI_GUIDE.md
SCHEMA.md
TASKS.md
README.md
```

`WORKLOG.md` 必须有本轮记录。

## 3. M0 审查

```text
python main.py 可启动
窗口标题 Yang Kura
页面显示当前阶段
ui/theme.py 存在
config.yaml 存在
requirements.txt 固定版本
.gitignore 正确
```

## 4. M1 审查

```text
core/db/vault.py 存在
core/db/schema.py 存在
core/db/migrations.py 存在
tools/db_init.py 存在
tools/db_inspect.py 存在
schema 初始化幂等
integrity_check ok
settings get/set 正常
```

## 5. 分层审查

确认 UI 不含：

```text
sqlite3.connect
os.walk
直接 DB 写入
扫描磁盘逻辑
联网逻辑
```

确认 core 不依赖：

```text
flet
```

## 6. 安全审查

本轮必须为否：

```text
是否扫描 E:\arsm
是否联网
是否删除文件
是否移动文件
是否重命名文件
是否读取 arsm-downing history.db
是否接 OpenList/Web
是否实现播放器
```

## 7. 测试命令

```powershell
python main.py
python tools\db_init.py
python tools\db_inspect.py
python -m pytest
```

## 8. PASS 标准

```text
M0/M1 范围完整
测试通过
文档齐全
WORKLOG 更新
Git 干净
没有越界功能
没有用户文件风险
```

## 9. NEEDS_FIX 标准

```text
小测试缺失
文档少量不完整
theme.py 不够集中
requirements 未固定
报告格式不完整
```

## 10. STOP 标准

```text
扫描了 E:\arsm
联网抓元数据
删除/移动/重命名用户文件
改了 arsm-downing
提交了 DB / logs / 用户资源
UI 直接 sqlite3.connect
M0/M1 之外实现大量功能
```
