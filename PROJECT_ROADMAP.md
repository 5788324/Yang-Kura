# Yang Kura Project Roadmap

## 0. 项目定位

`Yang Kura` 是一个 Windows 本地 RJ / ASMR 资源库管理器。

核心目标：

```text
扫描 E:\arsm
识别 RJ / BJ / VJ 作品
建立本地 SQLite 索引
提供资源库管理 UI
支持 Unknown Inbox
支持 duplicate_rj 单独分类
支持外部播放器打开
后续支持元数据补全、缺失文件对比、补下载、只读 Web/OpenList 预研、可控播放器预研
```

## 1. 总原则

```text
管理器优先
下载器插件化/外部化
播放器外部化
核心层和 UI 层强分离
SQLite 是本地真源
Vault 是唯一 DB 入口
第一版只扫描 E:\arsm
一作一目录
异常只标记，不自动整理
```

## 2. 阶段总览

| 阶段 | 名称 | 写 DB | 联网 | 文件操作 | 说明 |
|---|---|---:|---:|---:|---|
| M0 | 项目骨架 + theme 系统 | 否 | 否 | 否 | 新仓库、文档、Flet 空窗口、主题系统 |
| M1 | SQLite schema + Vault | 仅测试 DB | 否 | 否 | 唯一 DB 入口、schema、测试 |
| M2 | 只读扫描器 MVP | 否 | 否 | 否 | 扫描 E:\arsm，输出 dry-run 报告 |
| M3 | 扫描结果入库 | 是 | 否 | 否 | dry-run → execute，写入索引 |
| M4 | 管理 UI MVP | 只通过 service | 否 | 打开文件夹 | 列表、详情、Unknown Inbox |
| M5 | 外部播放桥接 | 配置可写 | 否 | 打开文件/m3u | 外部播放器路径、m3u |
| M6 | 元数据增强 + Metadata Reconcile | 是 | 是 | 否 | 元数据/远程文件清单/缺失报告 |
| M7 | 补下载插件 | 是 | 是 | 只新增缺失文件 | 必须 preview，用户确认 |
| M8 | arsm-downing 只读适配 | 写 Yang Kura DB | 否 | 否 | 只读旧 DB，不写旧 DB |
| M9 | OpenList / Web / 只读 API 预研 | 待定 | 局域网/localhost | 否 | 独立服务或只读 API，不进 MVP |
| M10 | 可控播放器预研 | 节流写入预研 | 否 | 播放文件 | mpv/VLC、进度、字幕 |

---

# M0：项目骨架 + theme 系统

## 目标

建立 `yang-kura` 新项目基础结构，让项目可启动、可交接、可继续开发。

## 任务

```text
初始化 Git 仓库
建立 main.py
建立 ui/app.py
建立 ui/theme.py
建立 config.yaml
建立 requirements.txt
建立 .gitignore
建立核心文档
建立 logs/.gitkeep
建立 tests/ 基础目录
启动空 Flet 窗口
窗口标题为 Yang Kura
页面显示当前阶段 M0 + M1
```

## 禁止事项

```text
不写真实 DB
不扫描 E:\arsm
不联网
不实现播放器
不接 arsm-downing
不做复杂 UI
```

## 验收标准

```text
python main.py 可启动
窗口标题 Yang Kura
theme.py 存在
requirements.txt 固定版本
核心文档齐全
git status clean
```

---

# M1：SQLite schema + Vault 唯一 DB 入口

## 目标

建立干净、可测试、可扩展的数据库入口。

## 任务

```text
core/db/schema.py
core/db/migrations.py
core/db/vault.py
tools/db_init.py
tools/db_inspect.py
tests/test_db_schema.py
tests/test_vault.py
```

M1 初始表：

```text
works
media_files
unknown_folders
scan_runs
settings
```

## 禁止事项

```text
UI 不允许 sqlite3.connect
不写真实资源数据
不扫描 E:\arsm
不联网
不做 M6 表完整实现
```

## 验收标准

```text
init_db 幂等
PRAGMA integrity_check = ok
settings get/set 正常
schema indexes 存在
pytest 通过
DB 文件不提交
```

---

# M2：只读扫描器 MVP

## 目标

扫描 `E:\arsm`，识别本地资源，但不写 DB。

## 任务

```text
识别 RJ/BJ/VJ
文件分类 audio/video/image/subtitle/text/archive/other
递归深度可配置
返回值 set 去重
recognized works
unknown folders
duplicate_rj
mixed_rj_folder
scan_report.json
scan_summary.txt
```

## 分类规则

```text
recognized_work：明确识别出单一作品号的作品目录
unknown_folder：有媒体文件但无作品号
duplicate_rj：同一作品号出现在多个目录
mixed_rj_folder：同一目录中出现多个作品号
```

## 禁止事项

```text
不写 DB
不联网
不移动文件
不删除文件
不重命名文件
```

