# MVP-27 Electron External Open

## 目标

MVP-27 让 Yang-Kura 可以对真实 `library-index.json` 中的本地条目执行外部打开：

```text
rootPathToken + relativePath
→ Electron main 校验 token 与相对路径
→ 系统默认应用打开文件
→ 或在系统文件管理器中定位文件
```

## 新增 IPC

```text
yang-kura:external:open-file
yang-kura:external:open-in-file-manager
```

## 允许行为

```text
打开视频 / 图片 / 音频 / 文本 / 压缩包
在文件管理器中定位文件
打开用户选择的 root 目录
```

## 禁止行为

```text
不内置视频播放器
不回写外部播放器播放进度
不删除文件
不移动文件
不重命名文件
不复制文件
不执行脚本 / 程序类文件
不向 Renderer 返回 absolutePath
不向 Renderer 返回 file://
```

## 当前策略

视频、MV、视频类 ASMR、图片、CG、封面大图先使用系统默认应用打开。后续可以在设置中配置 PotPlayer / mpv 路径，但 MVP-27 不做播放器进程控制。
