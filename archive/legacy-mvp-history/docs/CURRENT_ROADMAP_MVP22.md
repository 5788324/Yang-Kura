# Yang-Kura 当前路线 / MVP-22

## 当前版本

```text
0.60.0-mvp22
```

## 当前主线

```text
React + Vite + TypeScript
Electron 桌面壳
Local JSON Index 优先
真实目录选择 + tokenized root
真实只读 dry-run 扫描
Dry-run report + library-index 写入预览
```

## 已完成阶段

| 阶段 | 状态 | 说明 |
|---|---|---|
| MVP-01 ~ MVP-18 | PASS | UI 原型、fixture scanner、Electron 合同、runtime probe、目录选择 stub/合同 |
| MVP-19 | PASS | 真实 Electron 目录选择 dialog + tokenized root，不暴露真实路径 |
| MVP-20 | PASS | 用户主动选择目录后的只读 dry-run 扫描 |
| MVP-21 | PASS | dry-run report 持久化并在 Diagnostics 正式展示 |
| MVP-22 | PASS | 生成 library-index.json 写入预览，不真正写文件 |

## 当前仍未完成

```text
真实写入 library-index.json
UI 读取真实 library-index.json
真实本地音频播放
LRC / SRT / VTT 读取
视频 / 图片外部打开
Windows 打包
SQLite
下载器
元数据抓取
播放器页 / 首页 UI 精修
```

## 下一步建议

```text
MVP-23：真实写入 library-index.json
MVP-24：UI 读取真实 library-index.json
MVP-25：HTMLAudio 本地播放验证
MVP-26：LRC / 字幕读取
MVP-27：视频 / 图片外部打开
MVP-28：Windows 打包
```

## UI 方向备注

主界面中文、媒体感优先。工程信息集中放到诊断页 / 开发者信息区。

后续播放器和首页 UI 精修应参考网易云音乐：

```text
沉浸式播放器页
黑胶唱片模式
歌词模式
底部播放器栏
深色毛玻璃 / 背景模糊
继续播放 / 最近播放 / 最近加入
```

## 当前安全边界

个人项目实用优先：允许用户主动选择目录后做只读扫描和 index 写入预览。

仍禁止：

```text
删除文件
移动文件
重命名文件
批量修复
联网抓元数据
向 Renderer 返回 absolutePath
向 Renderer 返回 file://
```
