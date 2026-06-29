# AGENTS.md

本文件是所有 AI / Agent / Codex / DeepSeek / Gemini / Claude 进入 `Yang Kura` 项目前必须阅读的核心规则。

## 0. 项目身份

```text
项目名：Yang Kura
仓库名：yang-kura
定位：Windows 本地 RJ / ASMR 资源库管理器
技术栈：Python + Flet + SQLite
```

`Yang Kura` 是新项目。  
旧项目 `arsm-downing` 冻结，独立保留，只作为 arsm.one 下载器使用。

## 1. 所有 AI 每轮开始必须读取

```text
AGENTS.md
PROJECT_ROADMAP.md
WORKLOG.md
DECISIONS.md
ARCHITECTURE.md
UI_GUIDE.md
SCHEMA.md
TASKS.md
```

如果修改 UI，还必须重点读取：

```text
UI_GUIDE.md
ui/theme.py
```

如果修改 DB，还必须重点读取：

```text
SCHEMA.md
core/db/schema.py
core/db/vault.py
core/db/migrations.py
```

## 2. 工作日志硬规则

每一轮工作结束必须追加 `WORKLOG.md`。  
不能只靠聊天记录。不能只在最后总结。不能省略风险项。

每条日志至少包含：

```text
日期
执行者
阶段
目标
完成内容
修改文件
是否改 DB
是否删除文件
是否移动/重命名文件
是否联网
是否改 UI
测试命令
测试结果
Git 状态
风险/备注
下一步
```

## 3. 分层规则

### 3.1 core 层

`core/` 禁止依赖 Flet。

允许：

```text
SQLite
pathlib
os
业务逻辑
扫描逻辑
元数据逻辑
播放器桥接逻辑
```

禁止：

```text
import flet
UI 控件
页面布局
颜色/主题
```

### 3.2 ui 层

`ui/` 只负责显示和交互。

禁止 UI 层直接：

```text
sqlite3.connect
os.walk
写 DB
扫描磁盘
联网抓元数据
删除文件
移动文件
重命名文件
```

UI 必须通过 service / Vault / core 提供的接口获取数据。

### 3.3 DB 层

数据库只能通过：

```text
core/db/vault.py
```

禁止在其他模块散写：

```python
sqlite3.connect(...)
```

除非是在 `core/db/vault.py` / `core/db/migrations.py` / 测试里明确为了验证 Vault。

## 4. 文件安全规则

默认禁止：

```text
删除文件
移动文件
重命名文件
自动整理文件
自动合并目录
自动清理重复文件
自动覆盖已有文件
```

如果未来阶段确实需要文件操作，必须满足：

```text
dry-run
preview
用户确认
可回滚方案
WORKLOG 记录
Codex 审查
```

当前 M0/M1 阶段完全禁止任何用户资源文件操作。

## 5. 联网规则

M0-M5 禁止联网获取元数据。  
M6 才允许设计元数据 provider。

M6 已知风险：

```text
批量查询可能触发 DLsite / asmr.one 等站点反爬
可能出现 IP 限制、验证码、403、封禁
页面结构或 API 格式可能改版
需要请求间隔、限速、缓存、失败重试、代理策略
```

M6 之前不要实现联网逻辑。

## 6. 下载器规则

`arsm-downing` 冻结。  
本项目不得复制旧下载器核心逻辑作为主线。  
M8 之前不得读取旧下载器 DB。  
M8 也只允许只读适配，不允许写旧 DB、不允许启动旧下载器、不允许接旧下载队列。

## 7. 播放器规则

M5 第一版只做外部播放桥接：

```text
打开单个音频文件
生成 m3u
用系统默认播放器打开 m3u
可配置任意已安装播放器路径
```

可作为外部播放器示例：

```text
Salt Player for Windows / 椒盐音乐 Windows 版
网易云音乐 Windows 客户端
foobar2000
AIMP
MusicPlayer2
mpv
VLC
其他用户指定播放器
```

但 M5 不做：

```text
读取播放状态
保存播放进度
读取当前曲目
字幕同步
播放器回调
```

可控播放器放到 M10 预研。

## 8. UI 规则

UI 要好看，但首先要可维护、方便 AI 修改。

硬规则：

```text
所有颜色、字体、间距、圆角、阴影集中在 ui/theme.py
页面禁止散写颜色值
复杂组件放 ui/components
不要复制粘贴大段 UI
AI 写 UI 后必须运行 python main.py 验证
必须确认所用 Flet API 是当前 requirements.txt 固定版本支持的
```

推荐流程：

```text
Gemini / Claude：做视觉方案、布局描述、主题建议
Codex / DeepSeek：按 UI_GUIDE 和 theme.py 实现 Flet
ChatGPT：做阶段边界和验收
用户：截图反馈哪里丑
```

## 9. 当前阶段限制

当前阶段为：

```text
M0 + M1
```

只允许：

```text
项目骨架
文档
theme.py
空 Flet 窗口
SQLite schema
Vault
基础测试
```

禁止：

```text
扫描器
扫描 E:\arsm
元数据联网
播放器
补下载
OpenList/Web
arsm-downing 适配
复杂 UI 页面
```

## 10. Agent 输出格式

每轮完成后必须输出：

```text
结论：PASS / NEEDS_FIX / STOP

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
风险：
下一步建议：
```
