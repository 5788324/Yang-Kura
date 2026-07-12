# CURRENT_ROADMAP_MVP102

当前版本：`0.140.0-mvp102`。

本轮完成：**MVP102：copy-only import closeout**。MVP95～MVP101 已被收口为一个完整的 copy-only 导入闭环：真实 copy、OperationLog、post-copy refresh preview、library-index patch preview、write readiness、backup 后真实写入 `library-index.json`、写入后 UI refresh。

## 当前阶段

```text
Beta 0.1 后
→ 导入器 copy-only 链路收口完成
→ 下一步可以进入 move-only 策略或导入器日常 UI 简化
```

## MVP102 允许

```text
归档 MVP95-MVP101 copy-only import chain
展示 closeout result preview
展示 Codex 最小实机验收提示词
明确下一阶段路线
```

## MVP102 不做

```text
不新增真实文件操作
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不执行 move / delete / rename
不返回 absolutePath
不返回 file://
```

## Codex 使用原则

Codex 额度少，只用于必要实机验收。需要 Codex 时，本轮回复必须直接附完整 Codex 提示词，不再分两轮补充。

## 下一轮选择

```text
MVP103：move-only strategy / 受控移动导入策略，仍先不执行 move
或
MVP104：导入器日常 UI 简化，把 MVP86-MVP102 工程区折叠到诊断/AI 维护区
```
