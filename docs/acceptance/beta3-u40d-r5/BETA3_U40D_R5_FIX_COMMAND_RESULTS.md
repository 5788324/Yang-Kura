# Yang-Kura Beta 3 U40D/R5 修复验收命令结果

日期：2026-07-19
R5 fresh clone：C:\Users\YANG\AppData\Local\Temp\YangKura-Beta3-U40D-R5\repo
基线提交：84e3caabec37a8de3843a51068b15bce76385524
独立 Profile：C:\tmp\YangKura-R5-Debug\profile
真实库：E:\arsm

## 代码修复

`src/shared/ui/TrackRow.tsx` 将音轨主区域从父级 `onClickCapture` 改为主按钮自身直接 `onClick={onActivate}`，诊断标记从 `captured` 改为 `direct`。本轮未执行 Git 提交、推送或其他 Git 写操作。

## 自动化结果

- `npm.cmd run lint`：PASS
- `npm.cmd run build`：PASS，Vite 1805 modules
- `npm.cmd run build:electron`：PASS
- `node scripts/test-beta3-rj-detail-playback-entry.mjs`：PASS
- `node scripts/verify-beta3-runtime-hardening.mjs`：PASS
- `node scripts/verify-handoff.mjs`：PASS
- `node scripts/run-u40d-focused-tests.mjs`：PASS
- `node scripts/verify-u28-library-reconciliation.mjs`：PASS
- `node scripts/verify-u30-ui-fast-track.mjs`：PASS
- `npm run verify:mvp126-large-library-performance`：PASS
- `npm run test:mvp129-index-maintenance`：PASS
- `npm run verify:stable`：PASS
- `node scripts/test-u40b-full-product-journey.mjs`：PASS

## 实机结果

- E:\arsm 读取完成：137 个作品/专辑、6979 条音轨。
- RJ00331318：14 条可播放音轨、14 条字幕音轨。
- 第一条主区域：PASS；queue=14，duration=3:12，进度推进。
- 暂停约 4 秒进度不变，恢复后继续：PASS。
- Seek 到约 1:16：PASS。
- 第二条行尾入口：PASS；duration=14:43，进度推进。
- 上一首/下一首：PASS。
- 静音/取消静音：PASS；音量面板显示 75%。
- 全屏歌词入口：出现“歌词浮窗已开启”提示。
- 播放后端：HTMLAudio；无错误。
- 重启后自动读取真实库，首页显示“继续播放”和“最近播放”；点击继续后第二条音轨约 3:00/14:43 继续推进。
- 第二次正常关闭后 Yang-Kura/Electron/mpv 进程数：0。
