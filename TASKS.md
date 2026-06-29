# TASKS.md

## Current Stage

```text
M0 + M1
```

## 本轮允许

```text
创建新项目 yang-kura
建立目录结构
建立核心文档
建立 Flet 空窗口
建立 ui/theme.py
建立 config.yaml
建立 requirements.txt
建立 .gitignore
建立 SQLite schema
建立 YangKuraVault
建立 DB 初始化工具
建立 DB inspect 工具
建立基础测试
更新 WORKLOG.md
提交 Git
```

## 本轮禁止

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

## 本轮验收

```text
python main.py 可启动
窗口标题 Yang Kura
页面显示 Yang Kura / 当前阶段
ui/theme.py 存在
requirements.txt 固定版本
config.yaml 存在
Vault 可初始化 DB
schema 幂等
integrity_check ok
settings get/set 正常
pytest 通过
核心文档齐全
WORKLOG 有本轮记录
git status clean
没有提交 *.db / logs/*.log / 用户资源文件
```

## 推荐命令

```powershell
python main.py
python -m pytest
python tools\db_init.py
python tools\db_inspect.py
git status --short
```

## 提交信息

```text
chore: initialize Yang Kura project skeleton
```

## 完成后输出

按 `CODEX_M0_M1_TASK.md` 中的最终汇报格式输出。
