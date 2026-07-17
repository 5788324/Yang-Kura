# U39-G 最终综合验收

## 结论

U39-A～U39-F 已完成产品修复、日常体验治理和增量架构防回退。本文件定义 U39 阶段的最终综合验收；对应 Pull Request 只有在同一候选提交完成完整 Windows 回归与 portable/NSIS 验收后才允许合并。

U39 收口不代表技术债清零，也不代表 Issue #66 关闭。它表示：审计中可复现且高收益的问题已经处理，当前主线不再按预设轮次继续制造内部重构任务。

## 固定基线

| 阶段 | 合并提交 | 结果 |
|---|---|---|
| U39-A | `8431829427dbe3da86b976a18d124a7a119c5e8f` | 播放器底栏与弹层进入语义主题体系 |
| U39-B | `f87813cb219f8d298c54eb4fd7793d1038129b5a` | 设置页建立独立 AI 维护入口 |
| U39-C | `77f0152a80aea9fdfeaaf33f046d9a47d69f6d2e` | root token 授权跨重启恢复 |
| U39-D | `5a6411da2a5dbdb90ef143061f293e6f7160c94a` | 雾光象牙浅色主题达到自动对比度门槛 |
| U39-E | `b0842eb335f937748d580c6e7aee990537307224` | 音乐库与导入器空状态真实可信 |
| U39-F | `6e8a2eb187d112a886928ee889951f53b58586b5` | 新增架构问题由增量门禁阻止 |

版本保持 `0.169.0-beta.2`。既有 Beta 2 Release、tag 和远端资产不修改。

## 最终验收链

`.github/workflows/u39-final-acceptance.yml` 使用两个 Windows job：

1. 第一台 runner 执行 npm 高危/严重依赖审计、TypeScript、Renderer/Electron 构建、U28～U32、U39-A～U39-F、stable regression、portable/NSIS 构建及安装/重复安装/卸载/数据保留验收；
2. 第一台 runner 上传同一候选的安装包和全部基础证据；
3. 第二台全新 runner 下载这些安装包，独立验证 portable 与 NSIS 的完整首页内容和零残留进程；
4. 页面验收通过后写入 `final-execution-record`，并上传最终 Artifact。

拆分到全新 runner 不是降低门槛，而是隔离完整 Electron E2E 与安装测试产生的进程、用户目录和系统状态，避免前序状态污染页面验收。

最终 Artifact 保留 30 天，包含运行清单、E2E 证据、打包验收结果和候选安装包。

## 收口后的工作方式

U39-G 合并后，不再存在预排的“下一轮 U39”任务。后续只从以下来源启动工作：

- 用户实际使用发现的 Bug；
- 明确的日常体验问题；
- 用户主动提出的小型功能；
- 修改某条链路时顺带处理的局部技术债；
- 依赖、Windows、Electron 或安装器变化带来的兼容问题。

## 继续保留的长期治理项

Issue #66 继续开放，跟踪：

- `SettingsPage.tsx` 真实维护工具按功能逐块迁移；
- `DiagnosticsPage.tsx` 历史运行时内容归档；
- `electron/main.ts` 与 `src/types.ts` 在触碰对应领域时继续下沉；
- 当前 1 个历史相对导入环在触链时清理；
- 历史 MVP verifier 与 package 元数据逐步退出日常路径；
- 新目录和迁移目录继续收紧 TypeScript。

这些事项没有独立用户收益时不得为了清单归零而启动大规模搬迁。
