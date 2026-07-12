# PROJECT_STATE

## 当前状态

```text
版本：0.167.0-mvp129
状态：MVP129 稳定候选，进入最终清理与 Git 合入准备
GitHub main：0.158.0-mvp120 / 55e33b3
MVP130：实验性下载器分支，暂不合入
MVP131：停止
```

## 验收状态

- 自动化核心链：PASS。
- Windows mpv fixture：PASS。
- `verify:stable`：PASS。
- Electron 严格 smoke：PASS。
- portable：构建与实际启动 PASS，无黑屏。
- NSIS installer：安装、启动、卸载 PASS。
- 卸载后安装目录移除，用户 `%APPDATA%\Yang-Kura` 按配置保留。
- Yang Kura / Electron 残留进程：0。
- 依赖审计：0 high，1 Electron moderate 非阻塞项。

## 已完成主线

1. Electron 桌面壳、目录选择和安全 token 边界。
2. 本地扫描、Local JSON Index 写入/备份/读取。
3. 音声库、音乐库、详情、歌单、队列和播放历史。
4. HTMLAudio、mpv 后端、fallback、Seek 合并和进程回收。
5. LRC/SRT/VTT/ASS 字幕与外部文件打开。
6. copy-only 完整导入闭环和 move-only 小样本闭环。
7. 本地元数据编辑、备份/恢复和单 RJ DLsite Provider。
8. 50,000 曲目性能基准。
9. 缺失文件检查、受控索引清理、备份恢复和维护历史。
10. Windows portable / installer 发布链。

## 仍未完成或未充分实测

- 真实 mpv.exe 的多小时日常播放与长期 named-pipe 稳定性仍需要持续使用观察。
- 真实超大媒体库长期压力测试尚未完成；当前是生成 50,000 曲目模型通过。
- SQLite 是否必要尚未决定。
- 系统媒体控制、播放设备设置、批量元数据和下载生态均未进入稳定主线。
- MVP130 只验证了 Direct URL 下载基础，不属于当前稳定包。

## 当前风险

- `DiagnosticsPage.tsx`、`electron/main.ts`、`ImporterPage.tsx` 和 `SettingsPage.tsx` 仍较大；稳定阶段不做高风险重构。
- Electron 依赖有一个 moderate 提示，当前不做盲目升级。
- GitHub main 落后于稳定候选，必须由 Codex 做一次有意图的合入。
