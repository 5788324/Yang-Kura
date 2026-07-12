# MVP-84 当前路线：导入器 / 下载生态规划并入

version: `0.122.0-mvp84`

## 本轮目标

本轮不是直接开导入器真实功能，而是把 `Yang-Kura_项目总规划与讨论总结.md` 的路线吸收到项目源码文档和诊断页：

- 导入器 / 入库器成为下一阶段第一优先级。
- 下载器从“外部工具依赖”调整为后续自研生态。
- arsm-downing / musicdl 仅作为参考经验，不直接并入主线。
- mpv 子进程后端作为长期播放器路线，HTMLAudio 继续保底。
- 元数据改为分来源保存，userOverride 最高。
- 文件操作边界从绝对禁止调整为“受控 copy / move”，但第一阶段仍只规划，不执行。
- GitHub 推送标准路径已尝试，当前环境 DNS 无法解析 github.com。

## 下一阶段建议

`MVP-85`：ImportTask / DownloadTask / Manifest / MetadataSource 数据模型合同。

## 本轮不做

- 不接 SQLite。
- 不接真实下载器。
- 不接 ASMR.one / DLsite / 网易云 / QQ Provider。
- 不接 mpv。
- 不复制 / 移动 / 删除 / 重命名真实媒体文件。
- 不改扫描 / 写 index / 播放链路。
