# U41 全产品审计与 A～D 收口

## 当前结论

```text
基线：main @ 18ada58b76a3aa0828506d2d02c57ecd22fbc587
公开版本：0.170.0-beta.3
U41-A：COMPLETE
U41-B：COMPLETE / MERGED / WINDOWS PASS
U41-C：COMPLETE / MERGED / WINDOWS PASS
U41-D：LOCAL COMPLETE / CI VERIFY
1.0.0：NO-GO
```

## 可复现审计

```text
node scripts/audit-u41-product-surface.mjs
npm run verify:u41b-daily-user-entry
npm run verify:u41c-runtime-patch
npm run verify:u41d-legacy-cleanup
npm run lint
npm run build
npm run build:electron
npm run test:u31:importer-transactions
npm run verify:stable
```

## 规模变化

| 维度 | U41-A | U41-B/C | U41-D |
|---|---:|---:|---:|
| 生产路由 | 8 | 8 | 7 |
| 静态控件标记 | 268 | 274 | 240 |
| 代码模块 | 215 | 217 | 123 |
| 生产入口可达 | 146 | 123 | 121 |
| 不可达实现 | 67 | 92～93 | 0 |
| Workflow | 15 | 17 | 9 |
| Verifier | 85 | 87 | 58 |
| Test script | 21 | 22 | 22 |
| Importer minified chunk | 约 255 KB | 22.03 KB | 22.02 KB |
| Downloader chunk | 存在 | 存在 | 不存在 |

## 已关闭问题

- 真实 Importer UI；
- 伪数据刷新；
- About 旧版本；
- Electron 运行时补丁；
- Importer 历史 bundle；
- 冻结 Downloader 生产路由；
- 历史不可达实现。

## U41-D 边界

U41-D 只改变生产入口、归档边界、历史门禁和文档；未修改：

- HTMLAudio/mpv backend；
- Index schema；
- copy/move transaction；
- Root token 安全边界；
- 真实媒体文件。

## 剩余风险

仅剩 U41-D 的 Windows PR 门禁和 U41-E 的全页面/公开安装包最终验收。无开放的 U41 产品 Blocker。

## 1.0 顺序

```text
U41-D Windows CI
→ U41-E
→ 1.0.0-rc.1
→ 最终 Windows 验收
→ 1.0.0
```
