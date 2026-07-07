> 后续兼容版本：0.60.0-mvp22。
> 历史说明：本文件已被 `docs/CURRENT_ROADMAP_MVP22.md` 取代，保留为 MVP-20 审计记录。

# Yang-Kura 当前路线 / MVP-20

## 项目定位

Yang-Kura 是中文本地个人音频媒体库，支持：

```text
ASMR/RJ 音声库
普通音乐库
全部音频
歌单
最近播放
播放器
后续下载器
设置 / 诊断
```

当前技术主线：

```text
React + Vite + TypeScript
Electron 桌面壳
Local JSON Index 优先
SQLite 后置
YesPlayMusic-like UI 方向
```

## 当前阶段

```text
0.59.0-mvp20
Electron 小样本只读 dry-run 扫描
```

## 进度策略

用户确认这是个人项目，不商业化，不方便分享真实 ASMR 资源。后续开发按“个人项目实用优先”处理：

- 可以在用户主动选择目录后做只读扫描。
- 可以更快进入真实数据闭环。
- 不需要把任务拆得过碎。
- Codex / DeepSeek 额度有限，只在本地验证或高风险阶段使用。

但仍不允许自动执行危险文件操作：

```text
删除
移动
重命名
批量修复
联网抓取元数据
上传本地路径或媒体内容
```

## UI 方向

播放器和首页 UI 要高标准。后续 UI 精修参考网易云音乐：

- 沉浸播放页
- 黑胶唱片模式
- 歌词模式
- 深色背景模糊 / 毛玻璃
- 底部播放器栏
- 首页继续播放 / 最近播放 / 最近加入

工程信息收进诊断页，主界面减少 `Contract / Stub / Dry-run / Bridge / Engine` 这类开发词。

## 加速后的主线任务

| 阶段 | 任务 | 说明 |
|---|---|---|
| MVP-20 | 小样本只读 dry-run 扫描 | 已完成 |
| MVP-21 | dry-run report 正式 UI | Diagnostics 展示真实预览 |
| MVP-22 | write-index preview | 生成待写入预览，用户确认 |
| MVP-23 | 写入 library-index.json | 第一版真实索引闭环 |
| MVP-24 | UI 读取真实 index | 音声库 / 音乐库显示真实资源 |
| MVP-25 | HTMLAudio 本地播放 | mp3/wav/flac/m4a 基础验证 |
| MVP-26 | LRC / 字幕读取 | 同名 lrc/srt/vtt/ass 预览 |
| MVP-27 | 视频 / 图片外部打开 | PotPlayer / 系统默认应用 |
| MVP-28 | Windows 打包 | portable / installer |

## 文档清理策略

旧 MVP 文档保留为历史审计记录，不继续扩写。当前入口文档以这些为准：

```text
README.md
PROJECT_STATE.md
NEXT_CHAT_HANDOFF.md
RUN_ME_FIRST.md
docs/CURRENT_ROADMAP_MVP20.md
docs/ELECTRON_DRY_RUN_SCANNER_MVP20.md
```

已移除：

```text
HANDOFF_SUMMARY_MVP18.md
```
