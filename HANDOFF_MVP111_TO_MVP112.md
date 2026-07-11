# HANDOFF MVP111 → MVP112

MVP112 是 Codex GUI 审计后的阻塞修复包。

优先验收：

1. 使用包含旧绝对路径的 `sqlite_settings` 启动，设置页不得显示真实路径，localStorage 应被改写为占位记录。
2. 下载规划页不得再产生 duplicate key error，旧模拟按钮默认不可操作。
3. 从设置页底部切到诊断页，滚动位置应回到顶部。
4. 诊断页初始只显示轻量摘要，点击“打开高级诊断”后再挂载历史维护内容。
5. 音乐库播放与收藏按钮可通过键盘聚焦并有 accessible name。
