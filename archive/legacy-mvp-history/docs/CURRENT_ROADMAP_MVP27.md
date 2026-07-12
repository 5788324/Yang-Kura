# Yang-Kura Current Roadmap — MVP-27

当前版本：`0.65.0-mvp27`

## 已完成主线

```text
选择目录
→ dry-run 扫描
→ 写入 library-index.json
→ 读取并映射到 UI
→ HTMLAudio 播放本地音频
→ 读取 LRC/SRT/VTT/ASS 字幕
→ 视频/图片/文件外部打开
```

## MVP-27 完成内容

```text
open-external-file IPC
open-in-file-manager IPC
系统默认应用打开视频/图片/文件
文件管理器定位 tokenized 文件
Renderer 仍不接收 absolutePath / file://
```

## 下一步建议

MVP-28：Windows 打包与本机验收。

建议合并验证：

```text
npm run electron:install
npm run desktop:dev
选择小样本目录
扫描 / 写 index / 读取 index / 播放音频 / 读字幕 / 外部打开视频图片
npm run desktop:preview
```

SQLite、下载器、元数据抓取和播放器 UI 精修继续后置。
