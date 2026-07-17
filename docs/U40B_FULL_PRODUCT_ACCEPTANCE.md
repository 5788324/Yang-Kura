# U40-B 全产品用户旅程与交互覆盖验收

## 结论

U40-B 已在 Windows GitHub Actions runner 上通过。它不是发布级 portable/NSIS 验收，而是面向当前产品运行时的全产品自动用户旅程、页面、控件、表单、弹层、键盘、播放器、字幕、导入、主题和窗口布局复核。

```text
状态：PASS
工作流运行：29610622943
候选提交：ed0248126e6915d426be1156ecc09ace3f7a546c
Artifact：8418616793
Artifact digest：sha256:23afb0847eb6b043a71da7aa56a8fd5b294e4c2b9b1eee78421cd2742fd554fd
```

## 验收组成

| 套件 | 范围 | 结果 |
|---|---|---|
| U28 | 资源库选择、扫描、Index、损坏状态、重启授权和真实媒体读取 | PASS |
| U29 | HTMLAudio/mpv、播放、Seek、队列、LRC/SRT/VTT/ASS、无字幕和续播 | PASS |
| U30 | 主题、窗口尺寸、DPI、键盘、焦点、弹层和减少动画 | PASS |
| U31 | copy-only、move-only、冲突、路径边界、失败停止和回滚 | PASS |
| U32 | 首页、音声库、RJ 详情、音乐库详情和日常页面视觉审查 | PASS |
| U40-B | 全部当前可见控件状态、表单、设置、AI 维护、队列、歌词和 1 秒音频旅程 | PASS |

总计 `6 / 6` 套件通过。

## 临时测试资源

U40-B 在 Windows runner 的系统临时目录生成：

- 6 个 1 秒静音 WAV；
- 4 个字幕样本：LRC、SRT、VTT、ASS；
- 1 个无字幕 ASMR 音轨；
- 1 个普通音乐音轨；
- ASMR/RJ 与普通音乐目录结构；
- 两个封面 PNG；
- 文本附件；
- 独立 Electron profile 和 userData。

测试过程不访问用户真实媒体库。临时媒体、profile 和文件操作目录在结束后删除。

## 用户旅程

通过的主旅程：

1. 使用设置页真实选择临时音声库，取得 root token；
2. 写入临时音声、音乐、歌单和播放队列状态；
3. 首页加载与资源状态显示；
4. 音声库浏览、搜索和 RJ 详情；
5. RJ 元数据编辑弹窗、表单和 Escape 关闭；
6. 音乐库歌曲、专辑、艺术家、文件夹四视图；
7. 歌单页面；
8. 导入页面及真实空状态；
9. 设置页面全部标签页和表单；
10. 高雅黑、云雾亚克力、微光海洋三主题；
11. AI 维护入口和返回设置；
12. 播放队列抽屉、Escape 与焦点返回；
13. 全屏歌词、Escape 关闭；
14. Tab、Shift+Tab 和减少动画；
15. HTMLAudio-only 后端选择；
16. 1 秒音频播放、自然结束或进入下一队列项。

## 最终统计

| 项目 | 数量 |
|---|---:|
| 套件 | 6 |
| 通过套件 | 6 |
| 1 秒音频 | 6 |
| 字幕样本 | 4 |
| 页面记录 | 6 |
| 可见控件状态 | 635 |
| 操作记录 | 65 |
| 用户旅程记录 | 14 |
| 截图 | 19 |
| 未覆盖控件 | 0 |
| Renderer 运行时/Console 错误 | 0 |

“可见控件状态”按页面和弹层状态记录，同一控件在不同页面状态中可形成多条记录。每项记录均对应 U28～U32 专项证据或 U40-B 当前旅程证据；禁用控件标记为 `NOT_APPLICABLE`，没有静默跳过的 `UNCOVERED` 项。

## 截图范围

证据包含：

- 首页；
- 音声库；
- RJ 详情；
- 元数据编辑弹窗；
- 音乐库歌曲、专辑、艺术家和文件夹视图；
- 歌单；
- 导入；
- 设置；
- AI 维护；
- 队列抽屉；
- 全屏歌词；
- 三主题；
- 1 秒音频完成状态。

## 工程位置

```text
.github/workflows/u40b-full-product-acceptance.yml
scripts/test-u40b-full-product-journey.mjs
scripts/verify-u40b-full-product-acceptance.mjs
scripts/u40b/cdp-runtime.mjs
scripts/u40b/fixture.mjs
scripts/u40b/coverage.mjs
```

工作流产物：

```text
artifacts/u40b-full-product-acceptance/
├── interaction-coverage.json
├── feature-inventory.json
├── user-journey-report.md
├── final-summary.json
├── failures.json
└── screenshots/
```

## 明确排除

根据用户要求，以下项目不属于 U40-B：

- 实际扬声器或耳机是否发声；
- 声卡、驱动和物理音频设备差异；
- 真实显示器上的主观字体、颜色和视觉感受；
- PotPlayer、系统图片查看器等第三方程序打开后的界面；
- 数学意义上的无限状态排列组合。

自动验收仍验证媒体状态推进、后端状态、进程回收、外部打开契约、无运行时错误和当前已知用户流程。

## 后续使用规则

U40-B 不作为每个普通 PR 的默认门禁。以下场景才运行：

- 大范围页面或导航改动；
- 播放器、字幕、资源库、导入器跨域改动；
- 发布前集中用户流程复核；
- 怀疑多个日常功能同时受到影响；
- 用户明确要求重新做全产品验收。

普通低风险改动继续使用 U40-A 规定的定向快速验证。
