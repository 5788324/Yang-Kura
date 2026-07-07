# MVP-28：Windows 桌面验收与打包准备

## 0. 本轮定位

MVP-28 不新增资源库业务能力，重点是把 MVP-19 ~ MVP-27 的真实桌面闭环收口成一套可在 Windows 本机执行的验收流程。

当前已经具备的链路：

```text
选择目录
→ rootPathToken
→ 只读 dry-run 扫描
→ 写入 library-index.json
→ 读取 library-index.json
→ 映射到音声库 / 音乐库 UI
→ HTMLAudio 播放本地音频
→ LRC / SRT / VTT / ASS 字幕正文读取
→ 视频 / 图片 / 文件外部打开
```

## 1. 本轮新增脚本

```bash
npm run desktop:validate-chain
npm run desktop:smoke-check
npm run desktop:acceptance-plan
npm run desktop:prepare-validation-bundle
npm run verify:mvp28-windows-desktop-validation
```

### desktop:validate-chain

完整静态验证链：

```bash
npm run verify:env
npm run lint
npm run build:electron
npm run verify:all
npm run build
```

### desktop:smoke-check

输出当前桌面环境状态：

```text
package 版本
platform
Node 版本
是否已有 dist
是否已有 dist-electron
是否安装 Electron binary
推荐本机验收流程
```

缺少 Electron binary 时只给 WARN，不阻断普通验证。

### desktop:prepare-validation-bundle

生成：

```text
desktop-validation-bundle/
```

该目录包含：

```text
dist/
dist-electron/
package.json
package-lock.json
README.md
RUN_ME_FIRST.md
docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md
README_DESKTOP_VALIDATION.txt
```

注意：这不是正式安装包，也不是签名 exe，只是桌面验收包。

## 2. Windows 本机验收流程

在项目根目录执行：

```bash
npm ci
npm run electron:install
npm run desktop:validate-chain
npm run desktop:dev
```

打开桌面窗口后手动验收：

1. 进入设置页。
2. 选择一个小样本 ASMR / 音乐目录。
3. 执行只读 dry-run 扫描。
4. 在诊断页确认扫描报告。
5. 生成 library-index.json 写入预览。
6. 用户确认后写入 library-index.json。
7. 读取并应用 index。
8. 音声库 / 音乐库出现真实资源。
9. 播放一个 mp3 / wav / flac / m4a 音频。
10. 有字幕时确认歌词页能显示 LRC / SRT / VTT / ASS 内容。
11. 对视频 / 图片 / 其他文件执行外部打开。
12. 对文件执行“在文件管理器中显示”。

再执行：

```bash
npm run desktop:preview
npm run desktop:prepare-validation-bundle
```

## 3. 必须确认的结果

| 检查项 | 通过标准 |
|---|---|
| Electron 窗口 | 能打开，不是浏览器 preview |
| 目录选择 | 使用系统目录选择器 |
| 路径泄露 | Renderer 不显示 absolutePath / file:// |
| dry-run | 能扫描小样本目录 |
| index 写入 | 只在用户确认后写 library-index.json |
| index 读取 | 能读回并映射 UI |
| 音频播放 | HTMLAudio 能播放至少 1 个真实音频 |
| 字幕读取 | 有字幕时能显示真实字幕正文 |
| 外部打开 | 视频 / 图片使用系统默认应用打开 |
| 文件管理器 | 能定位文件或目录 |
| 安全操作 | 不删除、不移动、不重命名 |

## 4. 仍然后置

```text
SQLite
下载器
元数据抓取
正式 Windows installer
签名 exe
自动更新
内置视频播放器
PotPlayer / mpv 深度控制
播放器 UI 精修
首页 UI 精修
```

## 5. 关于打包

MVP-28 没有引入 electron-builder。

原因：

```text
1. 先确认真实桌面链路能在用户本机跑通。
2. 避免为了打包先引入较大的构建依赖面。
3. 当前更需要验收目录选择、扫描、index、播放、字幕、外部打开。
```

下一步如果本机链路通过，再进入：

```text
MVP-29：Windows portable / installer 打包配置
```

## 6. 禁止事项

仍然禁止：

```text
不删除文件
不移动文件
不重命名文件
不批量修复真实媒体库
不接 SQLite
不接下载器
不联网抓元数据
不声称已经生成正式安装包
```

## MVP-28.1 收口说明

本轮只合入 Windows desktop:dev 启动修复：Windows `.cmd` 通过 `cmd.exe /d /c` 启动，避免 `spawn EINVAL`；Vite 使用 `YANG_KURA_VITE_DEV_URL` 指定端口并启用 `--strictPort`，端口占用时直接失败，避免 Electron 误连旧 localhost 页面。

本轮不进入 MVP-29，不新增 SQLite、下载器、联网元数据、播放器美化或业务功能。

## MVP-28.2 Desktop Cache Closeout

Version: 0.66.2-mvp28.2

This closeout keeps the MVP-28.1 desktop validation scope and only adds stable Electron runtime storage paths. Electron main now sets userData, sessionData, cache, logs, and crashDumps under the app data directory and passes disk-cache-dir before the browser session starts.

No SQLite, downloader, metadata fetching, UI redesign, electron-builder, portable packaging, or installer work is included in this round. MVP-29 can resume after npm registry access is available.
