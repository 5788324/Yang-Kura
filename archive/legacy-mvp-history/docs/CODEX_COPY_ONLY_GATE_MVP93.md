# MVP-93 Codex copy-only gate

version: `0.131.0-mvp93`

## 当前是否需要 Codex？

```text
不需要。
```

原因：MVP-93 仍不执行真实 copy，只注册 stub 和 blocked result。没有真实文件操作风险。

## 什么时候需要 Codex？

当下一轮准备进入真实 copy 前置验证或真实 copy 执行器时，需要暂停开发，把下面提示词发给 Codex。

## 给 Codex 的提示词草案

```text
你是 Yang-Kura 本机关键验收员。请只做本机验证和风险审查，不要自由扩展功能。

当前版本：0.131.0-mvp93
目标：检查 copy-only main-side stub 是否安全，判断是否可以进入真实 copy 前置验证。

请执行：
1. npm ci --ignore-scripts
2. npm run lint
3. npm run build:electron
4. npm run verify:mvp93-copy-only-main-side-stub
5. npm run verify:all
6. npm run build
7. npm audit --audit-level=high

重点检查：
- Renderer 是否仍不接收 absolutePath / file://。
- electron/main.ts 的 copy-only handler 是否只返回 blocked，不执行真实 copy。
- 是否存在覆盖、移动、删除、重命名文件的实现。
- package.json / package-lock.json 版本是否都是 0.131.0-mvp93。
- git status 中是否有不应提交的 node_modules / dist / tmp / zip / db / log。

禁止：
- 不要直接实现真实 copy。
- 不要接 SQLite。
- 不要修改真实媒体目录。
- 不要删除、移动、重命名任何用户文件。

输出：
- 命令结果表。
- 风险项。
- 是否可以进入 MVP94 真实 copy 前置验证。
```

## 本轮边界

MVP-93 只保存这份 gate，不要求 Codex 立即介入。
