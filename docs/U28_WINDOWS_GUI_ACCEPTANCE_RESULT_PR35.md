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

## 首轮问题清单

### MAJ-001：合法空 Index 的跨页面状态未统一

- 分类：Major
- 页面 / 功能：首页、顶栏、诊断页、现有 Index 读取
- 证据状态：已实机复现
- 复现步骤：选择仓库外临时目录；其中仅放置合法空 `library-index.json`；点击“读取已有记录”。
- 实际结果：首页清除旧数据并显示 0 与空状态；顶栏仍显示“资源库待重新连接”，诊断页仍称没有已读取的实际 Index。
- 预期结果：成功读取合法空 Index 后，首页、顶栏和诊断页应共同反映已连接的空资源库，不应出现互相矛盾的连接状态。
- 用户影响：首次使用或空资源库用户无法确认资源库是否成功读取。

### OBS-001：真实库播放验收的外部前置条件不足

- 分类：Observation（验收阻塞，非本次代码缺陷结论）
- 证据状态：已实机确认
- 实际结果：真实授权目录不存在可读取的 `library-index.json`，无法在不扫描 / 写入真实目录的约束下取得曲目并验证播放。
- 处理：未对真实目录执行扫描、Index 写入或媒体修改。

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
- Index 健康检查复用同一编码解析器；
- 新增 Windows 编码空 Index 运行时 verifier。

当前复验任务见：`docs/U28_WINDOWS_GUI_REVALIDATION_TASK_PR35.md`。

## 当前自动门禁

最终待复验分支 HEAD：`05dff23b969dad251f94d3347ae6c6701117c07b`

Branch Validation run `29337190912`：

- 依赖安装：PASS；
- high / critical 依赖审计：PASS；
- 全部 focused verifiers：PASS；
- stable regression：PASS；
- production renderer build：PASS。

> 注：Codex 执行前必须拉取分支最新远端 HEAD，并在第三轮结果中记录实际完整 SHA；后续仅允许在本文件末尾追加验收结果。

## 当前结论

```text
DRAFT / NO-GO，等待 Windows GUI 第三轮复验
```

第三轮必须复用此前报错的同一个临时目录和同一个合法空 `library-index.json`。只有 A/B/C 全部通过后，才能把 PR #35 改为 GO。

## 安全与收尾要求

- 所有空 Index 与损坏 JSON 测试只使用仓库外临时目录。
- 真实 `E:\arsm` 只读授权、读取、浏览和播放；禁止扫描与写入。
- 不收集真实媒体名称、字幕、Cookie、Token 或下载链接。
- Codex 不修改源码、不提交修复、不创建新 PR、不合并 PR。
- 验收结束必须确认工作区 clean，Yang-Kura、Electron、mpv 残留进程均为 0。
