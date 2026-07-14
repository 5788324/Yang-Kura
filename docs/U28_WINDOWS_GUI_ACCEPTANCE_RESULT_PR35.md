# U28 Windows GUI 实机验收结果（Draft PR #35）

- 首轮验收日期：2026-07-14
- 代码来源：GitHub `5788324/Yang-Kura` Draft PR #35
- 测试分支：`agent/u28-library-reconciliation`
- 首轮被测提交：`b78ed26e183dcb1e20138c5abcb01e8bc4e53374`
- 验收性质：只读测试；未修改产品源码、未创建修复分支、未合并 PR。

## 首轮最终结论

```text
NO-GO
```

自动门禁均通过，但合法空 Index 在各页面的“已连接”状态不一致；同时，真实授权目录中没有现有 Index，导致在不扫描、不写入真实目录的约束下，无法完成真实曲目浏览与播放验收。

## 首轮自动门禁

| 项目 | 结果 |
|---|---|
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS |
| `npm run lint` | PASS |
| `npm run build:electron` | PASS |
| `node scripts/verify-u28-library-reconciliation.mjs` | PASS |
| `npm run verify:stable` | PASS |
| `npm run build` | PASS |

## 首轮 Windows GUI 验收

| 验收项 | 结果 | 实机证据 / 说明 |
|---|---|---|
| 真实授权目录可主动选择，且选择后立即可读取 / 扫描 | PASS | 选择后仅显示目录名称；音声库“读取已有记录”和“扫描”可用。未扫描或写入真实目录。 |
| 离开设置页再返回后，当前窗口授权保持 | PASS | 返回“资源库目录”页仍显示已选择目录，音声库操作保持可用。 |
| 读取真实现有 Index | FAIL（前置条件缺失） | 只读检查确认真实目录没有 `library-index.json`；因此不能完成真实库读取。 |
| 顶栏 / 首页 / 音声库数据一致 | FAIL | 对合法的临时空 Index 点击“读取已有记录”后：首页正确显示 0 首和空状态；顶栏仍为“资源库待重新连接”，诊断页仍称未读取实际 Index。 |
| 真实音轨浏览与播放 | 未能验证 | 真实目录没有可只读加载的 Index；遵守验收边界，未扫描、未写入真实目录。 |
| 诊断页无 Demo 扫描 / 模拟状态 | PASS | 页面只显示当前实际 Index 状态；刷新后没有 Demo 入口或模拟计数。 |
| 临时空 Index 清除旧计数 | PARTIAL / FAIL | 首页旧计数已清除并显示正式空状态；但同一 Index 未被顶栏与诊断页认定为已读取。 |
| 重启后要求重新授权 | PASS | 重启后提示需要重新选择目录，读取 / 扫描在重新选择前不可用。 |
| 重启后重新选择同一临时目录恢复可用 | PASS | 重新授权后提示“已选择目录，可读取已有记录或重新扫描”，音声库操作恢复可用。 |
| 残留进程 | PASS | 退出后 Yang-Kura、Electron、mpv 残留进程均为 0。 |

## 第二轮复验发现

状态同步补丁完成后，Windows GUI 使用同一个已存在且内容合法的临时空 `library-index.json` 复验：

- 目录授权：PASS；
- 空 Index 实际读取：FAIL；
- 失败状态与空库成功状态区分：PASS；
- 诊断页正确显示 0 / 0，但明确报告 `source stat failed: UNKNOWN`；
- 当前窗口跨页面一致性：FAIL；
- 结论仍为 `NO-GO`。

该现象证明阻断点位于 Electron 实际 Index 读取/解析层，而不是测试样本缺失或 Renderer 状态同步。

## 针对第二轮 NO-GO 的修复

关键产品修复提交：`aea3802fb5789cde0d0f8e0b002efef166759fd8`

- `readLibraryIndex()` 改为读取原始 Buffer，不再强制按无 BOM UTF-8 字符串读取；
- 支持 UTF-8、UTF-8 BOM、UTF-16 LE BOM、UTF-16 BE BOM；
- SHA-256 与字节数按原始文件 Buffer 计算；
- JSON 解析失败与文件系统读取失败分别报告；
- 不再把 JSON 解析异常错误包装成 `source stat failed: UNKNOWN`；
- Index 健康检查复用同一编码解析器。

## 第三轮人工复验发现

- Index 读取与编码识别：PASS；
- 顶栏：`已加载 0 条音轨`；
- 设置页：正确显示 0 个集合、0 条音轨；
- 首页资源库卡片仍显示“等待导入资源库 / 尚未读取资源库记录”；
- 结论：`NO-GO`。

根因是首页错误地使用 `trackCount > 0` 判断资源库是否已连接，把“合法空 Index”误判为“未读取”。

## 全链路修复与自动化验收

产品修复提交：`7326e9a29dce0023a687fe784f8a852ff4b672b3`

最终 HEAD：`45df02835d3a8681bea900613d2201d844ce0693`

最终永久 Branch Validation：`29345995891`

自动化通过项：

- 依赖安装：PASS；
- high / critical 依赖审计：PASS；
- Electron runtime 重建：PASS；
- TypeScript：PASS；
- renderer + Electron 桌面构建：PASS；
- Windows Electron full-chain E2E：PASS；
- 全部 focused verifiers：PASS；
- stable regression：PASS；
- 最终 production renderer build：PASS。

E2E 场景：

1. 未授权首次启动：PASS；
2. 已授权但尚未读取：PASS；
3. UTF-8 BOM 合法空 Index 当前窗口一致性：PASS；
4. 重启、重新授权、重新读取：PASS；
5. 损坏 JSON 错误分类：PASS；
6. 非空 Index 映射与 WAV 播放：PASS；
7. `yang-kura-media://` 媒体读取：HTTP 200、48,044 字节、RIFF 校验 PASS；
8. 首页、设置、音声库、音乐库、诊断和 PlayerBar 布局：PASS；
9. 黑屏、横向溢出和 Renderer 异常检查：PASS。

最终自动化产物：14 张截图和结构化 `report.json`。

## 最终结论

```text
AUTOMATED GO
```

不再要求用户或本机 Codex重复人工排错。PR #35 继续保持 Draft，未合并到 `main`，等待用户决定是否合并。

## 安全与收尾

- 自动化只使用系统临时目录与临时生成的 WAV；
- 真实 `E:\arsm` 未用于扫描、写 Index、移动、删除、重命名或覆盖测试；
- 不接 SQLite，不启用 MVP130；
- 没有保留一次性补丁脚本或临时修复工作流；
- PR 当前可合并，但仍保持 Draft。
