# PROJECT_ROADMAP

## 基线

```text
公开版本：0.170.0-beta.3
main：8a92978bbd07aa9f490ec15c9037366793168e2c
正式目标：1.0.0
当前主线：U41-B + U41-C 累积候选
1.0：NO-GO
```

## 已完成

- U34～U40：架构、日常页面、播放器、真实库、重启、封面和 Beta 3 发布；
- U41-A：全产品 UI / 功能 / 按钮与历史代码审计；
- U41-B 本地候选：真实 Importer、伪刷新删除、版本单一来源和 Importer bundle 瘦身；
- U41-C 本地候选：Electron 39.8.10、runtime hardening、LF fixture、live status 与维护文案。

## 当前 Windows 合并门禁

```text
U41-B Importer visible E2E
→ U31 copy/move / conflict / rollback / Index refresh
→ U41-C custom protocol / U28 / U29
→ portable / NSIS / U32 install-upgrade-uninstall
→ Codex 固定 SHA 实机
```

完成标准：

- 所有 Windows workflow PASS；
- Codex `%TEMP%` Importer PASS；
- custom protocol、HTMLAudio、字幕、队列和重启无回归；
- portable/NSIS 启动、覆盖安装、卸载和用户数据保留 PASS；
- 一个提交、一次推送、Draft PR；
- 无绝对路径、覆盖、真实库破坏或残留进程。

## U41-D：生产表面瘦身

- 移除冻结 downloader route/bundle；
- 归档旧 Diagnostics、Settings、Dashboard、AsmrLibrary、AsmrDetail 巨页；
- 批量迁移历史 verifier；
- 清理 U41-B 后新增的不可达历史 importer services；
- 一次完整回归，禁止逐文件补丁式 CI。

## U41-E：公开包与 RC

- Codex 复核公开 Beta 3 portable/NSIS；
- 发布 `1.0.0-rc.1`；
- 最终 Windows 验收；
- 无 Blocker/Major 后发布 `1.0.0`。

## 继续冻结

下载器实现、SQLite 全量迁移、OpenList/WebDAV、Player Core V2、完整 AI Agent、转录集成、云同步、插件市场和全局架构重写。
