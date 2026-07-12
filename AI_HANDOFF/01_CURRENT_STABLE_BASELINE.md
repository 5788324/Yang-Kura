# 当前稳定基线

## 产品与技术

Yang-Kura 是个人 Windows 本地音频媒体库：

- React + Vite + TypeScript + Electron
- ASMR/RJ 与普通音乐双库
- Local JSON Index 为当前正式数据路线
- SQLite 后置
- HTMLAudio + mpv 子进程后端/fallback

## Git 与发布状态

```text
版本：0.167.0-mvp129
GitHub main：316d8127d6d423a1d9e6930b8b804a3bac11140e
HEAD 与 origin/main：一致
Round 4 Windows 发布门禁：PASS
Round 5 清理与依赖精简：PASS
Round 6 最终 Git 合入：PASS
```

Round 6 已确认：

- `verify:stable` PASS
- portable 与 NSIS installer 构建 PASS
- portable 启动无黑屏
- installer 安装、启动、卸载 PASS
- 退出后 Yang Kura / Electron 残留进程为 0
- 0 high / critical；保留 1 个 Electron moderate
- 无 absolutePath、`file://`、密钥和真实用户数据泄漏

## 冻结边界

- MVP130 原始实验包 SHA-256：`824c914f844b1ac57391df8ebb5c1f30c8b40903145b3a66e6a13e95e5413efe`
- MVP130 不在稳定主线，不得混入 main。
- 不自动开始 MVP131。
- 不因旧 Roadmap 自动进入下载器、SQLite 或大重构。
