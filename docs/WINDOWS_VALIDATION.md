# Windows Validation

当前推荐以 MVP-28 文档为准：

```text
docs/ELECTRON_WINDOWS_VALIDATION_MVP28.md
```

最小命令：

```bash
npm ci
npm run electron:install
npm run desktop:validate-chain
npm run desktop:dev
```

完整验收重点：

```text
选择目录
只读扫描
写入 library-index.json
读取 index
音声库 / 音乐库显示真实资源
HTMLAudio 播放真实音频
读取 LRC / SRT / VTT / ASS
视频 / 图片 / 文件外部打开
```

MVP-28 不声称已经生成正式安装包；正式 Windows portable / installer 放到后续打包轮。
