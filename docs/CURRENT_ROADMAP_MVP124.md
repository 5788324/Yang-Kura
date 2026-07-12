# Yang-Kura 当前路线（MVP124）

- 当前版本：`0.162.0-mvp124`
- GitHub main 正式基线：`0.158.0-mvp120 / 55e33b383d8b2c555d3d47b7ba600e1c52b67f73`
- MVP121～MVP124 尚待后续统一合入。
- 本地元数据与单 RJ DLsite Provider 阶段已完成基础闭环。
- mpv 已具备设置、检测、长音频 seek 合并、运行失败回退和退出回收。
- HTMLAudio 继续作为稳定 fallback。

下一阶段优先处理播放器日常体验：真实 Windows mpv 小样本、后端状态提示收口、播放进度/队列回归。之后应转向下载器或 SQLite 前的数据层评估，不再连续拆 mpv 微功能。
