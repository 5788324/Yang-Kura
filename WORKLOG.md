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
