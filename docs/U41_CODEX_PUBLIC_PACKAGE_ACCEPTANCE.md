# Codex：Yang-Kura Beta 3 公开安装包定向验收

## 目标

验证用户从 GitHub Release 实际下载到的 `v0.170.0-beta.3` portable 与 NSIS 安装包，而不是源码预览或 PR Artifact。

本任务只做 Windows 实机验收，不开发、不修改源码、不提交 Git。

## 固定发布

```text
仓库：5788324/Yang-Kura
Tag：v0.170.0-beta.3
main commit：8a92978bbd07aa9f490ec15c9037366793168e2c
资产：
- Yang Kura-0.170.0-beta.3-portable-x64.exe
- Yang Kura-0.170.0-beta.3-setup-x64.exe
- SHA256SUMS.txt
```

如果资产名或 Tag 不一致，报告 `RELEASE_BASELINE_INVALID` 并停止。

## 安全边界

- `E:\arsm` 仅用于读取、播放和封面检查；不得删除、移动、重命名或覆盖媒体本体。
- 文件事务测试只使用 `%TEMP%\YangKura-U41-Package-Acceptance`。
- 测试前后记录 Electron/Yang-Kura/mpv 进程。
- 不使用裸 `electron.exe` 启动源码。

## A. 资产与校验

1. 下载三项公开资产；
2. 执行 SHA-256；
3. 与 `SHA256SUMS.txt` 逐项比较；
4. 记录文件名、大小、SHA-256；
5. 确认 Release 为 prerelease，Tag 正确。

## B. Portable

使用独立临时 profile：

- 首次启动成功；
- 首页、音声库、音乐库、歌单、导入、设置均能打开；
- 设置 → 关于，记录显示的版本字符串；已知静态审计怀疑仍显示 `0.169.0-beta.2`，必须如实截图；
- 选择或恢复 `E:\arsm`；
- 读取 Index，窗口持续响应；
- 打开 `RJ00331318`；
- 第一条主区域播放；
- 第二条行尾播放；
- duration > 0、progress 推进；
- pause/resume/seek；
- 重启后自动读库并继续播放；
- 正常关闭后进程数为 0。

## C. NSIS

在测试用户范围内：

1. 安装；
2. 启动并执行上述短版页面/播放检查；
3. 关闭；
4. 使用同一安装包覆盖安装；
5. 确认用户设置、授权和播放记录没有异常丢失；
6. 卸载；
7. 记录程序文件是否清理；
8. 记录用户数据保留策略是否符合现有设计；
9. 确认没有残留运行进程。

## D. 导入页事实核对

只观察公开包：

- 是否存在真实“选择来源”按钮；
- 是否可以实际选择 `%TEMP%` 来源；
- 是否能进入预览、冲突和确认；
- 所有执行按钮是否禁用。

静态审计认为当前页面只有说明和样本模型，没有真实执行入口。请提供截图，不要尝试通过开发者工具绕过禁用状态。

## E. 输出

输出 ZIP：

```text
U41_BETA3_PUBLIC_PACKAGE_COMMAND_RESULTS.md
U41_BETA3_PUBLIC_PACKAGE_MATRIX.md
U41_BETA3_PUBLIC_PACKAGE_DEFECTS.md
U41_BETA3_PUBLIC_PACKAGE_FINAL_REPORT.md
screenshots/
checksums/
```

每项必须为 `PASS / FAIL / NOT TESTED`。不得把“程序启动”替代页面、播放、安装、覆盖安装、卸载和进程收尾证据。
