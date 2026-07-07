# HANDOFF MVP-83 → MVP-84

from: `0.121.0-mvp83`
to: `0.122.0-mvp84`

## 本轮主题

MVP-84：导入器 / 下载生态 / 项目总规划并入。

## 完成内容

- 实际尝试标准 git 路径，当前环境 DNS 无法解析 `github.com`。
- 将 `Yang-Kura_项目总规划与讨论总结.md` 的关键结论吸收到源码文档。
- 新增导入器优先、下载生态后置、metadata source merge、mpv 长期后端、安全文件操作边界等策略模型。
- 诊断页新增 MVP84 规划并入区。
- 新增 verifier，确保后续不会误以为已经实现导入器 / 下载器 / mpv。

## 不做事项

- 不接 SQLite。
- 不接真实下载器。
- 不接 Provider。
- 不接 mpv。
- 不复制 / 移动 / 删除 / 重命名真实媒体文件。
- 不改扫描 / 写 index / 播放链路。

## 下一步

建议 MVP-85 做 `ImportTask / DownloadTask / Manifest / MetadataSource` 数据模型合同。
