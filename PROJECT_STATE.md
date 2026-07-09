# PROJECT_STATE

## 当前基线

```text
Yang-Kura：0.146.0-mvp108
阶段：导入器阶段收尾后暂停开发，进行整理审查
```

## 项目定位

Yang-Kura 是个人本地音频媒体库，不商业、不对外发布、不作为开源产品运营。主线是本地资源管理、播放、导入和后续下载/元数据扩展。

```text
React + Vite + TypeScript + Electron
Local JSON Index 优先
SQLite 后置
ASMR/RJ + 普通音乐双库
中文 UI 优先
```

## 当前完成度

| 模块 | 状态 |
|---|---|
| UI 产品壳 | 已基本成型，主界面仍可继续美化。 |
| 真实资源库链路 | 已可用：选择目录、扫描、写/读 index、显示资源。 |
| 本地播放 | HTMLAudio 基础可用。 |
| 字幕读取 | LRC / SRT / VTT / ASS 基础读取可用。 |
| 外部打开 | 视频 / 图片 / 文件外部打开可用。 |
| 打包 | portable / installer 基础链路已建立。 |
| copy-only 导入 | 已闭环。 |
| move-only 导入 | 小样本 executor 已闭环；暂不放开大批量。 |
| 下载器 | 后置。 |
| 元数据 Provider | 后置。 |
| SQLite | 后置。 |
| mpv 后端 | 后置。 |

## 导入器审查结论

```text
copy-only 可以作为当前推荐日常导入方式。
move-only 仅建议小样本使用，不建议直接大批量。
导入器主页面已收口，工程说明保留给 AI 维护。
下一步先人工小样本回归，不急着开新大功能。
```

## 安全边界

当前项目是个人本地项目，边界不用按企业级/公网/多人协作设计；但仍保留以下硬规则：

```text
真实文件操作必须可预览、可确认、可记录。
禁止自动覆盖。
禁止自动删除。
禁止自动清理源目录。
失败应停止或明确记录。
Renderer 不接收 absolutePath / file://。
SQLite、下载器、元数据、mpv 都不在当前阶段插队。
```

## 本轮整理

本轮没有新增业务功能；主要做：

```text
更新项目介绍文档
更新项目状态 / 路线 / 交接文档
新增导入器 smoke test
移除源码包内 .npm-cache
新增 .gitignore
保留历史 handoff/manifests 以兼容 legacy verifiers
```
