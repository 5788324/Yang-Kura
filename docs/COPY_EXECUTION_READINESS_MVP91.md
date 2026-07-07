# MVP-91 copy only 导入前执行合同

版本：`0.129.0-mvp91`

## 目标

MVP-91 在 MVP-90 目标路径规划之后，冻结 copy only 导入前必须具备的执行合同。

它不执行文件操作，只定义未来 copy only 前必须展示和记录的内容：

```text
1. 预检清单
2. 二次确认文案
3. 文件执行计划
4. OperationLog 字段
5. 失败列表
6. 跳过列表
7. disabled-preview-only 执行状态
```

## 预检清单

真实 copy 前至少需要确认：

```text
sourceRootToken 存在
Renderer 未接收 absolutePath / file://
MVP90 targetRelativePath 已生成
overwrite 固定 false
ConflictReport 无 blocker
OperationLog 可以记录 planned / copied / skipped / failed
Codex 已完成本机关键验收
```

## 二次确认

确认文案：

```text
我确认仅复制文件，不覆盖、不移动、不删除源文件。
```

MVP-91 中该按钮仍然是：

```text
disabled-preview-only
```

## OperationLog

OperationLog 未来字段：

```text
taskId
timestamp
event
level
sourceRelativePath
targetRelativePath
message
errorCode?
```

MVP-91 只生成 OperationLog preview，不写磁盘、不写 library-index.json、不写 SQLite。

## 失败 / 跳过列表

失败列表必须显式展示，不允许吞掉异常。跳过列表必须说明跳过原因，不允许隐式删除源文件。

## 边界

```text
不执行 copy
不移动
不删除
不重命名
不覆盖同名文件
不写 index
不接 SQLite
不接 Provider
不接 mpv
```
