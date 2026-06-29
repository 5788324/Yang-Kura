# Yang Kura 文档包入口

Codex / DeepSeek / 其他 AI 进入新项目 `yang-kura` 前，必须先读本文件，再按顺序读核心文档。

## 项目基本信息

```text
产品名：Yang Kura
仓库名：yang-kura
定位：Windows 本地 RJ / ASMR 资源库管理器
技术栈：Python + Flet + SQLite
平台：Windows 桌面端
```

## 本文档包用途

这包文档用于初始化新项目。  
第一轮执行只允许做：

```text
M0：项目骨架 + theme 系统
M1：SQLite schema + Vault 唯一 DB 入口
```

严禁本轮扩展到：

```text
扫描器
播放器
元数据联网
补下载
OpenList/Web
arsm-downing 适配
复杂 UI 页面
```

## 推荐阅读顺序

```text
1. 00_CODEX_README.md
2. AGENTS.md
3. PROJECT_ROADMAP.md
4. DECISIONS.md
5. ARCHITECTURE.md
6. UI_GUIDE.md
7. SCHEMA.md
8. TASKS.md
9. CODEX_M0_M1_TASK.md
10. REVIEW_CHECKLIST.md
11. WORKLOG.md
```

## 第一轮最终目标

Codex 应创建新仓库 `yang-kura`，落地：

```text
项目骨架
Flet 空窗口
theme.py
SQLite schema
YangKuraVault
基础测试
核心文档
WORKLOG 初始记录
Git commit
```

完成后按 `CODEX_M0_M1_TASK.md` 的报告格式输出。

## 最重要的规则

```text
不要碰 arsm-downing。
不要扫描 E:\arsm。
不要联网。
不要删除、移动、重命名用户文件。
不要让 UI 直接 sqlite3.connect。
不要让 UI 直接 os.walk。
每轮必须更新 WORKLOG.md。
```
