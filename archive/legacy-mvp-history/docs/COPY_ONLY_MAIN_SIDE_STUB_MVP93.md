# MVP-93 copy-only main-side stub

version: `0.131.0-mvp93`

## 目的

MVP-93 在代码层接入 copy-only 相关 stub 通道，但仍然把真实执行阻断。

本轮的关键不是复制文件，而是确认：

```text
Renderer → preload → main 的通道名称、payload、blocked result、类型约束都已冻结。
```

## Stub 通道

```text
yang-kura:import:copy-only:preflight
yang-kura:import:copy-only:confirm
yang-kura:import:copy-only:execute
yang-kura:import:copy-only:cancel
```

## 返回策略

所有执行相关请求都必须返回 blocked 状态：

```text
status: mvp93-copy-only-stub-blocked
executeAllowed: false
copiedCount: 0
absolutePathReturned: false
fileUrlReturned: false
```

## Renderer 约束

Renderer 只能传：

```text
operationPlanId
rootPathToken
targetRootPathToken
relativePaths
```

Renderer 不允许传或接收：

```text
absolutePath
file://
```

## Main 侧约束

MVP-93 main 侧只注册 handler，不做真实文件操作。

禁止：

```text
创建目录
复制文件
移动文件
删除文件
重命名文件
覆盖文件
写 OperationLog 文件
写 library-index.json
```

## 验收

```bash
npm run verify:mvp93-copy-only-main-side-stub
npm run verify:all
```

## 结论

MVP-93 是真实 copy 前的最后一层 stub 化收口之一。真实 copy 前必须再暂停，让 Codex 在本机按一次性样本目录做关键验收。

补充边界：MVP-93 不执行真实 copy，不复制真实文件。
