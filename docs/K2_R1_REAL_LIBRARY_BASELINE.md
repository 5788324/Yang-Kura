# K2-R1 Real Library Baseline — E:\\arsm

更新日期：2026-09-23  
来源：用户提供的 `RJ_AI_ANALYSIS-20260923.zip`  
用途：Kura Desktop 2.0 的真实规模旁证与 K2-R2/K2-R3 设计输入。

## 证据等级

该资料针对 **同一真实资源库 `E:\\arsm`** 做了完整递归扫描，因此可以作为 K2-R1-B 的真实规模证据。

但它不是 Kura 自己的 metadata-only audit：

- 音频还做了“文件大小 + 首尾各 64 KiB”筛查指纹；
- 字幕做了全文 SHA-256、规范化文本哈希、编码和时间轴解析；
- 因此扫描 I/O 比 Kura 计划中的 inventory 更重；
- 报告没有记录完整扫描 wall-clock duration 与 peak memory；
- inventory 只列文件，目录数可从路径推导非空/祖先目录，但无法证明空目录总数。

所以：**规模数据可直接采用；扫描性能数据不能冒充 Kura Scanner benchmark。**

## 真实规模

| 指标 | 结果 |
|---|---:|
| 文件总数 | 268,863 |
| 扫描容量 | 11,303,983,344,930 bytes / 10,527.65 GiB |
| 专辑目录实例 | 2,663 |
| 唯一 RJ | 2,632 |
| 含音频专辑 | 2,630 |
| 音频 | 69,285 |
| 字幕 | 111,304 |
| 普通文本 | 53,841 |
| 图片 | 29,930 |
| 视频 | 2,257 |
| 压缩包 | 2 |
| 其他 | 2,244 |
| 从文件路径推导的非空/祖先目录 | 34,716 |
| 文件路径最大目录深度 | 18 |
| 扫描错误 | 0 |

顶层真实分类：

- `新建下载`：226,206 files；
- `有字幕的`：42,657 files。

## 音频格式

| 扩展名 | 数量 |
|---|---:|
| WAV | 37,898 |
| MP3 | 30,470 |
| FLAC | 795 |
| M4A | 122 |

这说明 Kura 的本地播放、probe、缓存和 scanner 不应按“典型音乐库主要 MP3/FLAC”假设设计；当前真实 RJ 库以 **WAV + MP3** 为主。

## 目录深度

全部文件至少处于两级目录结构。进一步分布：

| 文件目录深度 | 占比 |
|---|---:|
| >= 3 | 97.39% |
| >= 4 | 81.37% |
| >= 5 | 43.39% |
| >= 6 | 12.53% |
| >= 8 | 0.75% |
| >= 10 | 0.37% |
| >= 12 | 0.25% |
| 最大 | 18 |

结论：RJ 的 Folder Tree 不能简化为固定“作品/音轨”两层结构；数据库和 UI 必须保留任意相对路径层级。

## 每专辑规模

| 指标 | P50 | P90 | P95 | P99 | Max |
|---|---:|---:|---:|---:|---:|
| 文件数 | 85 | 167 | 224 | 444.6 | 1,244 |
| 音频数 | 21 | 47 | 62 | 114.4 | 310 |
| 字幕数 | 36 | 74 | 96 | 168.3 | 568 |
| 时间轴文本 | 53 | 108 | 132 | 240 | 853 |

平均：

- 100.96 files / album；
- 26.02 audio / album；
- 41.80 subtitle / album。

因此 K2-R2 不应把 Track/Subtitle/Attachment 以巨大嵌套 JSON 常驻一个 Work 对象中；Work 详情也应按需查询分页或分组。

## 字幕与附件事实

字幕/文本远多于音频：

- subtitle：111,304；
- text：53,841；
- VTT：60,032；
- LRC：50,896；
- SRT：365；
- ASS：11；
- PDF：1,907；
- 图片：29,930；
- 视频：2,257。

这直接支持 Kura RJ 数据模型采用：

```text
Work
├─ Tracks
├─ Folder Nodes
├─ Subtitles
└─ Attachments
   ├─ Image
   ├─ Text
   ├─ PDF
   ├─ Video
   └─ Other
```

不能继续把所有非音频资源当成边角数据。

## 重复资源事实

扫描报告发现：

- 音频筛查指纹重复：3,137 groups / 6,991 files；
- 字幕完整文件重复：38,014 groups / 152,338 files；
- 规范化文本重复：25,781 groups / 155,685 files。

音频指纹只是筛查指纹，不是完整哈希证明。

对 Kura 的影响：

- Catalog 必须区分 **logical media identity** 与 **physical SourceRef**；
- 同一 Track/Subtitle 未来可能有本地、OpenList、缓存、不同格式副本；
- 不以绝对路径直接作为媒体 ID；
- hash/fingerprint 作为可选辅助匹配字段，不能作为唯一业务主键。

## 现有 library-index.json 与真实盘点差距

其他项目同时读取到现有 Index：

| 对象 | library-index | 文件系统盘点 | 差值 |
|---|---:|---:|---:|
| collections / album dirs | 2,113 | 2,663 | -550 |
| tracks / audio files | 55,932 | 69,285 | -13,353 |
| subtitles | 85,061 | 111,304 | -26,243 |

按真实盘点为分母，旧 Index 覆盖约：

- collections：79.35%；
- tracks：80.73%；
- subtitles：76.42%。

这不是严格的一一业务等价比较，但足以证明持续下载下 **一次性 JSON Index 会快速陈旧**。K2-R3 必须支持增量发现和删除/变更状态，而不能继续依赖偶发全量重建。

## 时长旁证

750/750 条 ffprobe 样本成功，估算：

- 总音频时长约 16,092.5 h；
- 平均每专辑约 6.1 h；
- 中位约 4.7 h；
- P90 约 10.9 h；
- 最大单专辑估算约 197.8 h。

这是规划估算，不是全量精确 duration census。

它说明 RJ 播放状态必须按 long-form audio 设计：精确续播、Work/Track 两级进度、书签、睡眠定时和跨设备状态都应作为长期一等数据。

## 对 K2-R2 / K2-R3 的直接约束

K2-R2 SQLite 至少要独立建模：

- roots；
- works / collections；
- folder_nodes；
- tracks；
- media_sources；
- subtitles；
- attachments；
- artwork；
- scan_entries / directory_state；
- user_state；
- playlists / playlist_items；
- FTS projection。

K2-R3 Scanner 必须：

- 流式批处理；
- 增量 scan；
- directory/file mtime + size fast path；
- 不要求完整内容哈希；
- 不把 268k entry 一次性返回 Renderer；
- 支持取消、进度和 resume；
- 新下载文件可增量进入 Catalog；
- 真实媒体文件默认只读。

## 仍待补充

该资料不能关闭的项目：

1. Kura metadata-only scanner 的 wall-clock 基准；
2. peak RSS / heap；
3. Kura SQLite 首次导入 268k entries 的实际耗时；
4. SQLite 增量二次扫描耗时；
5. UI 查询/分页/封面真实体验；
6. 空目录精确总数。

这些都可以在后续 K2-R2/R3 实现后再做，不再阻塞 SQLite schema 设计。
