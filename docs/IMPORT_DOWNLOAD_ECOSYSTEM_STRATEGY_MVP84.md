# MVP-84 导入器 / 下载生态策略

version: `0.122.0-mvp84`

## 1. 总结

Yang-Kura 后续路线调整为：先把已有资源安全入库，再逐步吃掉下载器、元数据和播放器后端。

```text
先导入已有 RJ / 音乐资源
→ 建 ImportTask / DownloadTask / MetadataSource 类型模型
→ 导入器 UI 壳，只预览
→ RJ / 音乐识别
→ 冲突检测
→ 目标路径规划
→ copy only
→ move with operation log
→ 自研 DownloadEngine / Provider
```

## 2. 导入器优先

第一阶段导入器支持：

| 类型 | 识别方式 | 目标 |
|---|---|---|
| RJ 专辑 | 文件夹名 / RJ号 / metadata.json / txt | 进音声库 |
| 流行音乐专辑 | ID3 / FLAC tags / 文件夹名 | 进音乐库 |
| 流行音乐单曲 | 音频标签 / 文件名 | 进音乐库单曲区 |
| 混合目录 | 生成冲突报告 | 不自动导入 |

## 3. 文件操作边界

旧边界是：不删除 / 不移动 / 不重命名真实媒体文件。

新边界是：允许未来受控复制 / 移动 / 归档，但必须满足：

```text
导入预览
→ 目标路径展示
→ 冲突列表
→ 选择复制 / 移动
→ 生成操作计划
→ 用户确认
→ 执行
→ 写操作日志
→ 失败记录
```

第一阶段只允许 `copy only`。`move with operation log` 后置。永久删除仍不做。

## 4. 下载器生态

下载器不再长期依赖 arsm-downing / musicdl。它们定位为：

```text
参考代码 / 逻辑样本 / 迁移来源
```

未来自研下载生态：

```text
DownloadEngine
SourceProvider
DownloadManifest
Importer
```

第一步不是下载，而是导入已有资源。

## 5. 元数据来源

元数据分来源保存，不合成一份直接覆盖：

```text
localFolder
localText / json / nfo
dlsite
asmrOne
userOverride
```

优先级：

```text
userOverride > 本地文件结构 > DLsite > ASMR.one > 下载器猜测
```

## 6. 播放器后端

长期播放器路线：

```text
音声 / 音乐：mpv 子进程后端
HTMLAudio：fallback
视频 / MV / 图片：外部打开
```

本轮不实现 mpv。

## 7. 加密格式边界

网易云 / QQ 等来源只导入用户合法获得、客户端可正常导出的普通音频文件，例如 mp3 / flac / wav / m4a。

不做：

```text
DRM / 加密格式绕过
平台私有加密缓存解密器 / 不做解密器
破解下载器
```
