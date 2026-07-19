# Beta 3 阻断状态

## 当前判定

```text
PR：#91
分支：release/beta3-daily-closeout
远端 R5 HEAD：84e3caabec37a8de3843a51068b15bce76385524
状态：R5 CI 全绿；Windows 实机 PASS；TrackRow 直接点击加固仍为本地未提交 R6 变更
发布：PARTIAL / NO-GO
Beta 3 Release：不存在
```

## 最新 R5 实机证据

真实资源库：`E:\arsm`。

- 137 个作品或专辑、6979 条音轨；
- RJ00331318：14 条可播放音轨和 14 条字幕音轨；
- 第一条主区域 queue=14、duration=3:12、progress 推进；
- pause/resume、Seek 约 1:16；
- 第二条行尾 duration=14:43、progress 推进；
- 上一首/下一首、音量/静音、歌词浮窗入口；
- HTMLAudio，无播放错误；
- 同 Profile 重启后自动读库并继续第二条；
- 关闭后 Electron/mpv 进程为 0；
- 音频 8086、字幕 11149、封面 4895、专辑目录 267，均未减少。

| 编号 / 门禁 | 状态 | 证据 / 待办 |
|---|---|---|
| B3-MAJ-001 | PASS | 真实 WAV duration/progress、pause/resume/seek 正常 |
| B3-MAJ-002 | PASS | 默认 HTMLAudio，不再产生 mpv ENOENT |
| B3-MAJ-003 | PASS | 重启自动读库和继续播放正常 |
| B3-MAJ-004 | PARTIAL | 自动 verifier PASS；需真实多专辑封面视觉核对 |
| TrackRow direct activation | 待提交 | R5 实机工作区已 PASS，R6 源码包将其固化 |
| Importer transaction | 待验收 | 临时小样本 copy/move/conflict/rollback/OperationLog |

## 用户确认的真实库边界

- `E:\arsm` 可以直接扫描、读取和更新 Index；
- `library-index.json` 与 backup 可创建、覆盖和更新；
- 用户仍在持续下载资源，Index 和文件总数变化属于正常状态；
- 大库读取超过 25 秒不作为失败；
- 只禁止删除、破坏、异常移动或覆盖音频、字幕、封面和专辑目录。

## 本轮修复

### HTMLAudio

- `yang-kura-media://` 不再直接把 `file://` 交给 `net.fetch`；
- main 侧明确返回 MIME、`Content-Length`、`Accept-Ranges`；
- 支持单段 `Range`、206 和 416；
- 音频通过 Node stream 输出，避免读取完整长音频后才返回。

### mpv

- 新 Profile 默认仅使用 HTMLAudio；
- 用户仍可在设置中显式启用“优先 mpv”；
- 显式启用时，main 先检测安装状态；未安装则直接回退，不再进入 mpv backend spawn。

### 重启与大 Index

- 真实大 Index 只保留在当前 Renderer 运行时；超过 2 MB 不再写入 localStorage；
- 不再把由 Index 派生出的完整 RJWorks/MusicAlbums 再复制保存到 localStorage；
- 启动时从持久化 root token 自动重新读取磁盘上的 `library-index.json`；
- 旧派生缓存超过 1 MB 或已有真实 root 授权时自动清理；
- 大库读取等待门限由 15 秒调整为 120 秒。

### 封面

- 扫描器对每个 collection 独立评分封面候选；
- 支持 `cover/folder/front/jacket`、RJ 编号文件名、作品目录同名图片和普通图片兜底；
- 小图标、logo、banner 和 sample 图降低优先级；
- umbrella collection 被归一化拆分时，每个实际 RJ 重新选择自己目录下的封面；
- 找不到真实封面时使用每个作品独立生成的占位图，不继承其他作品封面；
- `CoverArtwork` 的 `src` 改变时重置加载失败状态。

## 自动验证

已通过：

- TypeScript lint；
- Renderer production build；
- Electron build；
- 诊断探针表达式与伪 CDP 自检；
- Range 解析、MIME、封面候选唯一性；
- umbrella collection 拆分后独立封面映射；
- 大 Index 运行时缓存与启动恢复源码门禁。

本执行环境因无法从 GitHub 下载 Electron 二进制，不能完成本地 Electron GUI E2E；该项交由 GitHub Actions 和后续固定 SHA Windows 实机复测。

## 下一门禁

1. Codex / DeepSeek 从 `84e3caab...` 应用 R6 源码包，单一提交、单次推送；
2. 新 SHA 的 Branch、Player Fast、U40-B、U40-D 和文档/架构门禁通过；
3. 固定新 SHA 短版复核两个播放入口和进程收尾；
4. 抽查至少 12 个真实 RJ/专辑封面，确认独立映射；
5. `%TEMP%` 小样本完成导入事务、冲突、失败回滚和 OperationLog；
6. 必要项全部 PASS 后才允许合并和 Beta 3 发布。


## R4 CI 失败复核

- R4 的 Documentation、Architecture、Branch、Player Fast、U32、Beta 3 assets 等工作流均通过。
- 唯一失败位于 U40-D 的 `Full product journey regression`，不是真实库或播放器本体结论。
- 旧 U40-B fixture 在存在持久授权时仍写 `sqlite_rj_works/sqlite_music_albums`；当前产品会主动删除这些旧派生缓存。
- 同时，持久化播放队列会按隐私规则移除 `rootPathToken`，所以旧测试最后等待的 `u29SourceReady` 无法成立。
- 修复后 fixture 生成真实 UTF-8 BOM `library-index.json`，使用正式“读取已有记录”链路，再从 RJ 详情页启动真实 tokenized queue。
- U40-D workflow 将 focused 静态验证和完整 Electron E2E 分开；文档/验证器修改不再无条件运行整套 Windows Journey。
- ChatGPT 后续只读拉取仓库并交付完整源码包；Codex / DeepSeek 负责应用、单一提交和推送，Codex 继续负责固定 SHA 的真实 Windows 实机验收。
