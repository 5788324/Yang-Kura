# U31 导入器事务与数据安全验收

## 结论

```text
AUTOMATED GO
```

U31 将现有 copy-only、move-only、OperationLog 和 Index 维护能力收口为可自动回归的文件事务链。没有引入数据库、任务队列或企业级审批框架。

## 实现范围

- 新增 `electron/importerTransactionService.ts`。
- `electron/main.ts` 的 copy-only 与 move-only 执行器接入统一事务服务。
- 默认不覆盖目标文件。
- copy-only 批次发生失败时，删除本轮已新复制的目标文件。
- move-only 批次发生失败时，将本轮已移动文件逆向恢复到源位置。
- 仅删除本轮创建且仍为空的目标目录。
- OperationLog 增加事务版本与回滚结果，仍只保存相对路径。
- Renderer 返回不包含绝对路径或 `file://`。
- Index 备份、恢复和维护历史继续使用 MVP128/MVP129 已有实现。

## 自动测试场景

`npm run test:u31:importer-transactions` 直接导入编译后的产品模块，使用 Windows 临时目录完成：

1. copy-only 成功，源文件保留，目标 SHA-256 一致；
2. copy-only 同名冲突，目标不覆盖，源文件保留；
3. copy-only 第二项失败，第一项目标自动删除，新建空目录自动清理；
4. `..` 路径越界被阻断；
5. move-only 成功，源文件移除，目标存在；
6. move-only 同名冲突，源文件保留，目标内容不变；
7. move-only 第二项失败，第一项自动恢复到源位置，后续项停止；
8. 结果序列化不包含 Windows 绝对路径或 `file://`。

## 兼容回归

首次完整产品验证：

```text
产品提交前被测分支：agent/u31-importer-transaction-hardening
Windows Actions run：29377682775
结果：PASS
```

该 run 同时通过：

- TypeScript；
- Renderer 与 Electron 构建；
- U31 importer transaction matrix；
- U31 focused verifier；
- 原有 importer smoke；
- MVP129 Index 维护测试；
- U28、U29、U30 Electron 回归；
- 完整 stable regression。

最终 PR HEAD 还必须通过永久 `Branch Validation`，并以 PR #38 最后一次成功 run 为合并门槛。

## 数据边界

- 没有对用户真实媒体库执行测试性删除、移动、覆盖或重命名。
- 所有 move、冲突和回滚测试均使用 Actions 自动生成的临时目录和副本。
- 正常个人使用不增加多级审批；仅保留确认、不覆盖和本轮失败回滚。

## 后续

U31 完成后主线切换到 U32：Windows 发布候选、portable、NSIS、实际打包 mpv、安装/升级/卸载和用户数据保留。
