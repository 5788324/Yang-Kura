# U27 Windows GUI 实机验收结果

## 结论

```text
CONDITIONAL GO
```

U27 已完成。没有修改源码，没有提交或推送验收期间的源码改动；用户原配置已恢复，Git 工作区 clean，关闭应用后没有 Yang Kura、Electron 或 mpv 残留进程。

## 基线

- 日期：2026-07-14
- Git HEAD：`032e7e60a728d650c94f45316f2f5eeae7cd73e4`
- 核心版本：`0.167.0-mvp129`
- Node / npm：`v22.22.2` / `10.9.7`
- portable：`Yang Kura-0.167.0-mvp129-portable-x64.exe`
- SHA-256：`449C19A8659D8316DAA5E8AED3C4439822A5C20346B5BA0A728C5B9E3D78C922`

长期文档不把该 SHA 作为未来固定基线；后续任务继续以最新 `origin/main` 为代码事实来源。

## 自动门禁

| 项目 | 结果 |
|---|---|
| `verify:env` | PASS |
| TypeScript lint | PASS |
| Electron 编译 | PASS |
| 稳定回归 | PASS |
| 生产构建 | PASS |
| Electron strict smoke | PASS |
| portable 打包 | PASS |
| high / critical 依赖审计 | PASS：0 high / critical；1 moderate |
| mpv Windows acceptance | SKIP：未提供测试音频环境变量 |

## GUI 已通过范围

- 干净首次启动。
- 首页与主框架无黑屏、白屏或重叠。
- 空音声库、空音乐库与空歌单状态。
- AI 维护默认折叠，展开后入口可用。
- `dark / acrylic-mist / ocean-drops` 三主题。
- 常规窗口、最大化和恢复。
- 主要导航和图标按钮的基础可读名称。
- 关闭 portable 后进程回收。
- 用户原配置备份、隔离和恢复。

## 未完成的实机闭环

由于受控 GUI 接口不能操作 Windows 原生目录选择器，本轮没有绕过 GUI，因此以下项目保持 `NOT TESTED`：

1. 通过原生目录选择器授权临时 ASMR 与音乐目录。
2. 扫描、写入、读取和应用 Index。
3. 有音轨条件下的 HTMLAudio / mpv 播放、Seek、队列和续播。
4. LRC、SRT、VTT、ASS 字幕。
5. copy-only 与受控 move-only 导入。
6. 扫描和播放完成后的重启恢复。
7. 1040×680、小窗口和 125% / 150% DPI。
8. 完整 Tab / Shift+Tab 循环。

这些项目必须由 U28 的人工原生对话框补测完成，不能把 U27 的空库检查视为真实媒体流程通过。

## 问题清单

### MIN-001：导入器初始页示例容易被误解

- 严重度：Minor。
- 现象：未选择来源时仍显示“4 个示例文件”和“0 阻断 / 1 提醒”。
- 风险：用户可能误认为已经识别了当前来源文件。
- 处理：不阻止 U28；在 U28 实际导入流程后判断是否需要定向修正文案或示例标识。

### OBS-001：原生目录选择器无法被当前自动化接口操作

- 性质：测试工具限制，不是已确认的产品缺陷。
- 处理：U28 采用人工 Windows 操作，不通过脚本绕过目录授权。

### OBS-002：Electron moderate 依赖提示

- `npm audit`：0 high / critical，1 moderate。
- 处理：显式记录，不运行 `npm audit fix`，不在验收轮自动升级 Electron。

## 数据安全结果

- 无误删。
- 无覆盖。
- 无错误移动。
- 未使用真实大库执行写入、清理或 destructive test。
- 临时样本只位于仓库外验收目录。
- 用户原配置已恢复。
- 日常界面未观察到绝对路径或 `file://` 泄露。

## U28 进入条件

U27 没有 Blocker 或 Major，可以进入 U28，但 U28 的第一道门必须完成原生目录选择器下的临时样本真实闭环。

```text
人工选择临时目录
→ 扫描与 Index
→ 真实播放与 Seek
→ 四种字幕
→ copy-only / move-only 临时副本
→ 重启恢复
```

在上述链路完成前，不得宣称资源库、播放、字幕或导入器 Windows GUI 全流程已验收通过。
