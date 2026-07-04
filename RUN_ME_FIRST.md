# RUN_ME_FIRST

这是 Yang-Kura 压缩包的接手入口。新对话或新 AI 接手时，先读本文件。

## 1. 当前项目是什么

当前项目是：

```text
React + Vite + TypeScript 的本地音频媒体库 UI 原型
```

不是：

```text
完整 Electron 桌面应用
真实本地扫描器
真实音频播放器
真实 SQLite 应用
```

## 2. 先运行什么

```bash
npm install
npm run lint
npm run build
npm run dev
```

如果 `npm install` 失败，先记录错误，不要乱改业务代码。

## 3. 先读哪些文件

```text
NEXT_CHAT_HANDOFF.md
README.md
package.json
src/App.tsx
src/types.ts
src/hooks/useAudioPlayer.ts
src/mockData.ts
```

## 4. 禁止事项

```text
不删除真实媒体文件
不移动真实媒体文件
不重命名真实媒体文件
不联网抓元数据
不自动启动外部播放器
不假装已经接入 Electron / SQLite / 本地扫描
```

## 5. 下一步最小任务

```text
1. 确认 npm run lint / npm run build 是否通过。
2. 更新 README，说明当前是 UI 原型。
3. 新增 PROJECT_STATE.md，记录真实状态。
4. 不要继续大改 UI，先整理数据模型和 Local JSON Index 计划。
```


## MVP-01 Update · Demo 降级与 Local JSON Index 模型入口

本轮目标是把 UI 原型中容易误导的“真实能力”降级为明确 Demo，并建立未来 `library-index.json` 的类型入口。

当前仍然不是完整 Electron 应用，不是真实扫描器，不是真实播放器，不是 SQLite 应用。

已新增：

- `docs/LOCAL_JSON_INDEX_PLAN.md`
- `src/services/libraryIndexAdapter.ts`
- `src/types.ts` 中的 `LibraryRoot / LibraryCollection / LibraryTrack / TrackSource / SubtitleSource / CoverSource / LocalJsonIndex`
- `scripts/verify-mvp01-demo-index.mjs`

本轮不做：Electron、真实目录扫描、读取 `E:\arsm`、写 `library-index.json`、SQLite、HTMLAudio、LRC 文件读取、真实下载、文件修复。

---

## MVP-02 Fixture Scanner Quick Check

本包新增 fixture-only scanner。接手后先运行：

```bash
npm ci
npm run verify:all
```

单独验证：

```bash
npm run verify:mvp02-fixture-scanner
```

注意：不要把 `tests/fixtures/library_sample/` 改成真实扫描入口。当前 scanner 的运行输入是 `src/services/fixtureLibrarySample.ts` 的虚拟 entries。

## MVP-03 之后先跑

```bash
npm install
npm run verify:all
npm run build
```

新增单项验证：

```bash
npm run verify:mvp03-fixture-report
```

MVP-03 仍然是 fixture-only，不要接真实目录扫描。

## MVP-04 快速确认

运行：

```bash
npm ci
npm run verify:all
npm run build
```

打开页面后，到诊断页确认存在：

```text
MVP-04 Fixture Scanner Report / 只读诊断
```

该区块只展示 fixture scanner report，不会读取真实磁盘。


## After MVP-05

Run:

```bash
npm install
npm run verify:all
npm run build
```

MVP-05 adds expanded fixture cases only. Any result that shows duplicate RJ, image-only collection, metadata-only collection, or missing cover is expected fixture behavior. Do not treat it as a request to repair real files.


## MVP-06 验证命令

```bash
npm install
npm run verify:mvp06-fixture-harness
npm run verify:all
npm run build
```

MVP-06 仍然不会访问真实媒体库。所有 scanner 输出来自 fixture 内存样本。


## MVP-07 运行说明

本包新增 SettingsPage 的 scanner contract UI flow。

运行后进入：

```text
设置 → 存储路径 → MVP-07 Scanner Contract UI Flow / 扫描前安全流程
```

这里展示的是未来扫描流程合同，不是真实扫描入口。

验证命令：

```bash
npm run verify:mvp07-scanner-ui-flow
npm run verify:all
```

## MVP-08 运行验证

新增命令：

```bash
npm run verify:mvp08-virtual-path-parser
```

完整验证仍然是：

```bash
npm run verify:all
npm run build
```

MVP-08 不需要真实资源库路径，也不会读取本地媒体文件。

## MVP-08.1 本地验收优先事项

先确认环境：

```bash
node -v
npm -v
npm run verify:env
```

推荐：

```text
Node 22 LTS
npm 10.x
```

不建议用 Node 24 + npm 11 作为正式验收基线。详细 Windows 验收步骤见：

```text
docs/WINDOWS_VALIDATION.md
```

MVP-08.1 已移除 `tsx` 直连验证脚本。所有 `verify:mvp02` ~ `verify:mvp08` 均为 `node scripts/*.mjs`，避免 npm 下载 `tsx` 失败导致整体验收 STOP。
