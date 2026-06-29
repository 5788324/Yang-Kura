# DECISIONS.md

本文件记录 `Yang Kura` 已定案的项目决策。  
后续 AI 不应反复重新讨论已定案内容，除非发现明确逻辑冲突或用户主动要求修改。

## D-001 项目名称

```text
产品名：Yang Kura
仓库名：yang-kura
```

说明：`Kura` 取“蔵 / 仓库”意象，项目属于用户个人资源库体系。

## D-002 旧下载器冻结

`arsm-downing` 冻结，独立保留，只用于从 arsm.one 下载。  
`Yang Kura` 不继续开发旧下载器，不把旧下载器纳入主项目核心。

## D-003 管理器是核心

`Yang Kura` 是资源库管理器。  
下载器和播放器都是插件、外部工具或后期适配层。

## D-004 平台

仅 Windows 桌面端。  
MVP 不做 Android、不做 Web、不做远程服务。

## D-005 技术栈

```text
Python + Flet + SQLite
```

原因：

```text
单语言
AI 容易处理
用户已有 Flet 经验
MVP 链路短
后期可加 FastAPI 只读服务
```

## D-006 第一版只扫描 E:\arsm

第一版仓库根目录：

```text
E:\arsm
```

不监听外部下载目录。  
外部下载完成后由用户手动拖入仓库。

## D-007 不自动搬运文件

禁止自动搬运、删除、重命名、整理、合并用户文件。

## D-008 一作一目录

主规则：

```text
一个作品 = 一个主目录
```

不支持一作多目录自动合并。  
异常进入 warning / duplicate_rj / Unknown Inbox，由用户或 AI 辅助人工处理。

## D-009 Unknown Inbox 保留

无法识别作品号但包含媒体内容的目录进入 Unknown Inbox。  
Unknown Inbox 支持后续手动绑定 / AI 批量分析后绑定。

## D-010 duplicate_rj 单独分类

同一个 RJ/BJ/VJ 出现在多个目录时，必须分类为：

```text
duplicate_rj
```

不得混入普通 Unknown Inbox。

原因：duplicate_rj 需要处理“哪个目录正确、是否合并/清理”；unknown 需要处理“这是什么作品”。二者动作不同。

## D-011 mixed_rj_folder 单独分类

同一目录内出现多个作品号时，分类为：

```text
mixed_rj_folder
```

不自动拆分，不自动移动文件。

## D-012 UI 主题集中管理

从 M0 建立：

```text
ui/theme.py
```

所有颜色、字体、间距、圆角、阴影等集中管理。  
页面禁止散写颜色值。

## D-013 UI 与 core 强分层

```text
core/ 不依赖 Flet
ui/ 不直接操作 DB / 文件扫描 / 联网
DB 只能通过 Vault 访问
```

## D-014 M6 元数据查询风险

M6 元数据/文件清单查询存在反爬与维护风险：

```text
批量查询可能触发反爬
可能被限 IP / 验证码 / 403
站点页面结构可能改版
API 可能变化
需要限速、缓存、失败重试、代理策略
```

该风险不同于本地文件安全风险，属于外部依赖风险。

## D-015 M5 外部播放器边界

M5 只负责：

```text
打开文件
生成 m3u
调用系统默认播放器或用户指定播放器
```

M5 不负责：

```text
播放状态回传
进度保存
字幕同步
当前曲目读取
```

## D-016 椒盐音乐 Windows 版

Salt Player for Windows / 椒盐音乐 Windows 版可以作为 M5 外部播放器示例。  
但它不是 M5 可控播放器后端。  
所有消费级播放器都只按“外部打开目标”处理。

## D-017 OpenList/Web 后期预研

OpenList / Web / 只读 API 作为 M9+ 后期预研。  
这不等于把管理器改成 Web 应用。  
MVP 仍是 Windows Flet 桌面应用。

## D-018 Gemini / Claude / Codex 前端协作方式

漂亮 UI 不由 Codex/GPT 凭空发挥。  
推荐流程：

```text
Gemini / Claude：视觉方案、布局、风格、组件说明
Codex / DeepSeek：按 UI_GUIDE 和 theme.py 稳定实现 Flet
ChatGPT：阶段边界、验收标准、风险判断
用户：截图反馈
```

## D-019 M0+M1 只打地基

第一轮只做 M0+M1：

```text
项目骨架
文档
Flet 空窗口
theme.py
SQLite schema
Vault
基础测试
```

不做扫描器、不做 UI 复杂页面、不联网、不读旧下载器。
