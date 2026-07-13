# PROJECT_STATE

## 当前状态

```text
核心版本：0.167.0-mvp129
代码基线：GitHub main
产品化增量：U02～U08 已合入
结构与质量增量：U09～U11 已合入
当前任务：U12 侧栏导航结构与可访问性优化
MVP130：独立实验下载器，继续冻结，禁止合入
```

不再在长期文档中固定某个 Git SHA。GitHub `main` 与最近合并的 PR 是唯一代码事实来源，避免文档在每次小型质量提交后立即过期。

## 已完成主线

1. Electron 桌面壳、目录选择和安全 token 边界。
2. 本地扫描、Local JSON Index 写入、备份和读取。
3. 音声库、音乐库、详情、歌单、队列和播放历史。
4. HTMLAudio、mpv 后端、fallback、Seek 合并和进程回收。
5. LRC、SRT、VTT、ASS 字幕与外部文件打开。
6. copy-only 完整导入闭环和 move-only 小样本闭环。
7. 本地元数据编辑、备份恢复和单 RJ DLsite Provider。
8. 50,000 曲目生成数据性能基准。
9. 缺失文件检查、受控索引清理、备份恢复和维护历史。
10. Windows portable / NSIS installer 发布链。
11. 依赖精简、稳定回归链和历史资料归档。

## U02～U08 产品化增量

- U02：干净配置不再注入演示媒体；首页、顶栏和一级导航产品化。
- U03：中文页面语言、键盘焦点和系统减少动画基线。
- U04：旧弹窗的语义、Escape、Tab 圈定与焦点返回。
- U05：移除 ASMR 详情页伪造的播放进度和字幕关联。
- U06：播放器底栏映射现有主题 token。
- U07：移除全屏播放器演示书签；黑胶动画响应减少动画设置。
- U08：全屏播放页增加 dialog 语义、Escape 和焦点进入/返回。
- CI：Pull Request 在 Windows runner 上自动执行专项 verifier、稳定回归和生产构建。

## 渐进式结构与质量增量

### U09（已完成）

- 从 `LyricsPanel.tsx` 抽离全屏弹窗键盘/焦点生命周期；
- 抽离黑胶与唱臂的 reduced-motion 动画循环；
- 修正 U07/U08 verifier 对实现文件位置的耦合；
- 修正项目文档和 handoff verifier 的旧 Round 6 / 固定 SHA 基线。

### U10（已完成）

- 把 LRC 时间戳解析、双语拆分和当前歌词行计算移入纯函数模块；
- 用可执行断言验证实际输入输出，不再只检查源码字符串；
- 修正 U09 verifier 对路线文档固定措辞的耦合；
- 保持字幕加载、自动滚动、播放进度和 UI 行为不变。

### U11（已完成）

- Windows Pull Request 门禁增加 `npm audit --audit-level=high`；
- high / critical 依赖风险直接阻止合并；
- 既有 Electron moderate 提示继续按非阻塞风险记录，不执行自动修复；
- CI 保存每份 `verify-u*.mjs` 的结果报告，便于定位专项失败。

### U12（当前）

- 把侧栏日常导航和维护导航改为类型化只读配置；
- 使用共享 `SidebarNavSection` 消除两套重复 JSX；
- 增加导航分区语义、键盘焦点样式和 reduced-motion 显式处理；
- 保持八个入口的名称、顺序、页面跳转和详情状态清理行为不变。

## 当前阶段

项目已越过主体功能开发期，进入：

```text
产品质量收口
→ 渐进式代码结构优化
→ Windows GUI 用户流程验收
→ 定向缺陷修复
→ 重新打包形成新 Beta 基线
```

禁止为了代码整齐进行全项目重构。只拆分当前正在维护、已有明确职责拥挤的模块。

## 自动验证

Pull Request 自动门禁当前覆盖：

```text
npm ci --ignore-scripts --no-audit --no-fund
npm audit --audit-level=high
全部 scripts/verify-u*.mjs
逐 verifier TSV 报告与 Actions artifact
npm run verify:stable
npm run build
```

`verify:stable` 内含 TypeScript lint、Electron 编译、MVP112～129 稳定链、mpv 运行时测试、导入器 smoke、50,000 曲目基准和索引维护测试。

核心 MVP129 历史基线还曾通过 Electron strict smoke、portable、NSIS、mpv fixture 和依赖审计；U02 之后需要在最终发布前重新执行完整桌面发布链。

## 仍需完成

1. Windows 真实 GUI 完整用户流程验收。
2. 1040×680、常规窗口和最大化布局检查。
3. 三主题对比度与交互一致性检查。
4. 实际 mpv/HTMLAudio、字幕、队列、重启恢复和 copy-only 流程复验。
5. `build:electron`、strict smoke、portable、NSIS、安装卸载和残留进程复验。
6. 根据实机结果修复明确缺陷并形成新 Beta 发布记录。

## 长期观察与冻结项

- 继续观察真实多小时播放、真实超大媒体库和 named-pipe 长期稳定性。
- SQLite、系统媒体控制、批量元数据和字幕 Worker 集成只有出现明确需求时再启动。
- 下载器继续冻结；不得把 MVP130 或历史实验包自动合入主线。
