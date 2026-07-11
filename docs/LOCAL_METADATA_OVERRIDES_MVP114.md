# MVP114 本地元数据覆盖层

## 目标

扫描数据描述“磁盘上有什么”，用户覆盖描述“界面应该如何显示”。两者分开存储，避免重新扫描覆盖人工修改。

## 存储

浏览器本地键：

`yang_kura_metadata_overrides_v1`

数据版本：`1`。

## 当前已接入

ASMR 作品：标题、社团、声优、发售日期、简介、标签、评分、收听状态、备注。

音乐专辑和曲目已经定义模型与持久化方法，但本轮不增加新的音乐编辑界面。

## 合并顺序

`用户本地覆盖 > library-index 扫描数据 > Demo fallback`

## 安全边界

- 不修改 MP3/FLAC/WAV/M4A 文件标签；
- 不写真实媒体文件；
- 不联网；
- 不接元数据 Provider；
- 不接 SQLite；
- 不保存 absolutePath 或 file URL；
- 不改变 copy-only / move-only 导入执行器。
