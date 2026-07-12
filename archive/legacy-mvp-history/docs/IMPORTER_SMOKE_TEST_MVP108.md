# 导入器自动化 Smoke Test

## 命令

```bash
npm run test:importer:smoke
```

## 测试范围

该脚本只在系统临时目录创建假文件，不触碰真实媒体库。

覆盖：

```text
copy-only：复制 RJ 音频 / 封面 / 字幕，源文件保留，重复目标跳过不覆盖
library-index patch：创建 backup，再写 collections / tracks / covers / subtitles
move-only：移动一个小样本文件，源文件消失，目标存在
operation log：写入 JSONL，保留 sanitized flags
```

## 不能证明什么

该脚本不是 GUI 测试，也不是打包版测试。它不能替代：

```text
Electron 实机启动
真实目录选择 dialog
真实用户点击 copy/move
打包版回归
```

## 当前结论

在临时目录内，导入器核心文件操作语义可以成功跑通。下一步仍建议做人工小样本回归。
