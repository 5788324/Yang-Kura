# Yang-Kura Beta 3 U40D/R5 缺陷记录

## DEFECT-01 第一条音轨点击未启动（已关闭）

初次现象是 queue=0。复核确认当时自动化点击了过期或不可见的可访问性节点；把第一条滚动到可见区域并点击实际主区域后立即成功。R5 代码同时改为主按钮直接 `onClick={onActivate}`。自动化 E2E 与真实库主区域均通过。结论：已关闭，不再作为当前产品缺陷。

## DEFECT-02 裸 Electron 启动 0x80000003（环境/启动方式，已关闭）

直接启动 electron.exe 曾出现 `unknown software exception (0x80000003)`。使用标准 `npm run desktop:preview` 和独立 Profile 后，启动、读取、播放、重启恢复和关闭均正常。结论：不作为本轮产品缺陷；后续使用项目标准启动命令。

## 未发现

无播放错误、黑屏、崩溃、长期无响应、媒体删除、媒体移动或重命名。
