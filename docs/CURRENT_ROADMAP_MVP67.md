# CURRENT ROADMAP — MVP-67

Version: `0.105.0-mvp67`

## 定位

MVP-67 是 Beta 0.1 RC 收口轮，不新增功能，只固化真实样本回归通过结果。

## 已确认真实链路

用户本机已确认：

1. 选择音声库目录。
2. 一键扫描并应用。
3. 音频可播放。
4. 歌词可读取。
5. 图片可打开。
6. 视频可打开。

## 本轮新增

- `src/services/betaRcCloseoutService.ts`
- `docs/BETA_RC_CLOSEOUT_MVP67.md`
- `scripts/verify-mvp67-beta-rc-closeout.mjs`
- `HANDOFF_MVP66_TO_MVP67.md`
- `PACKAGE_MANIFEST_MVP67_HANDOFF.txt`

## 继续保持

- Local JSON Index first。
- SQLite 后置。
- 下载器后置。
- 元数据抓取后置。
- mpv 后置。
- 不删除 / 移动 / 重命名真实媒体文件。
- 不向 Renderer 暴露 `absolutePath` 或 `file://`。
