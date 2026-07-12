# PROJECT_ROADMAP

## 当前冻结点

```text
稳定主线：0.167.0-mvp129
GitHub main：316d8127d6d423a1d9e6930b8b804a3bac11140e
Round 6 最终 Git 合入：PASS
下载器：冻结；MVP130 独立封存，禁止合入
```

## 阶段 A：稳定化与 Git 合入（已完成）

- Windows mpv fixture 和 electron-builder 发布门禁修复：PASS。
- `verify:stable` 当前稳定回归链：PASS。
- portable / NSIS installer / 启动 / 卸载：PASS。
- 依赖精简、历史资料归档和入口文档统一：完成。
- MVP121～MVP129 已提交并推送 main：`316d8127d6d423a1d9e6930b8b804a3bac11140e`。

## 阶段 B：真实日常使用观察（当前，预计 1～3 轮）

只处理明确问题：

- 真实资源库浏览、搜索和页面操作。
- 长音频播放、Seek、暂停、切歌和进度恢复。
- 实际字幕显示、mpv fallback、播放退出和残留进程。
- 小样本 copy-only；必要时小样本 move-only。
- 元数据编辑、Provider 和索引维护的真实交互。

禁止在没有真实痛点时继续拆微功能。

## 阶段 C：候选增强方向

用户根据实际需求只选择一个方向，不并行展开：

| 方向 | 启动条件 |
|---|---|
| mpv 长期稳定性/播放设备设置 | 真实使用发现播放问题时 |
| 批量元数据 | 单项编辑稳定且确有批量需求时 |
| 字幕与本地转录衔接 | RJ-LRC-Local 工作流准备接入时 |
| SQLite 评估 | JSON Index 出现真实性能或一致性瓶颈时 |
| 系统媒体控制 | 播放主链稳定后 |
| 下载器 | 用户明确恢复 MVP130 路线后 |

## 下载器路线

MVP130 当前只作为独立实验包保存。只有用户明确恢复下载器方向时，才能从原始 MVP130 ZIP 建立独立分支：

```text
任务持久化
→ Range 断点续传
→ 暂停/继续
→ Provider 合同
→ 单一 RJ Provider
```

staging 与正式媒体库必须保持分离，不允许自动写正式媒体库。
