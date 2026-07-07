# MVP-70 — Beta 0.1 最终交接包

版本：`0.108.0-mvp70`

## 定位

MVP-70 是 Beta 0.1 RC 的最终交接说明轮，不新增功能，不改真实链路。

当前状态可以记录为：**Beta 0.1 RC 可交付包 / 可暂停开发 / 可后续维护**。

## 用户已确认真实链路

- 选择音声库目录
- 一键扫描并应用
- 音频可以播放
- 歌词可以读取
- 图片可以打开
- 视频可以打开
- 诊断页黑视图与 `undefined.map` 已修复

## 轻量验证命令

```bash
node -v
npm -v
npm ci --ignore-scripts
npm run verify:all
npm run build
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run dev:electron
```

## 交接规则

1. 新对话或 Codex 接手时先读 README / PROJECT_STATE / NEXT_CHAT_HANDOFF / RUN_ME_FIRST。
2. 先确认当前状态是 Beta 0.1 RC 可交付包，不要默认继续加功能。
3. 真实缺陷必须有复现路径，再进入小修轮。
4. 诊断页内容偏多属于开发阶段正常状态，Beta 0.1 后再分组折叠。
5. 不要删除历史 verifier marker，必要时只做隐藏或折叠。

## 冻结边界

- 不接 SQLite
- 不接下载器
- 不接 ASMR.one / DLsite / 网易云元数据抓取
- 不接 mpv 后端
- 不删除 / 移动 / 重命名真实媒体文件
- 不向 Renderer 暴露 absolutePath 或 file://
- 不改真实扫描 / 写 index / 播放内核链路
- 不做大组件一次性拆分

## 后续路线

- 如无阻塞，可暂停开发，把当前包作为 Beta 0.1 RC 使用。
- 如发现真实样本缺陷，进入 MVP-71 小修轮，只修具体问题。
- Beta 0.1 后优先安排诊断页折叠、设置页精简、资源库体验增强。
