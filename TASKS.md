# TASKS — 当前唯一执行队列

更新日期：2026-09-23

## COMPLETED — K2-R0

- [x] 最新可识别源码完成对账和合并
- [x] GitHub main 恢复为唯一代码真源
- [x] 交接入口统一
- [x] 静态 main SHA 漂移修复
- [x] 历史 archive / 重复 handoff / 旧 MVP/RC 文档清理
- [x] 旧 U32/U40/U41 RC workflows 退出当前 CI

---

## ACTIVE — K2-R1 Desktop 2.0 真实审计

### R1-A — 依赖与运行时
- [ ] 分析 npm audit 1 moderate + 7 high 的直接/间接影响
- [ ] 决定 Electron 39 的升级路线
- [ ] 更新依赖并恢复有效安全门禁

### R1-B — 8TB 大库
- [ ] 真实 Work / Track / File / Subtitle / Cover 统计
- [ ] 启动/Index 读取基准
- [ ] 扫描耗时/内存基准
- [ ] 搜索/排序/筛选基准
- [ ] 封面加载/缓存审计
- [ ] React state / JSON Index 瓶颈定位

### R1-C — 产品与 UI
- [ ] 用户“不顺、不成熟” Top 10
- [ ] 音乐信息架构审计
- [ ] RJ 信息架构审计
- [ ] 2～3 个高质量视觉方向
- [ ] 成熟开源项目可复用项清单

### R1 交付
- [ ] `docs/DESKTOP2_AUDIT.md`
- [ ] P0/P1/P2 问题清单
- [ ] K2-R2～R8 最终排序
- [ ] K2-R2 + K2-R5 并行启动 GO / NO-GO

---

## NEXT

- K2-R2：SQLite / FTS5 / migration
- K2-R3：Incremental Scanner + Artwork Cache
- K2-R4：Query / Pagination / Virtualization
- K2-R5：Design System + App Shell
- K2-R6：Music
- K2-R7：RJ / ASMR
- K2-R8：Player / Polish
- K2-R9：8TB+ Real Library Acceptance

---

## FROZEN

Desktop 2.0 稳定前不启动：
- OpenList 正式接入
- Android 正式开发
- Downloader
- 转录
- 云同步
- 插件市场
- AI Agent 大功能