## 验收标准

```text
能扫描 E:\arsm
能输出 recognized / unknown / duplicate_rj / mixed
统计去重
不会影响用户文件
```

---

# M3：扫描结果入库

## 目标

把扫描器 dry-run 结果写入 SQLite 索引。

## 任务

```text
默认 dry-run
--execute 才写 DB
写入前备份 DB
写入 scan_runs
写入 works
写入 media_files
写入 unknown_folders
重复扫描不重复插入
folder_path unique
```

## 禁止事项

```text
不删除文件
不移动文件
不重命名文件
不联网
不自动合并 duplicate
```

## 验收标准

```text
dry-run 不写 DB
execute 有备份
integrity_check ok
重复扫描不产生重复 works
```

---

# M4：管理 UI MVP

## 目标

在 Flet 中显示资源库。

## 功能

```text
作品列表
搜索 work_code / title / folder_name
作品详情
文件分类统计
音频列表
字幕列表
图片/封面候选
warning 显示
Unknown Inbox 页面
duplicate_rj 页面或筛选
打开文件夹
```

## 禁止事项

```text
UI 不读 scan JSON
UI 不直接 sqlite3.connect
UI 不直接 os.walk
UI 不直接写 DB
不删除文件
不移动文件
不重命名文件
```

## 验收标准

```text
数据来自 SQLite
页面可显示
搜索可用
Unknown / duplicate 单独可见
打开文件夹可用
UI 样式走 theme.py
```

---

# M5：外部播放桥接

## 目标

不做内置播放器，只把文件或播放列表交给外部播放器。

## 功能

```text
打开单个音频
生成 m3u
用系统默认播放器打开 m3u
可配置任意已安装的本地播放器路径
外部播放器示例：Salt Player for Windows、网易云音乐 Windows 客户端、foobar2000、AIMP、MusicPlayer2、mpv、VLC
```

## 限制

```text
不读取播放状态
不保存播放进度
不读取当前曲目
不做字幕同步
不假设消费级播放器有稳定外部控制接口
```

## 验收标准

```text
可生成 m3u
可打开默认播放器
可设置外部播放器路径
不会高频写 DB
```

---

# M6：元数据增强 + Metadata Reconcile

## 目标

根据 RJ / 外部链接获取元数据，并对比远程文件清单与本地文件树。

## 功能

```text
RJ metadata provider
外部链接 metadata provider
标题 / 社团 / 封面 / 简介
远程文件清单
本地文件树对比
缺失文件报告
疑似需要更新报告
```

## 已知风险

```text
批量查询可能触发反爬
可能出现 IP 被封、验证码、403
DLsite/asmr.one 等站点结构可能改版
API 或页面结构是长期脆弱依赖
需要请求间隔/限速/缓存/失败重试/代理策略
```

## 禁止事项

```text
不自动补下载
不删除本地文件
不覆盖本地文件
不重命名本地文件
不移动本地文件
不把联网逻辑混进 M2 扫描器
```

## 验收标准

```text
能生成 metadata report
能生成 reconcile report
只标记缺失/更新
不破坏本地结构
```

---

# M7：补下载插件

## 目标

基于 M6 缺失报告，用户确认后补下载缺失文件。

## 功能

```text
补下载 preview
用户确认
只下载缺失文件
不覆盖已有文件
下载报告
失败记录
```

## 禁止事项

```text
不自动执行
不覆盖已有文件
不删除文件
不移动文件
不重命名文件
不把下载器做成核心
```

## 验收标准

```text
preview 明确
用户确认后执行
只新增缺失文件
失败可追踪
```

---

# M8：arsm-downing 只读适配

## 目标

只读接入旧下载器数据，作为来源追溯。

## 功能

```text
配置 arsm-downing history.db 路径
只读读取 works / downloads / library_items
source_profile = arsm_downing
导入来源信息到 Yang Kura DB
```

## 禁止事项

```text
不写旧 DB
不启动旧下载器
不接旧下载队列
不修改旧项目
```

## 验收标准

```text
只读
不影响旧项目
可标记来源
```

---

# M9：OpenList / Web / 只读 API 预研

## 目标

评估是否需要局域网只读浏览或 OpenList 映射。

## 方向

```text
导出 manifest
FastAPI 只读 API
localhost / LAN 浏览
OpenList 路径映射
```

## 限制

```text
不进入 MVP
不把管理器改成 Web 应用
默认只读
默认 localhost / LAN
不做公网服务
不做账号系统 MVP
```

---

# M10：可控播放器预研

## 目标

评估内置可控播放器后端。

## 方向

```text
mpv IPC
python-vlc
播放进度回调
字幕 / LRC
节流写 DB
退出保存进度
```

## 禁止事项

```text
不在 M5 实现
不高频写 DB
不假设外部消费级播放器可控
```
