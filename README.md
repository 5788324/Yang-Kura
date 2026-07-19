# Yang-Kura

> 当前公开版本：`0.170.0-beta.3`
> 公开标签：`v0.170.0-beta.3`
> 当前 `main`：`8a92978bbd07aa9f490ec15c9037366793168e2c`
> 本地候选：U41-B + U41-C 日常入口与运行时补丁
> 正式稳定版目标：`1.0.0`
> 1.0 发布结论：`NO-GO`

Yang-Kura 是个人使用的 Windows 本地音频媒体库，面向 ASMR/RJ 音声与普通本地音乐。技术栈为 React、Vite、TypeScript、Electron；资源库采用 Local JSON Index。

## 当前事实

- Beta 3 已通过 PR #91 合并并发布为 `v0.170.0-beta.3`。
- U41-A 已完成全产品页面、按钮、路由、模块和历史代码审计。
- U41-B 本地候选已把日常 Importer 接到真实 tokenized copy/move 事务，删除伪数据刷新，并建立页面版本单一来源。
- Importer production chunk 已从约 255 KB 降到约 22 KB；旧历史模型不再进入生产依赖图。
- U41-C 已在 U41-B 累积候选上完成 Electron 39.8.10、LF fixture、TopBar live region 和维护文案；U41-B/C 的 Windows 可见流程与打包仍需 Draft PR CI 和 Codex 实机，当前不能宣布 1.0 GO。

## 已完成能力

- Windows Electron、portable 与 NSIS；
- ASMR/RJ 与普通音乐双资源库；
- Local JSON Index 写入、读取、备份、恢复和维护；
- HTMLAudio、可选 mpv、Seek、Queue、History、续播和字幕；
- 元数据覆盖、DLsite 单 RJ Provider、外部打开；
- Main 侧 copy/move、冲突保护、失败回滚和 OperationLog；
- Beta 3 真实大库、重启、封面和直接音轨激活。

## U41-B / U41-C 累积候选

- 四步 Importer：来源扫描 → 目标与方式 → 真实预检 → 执行、OperationLog、Index 备份/patch/刷新；
- copy 默认最多 200 项，move 最多 20 项；
- 不覆盖目标，不暴露绝对路径，不产生 `file://`；
- 音声库不再提供随机封面/虚构音轨的伪刷新；
- About 版本来自构建时 `package.json`；
- 历史 Importer 模型退出生产 bundle。

详细设计与证据：`docs/U41B_DAILY_USER_ENTRY.md`、`docs/U41C_RUNTIME_PATCH.md`。

## 1.0 剩余顺序

```text
U41-B Importer + U41-C runtime Windows CI / Codex
→ U41-D 下载器与历史运行时批量清理
→ U41-E 公开 Beta 3 portable/NSIS 复核
→ 1.0.0-rc.1
→ 最终 Windows 验收
→ 1.0.0
```

## 协作方式

- ChatGPT：只读 GitHub、开发、测试、文档和完整源码打包；
- DeepSeek / Codex：固定父 SHA、一个分支、一个提交、一次推送、Draft PR；
- Codex：Windows GUI、公开安装包和真实媒体实机；
- 用户不承担 Git、构建或测试。

## 继续冻结

下载器实现、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步、插件市场和全局架构重写继续冻结。
