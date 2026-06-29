# ARCHITECTURE.md

## 0. 架构目标

`Yang Kura` 需要长期维护、便于 AI 修改、便于后续扩展。  
因此从第一天开始采用强分层架构。

核心原则：

```text
核心逻辑不依赖 UI
UI 不直接操作 DB
UI 不直接扫描磁盘
DB 通过 Vault 统一访问
扫描器纯本地、可测试
元数据联网和本地扫描分离
播放器桥接和管理器核心分离
```

## 1. 推荐目录结构

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
│
├── core/
│   ├── db/
│   ├── scanner/
│   ├── library/
│   ├── metadata/
│   ├── reconcile/
│   ├── players/
│   └── sources/
│
├── ui/
│   ├── app.py
│   ├── theme.py
│   ├── layout.py
│   ├── components/
│   └── views/
│
├── tools/
├── tests/
└── logs/
```

## 2. core/db

职责：

```text
SQLite 连接
schema
migration
transaction
integrity check
settings
```

唯一入口：

```text
core/db/vault.py
```

禁止其他模块直接 `sqlite3.connect`。

## 3. core/scanner

职责：

```text
M2 以后实现本地扫描
识别 RJ/BJ/VJ
识别 recognized / unknown / duplicate_rj / mixed_rj_folder
文件分类
输出 dry-run report
```

限制：

```text
不依赖 Flet
不写 DB
不联网
不移动文件
不删除文件
不重命名文件
```

## 4. core/library

职责：

```text
资源库业务服务
works 查询
media_files 查询
unknown 查询
duplicate 查询
M3 以后通过 Vault 写入索引
```

UI 只调用 library service，不直接查 DB。

## 5. core/metadata

职责：

```text
M6 以后实现元数据 provider
根据 RJ / 外部链接获取标题、社团、封面、简介
获取远程文件清单
```

限制：

```text
不混入 scanner
必须限速
必须缓存
必须处理反爬/失败
```

## 6. core/reconcile

职责：

```text
M6 以后对比远程文件清单与本地文件树
输出缺失报告
输出疑似更新报告
```

限制：

```text
不删除
不覆盖
不移动
不重命名
不自动补下载
```

## 7. core/players

职责：

```text
M5 外部播放桥接
打开单个文件
生成 m3u
调用系统默认播放器或用户指定播放器
M10 预研 mpv/VLC 可控播放器
```

限制：

```text
M5 不读播放状态
M5 不保存播放进度
M5 不做字幕同步
```

## 8. core/sources

职责：

```text
来源 profile
M8 arsm-downing 只读适配
其他下载来源标记
```

限制：

```text
不写旧 DB
不启动旧下载器
不接旧下载队列
```

## 9. ui

职责：

```text
Flet 页面
主题
布局
组件
用户交互
```

禁止：

```text
sqlite3.connect
os.walk
直接写 DB
直接联网
直接扫描磁盘
删除/移动/重命名文件
```

## 10. tools

职责：

```text
命令行工具
db_init
db_inspect
scan_dry_run
scan_import
```

所有危险工具必须：

```text
默认 dry-run
--execute 才写入
写入前备份
输出报告
```

## 11. tests

所有核心逻辑必须可测试。

M0/M1 最低测试：

```text
init_db
schema idempotent
integrity_check
settings get/set
indexes
```

M2 以后增加：

```text
rj_parser
file_classifier
scanner
duplicate_rj
mixed_folder
```
