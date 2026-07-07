# CURRENT ROADMAP MVP-83

version: `0.121.0-mvp83`

## 主题

MVP-83：Beta 0.1 阶段性收口 / GitHub 推送准备。

## 背景

公司网络仍可能阻止 `git clone` / `git fetch` / `git push`，所以本轮不执行 GitHub 推送，也不把远程 `main` 当成最新开发基线。当前基线是本地 MVP82 源码包。

## 本轮目标

1. 固定本地源码版本到 `0.121.0-mvp83`。
2. 新增 Beta 0.1 阶段收口和回住所推送说明。
3. 新增 `betaCloseoutPushPrepService`，在诊断页展示推送准备状态。
4. 新增 MVP83 verifier，并接入 `verify:all`。
5. 不改真实扫描、写 index、播放内核、字幕读取、外部打开或文件安全链路。

## 下一步

如果 DeepSeek 继续发现真实 bug，进入 MVP84 bugfix。若没有新 bug，回住所后按 `docs/GITHUB_PUSH_PREP_MVP83.md` 执行 GitHub 推送。
