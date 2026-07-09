# 项目文件整理说明（MVP108 收尾）

## 本轮整理目标

100 多轮后，项目根目录和文档已经偏乱。本轮做的是**不破坏 verifier 的轻量清理**：

```text
更新当前文档入口
清理 npm 缓存
新增 .gitignore
新增导入器 smoke test
保留 legacy handoff / manifest 文件
```

## 已清理

```text
删除源码包内 .npm-cache
新增 .gitignore，避免 node_modules / dist / dist-electron / .npm-cache / logs 进入 Git
重写 README / PROJECT_STATE / PROJECT_ROADMAP / RUN_ME_FIRST / NEXT_CHAT_HANDOFF
精简 NEW_CHAT_PROMPT / CODEX_MINIMAL_PROMPTS
```

## 暂时保留的历史文件

根目录仍保留：

```text
HANDOFF_MVPxx_TO_MVPxx.md
PACKAGE_MANIFEST_MVPxx_HANDOFF.txt
```

原因：不少 legacy verifier 仍直接检查这些文件是否位于仓库根目录。现在强行移动到 `docs/archive` 会导致老 verifier 失败，反而增加维护成本。

## 后续可选深度清理

等项目稳定后，可以单独做一轮：

```text
1. 修改 legacy verifier，让它们支持 docs/archive/handoffs 路径。
2. 将旧 handoff / package manifest 批量归档。
3. 将 CURRENT_ROADMAP_MVPxx 合并成一份 ROADMAP_HISTORY。
4. 缩短 verify:all，改成 current smoke + legacy optional。
```

当前不建议立刻做，因为它不是用户价值功能，且容易破坏历史验证链。
