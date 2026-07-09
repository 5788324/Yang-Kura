# IMPORTER_FINAL_REGRESSION_CHECKLIST_MVP108

版本：`0.146.0-mvp108`

本文件用于导入器阶段收尾审查，即导入器最终回归清单。MVP108 不新增真实功能，只提供最终回归清单。

## 1. Copy-only 回归清单

```text
选择来源
→ 生成导入计划
→ 预检目标冲突
→ 执行 copy-only
→ 写 OperationLog
→ post-copy refresh preview
→ library-index patch preview
→ readiness gate
→ backup 后写入 library-index.json
→ UI refresh
```

必须检查：

```text
不覆盖同名文件
失败列表可见
OperationLog 可追踪
backup 文件存在
写入失败时原 library-index.json 可保留
UI 能刷新首页 / 音声库 / 音乐库
不返回 absolutePath
不返回 file://
```

## 2. Move-only 回归清单

```text
move-only 必须显式选择
必须 CONFIRM_MOVE_IMPORT
最多 20 个文件的小样本
目标存在时跳过 / 阻塞
失败停止
写 OperationLog
不自动清理空源目录
```

仍然不允许：

```text
大批量 move
自动合并目录
自动覆盖
自动删除源目录
自动清理空目录
```

## 3. 导入器 UI 回归清单

主页面只应保留：

```text
选择来源
导入预览
冲突提示
目标路径
复制 / 移动方式
结果摘要
错误提示
```

以下内容默认折叠到 AI 维护区 / 诊断页：

```text
MVP 编号
IPC channel
contract
verifier
stub
fs.copyFile / fs.rename 细节
absolutePath / file:// 技术边界说明
```

## 4. 路径与数据边界

MVP108 不改变路径策略：

```text
renderer 不接收 absolutePath
renderer 不接收 file://
主界面使用 token / displayName / relativePath
诊断页可保留工程说明，但不能泄露真实路径
```

## 5. 暂停开发

MVP108 后暂停开发，不继续直接进入下载器 / 元数据 Provider / mpv / SQLite。

先审查：

```text
copy-only 小样本
move-only 小样本
导入器主页面
打包版启动
播放 / 字幕 / 外部打开是否被破坏
```

Codex 非必要不安排；只有打包版或本机小样本失败、且需要关键验收时再使用。

## 6. 本轮未触碰

```text
不改 copy-only executor
不改 move-only executor
不再次写 library-index.json
不接 SQLite
不接下载器
不接元数据 Provider
不接 mpv
不返回 absolutePath
不返回 file://
不安排 Codex
```
