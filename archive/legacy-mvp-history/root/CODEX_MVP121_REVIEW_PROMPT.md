# Codex MVP121 review task

基线：GitHub main `0.158.0-mvp120 / 55e33b383d8b2c555d3d47b7ba600e1c52b67f73`
目标版本：`0.159.0-mvp121`

只复验 MVP121，不开发新功能。

运行：

```powershell
npm ci --ignore-scripts --no-audit --no-fund --prefer-offline --cache "G:\Codex\Yang Kura\.npm-cache"
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm run lint
npm run build:electron
npm run verify:mvp118-dlsite-single-rj-provider
npm run verify:mvp119-provider-cache-throttle
npm run verify:mvp120-dlsite-total-deadline
npm run verify:mvp121-metadata-source-management
npm run test:importer:smoke
npm run build
npm audit --audit-level=high
```

GUI 快检使用 `RJ01554928`：

1. 查询成功后确认最终 URL 可显示翻译入口。
2. 差异表并排显示“本地当前值”和“外部候选值”。
3. 默认勾选所有有差异字段；取消至少两个字段。
4. 点击“填入已选 N 项”，只有勾选字段进入编辑表单。
5. 未点击“保存修改”前关闭窗口，不得持久化。
6. 保存后详情页显示来源标识，例如“来源：DLsite 官方作品页”。
7. 重新读取 library-index 后，本地覆盖和来源标识仍保留。
8. 还原本地修改后，覆盖和来源标识一起清除。
9. 不显示 absolutePath/file://，不修改媒体文件，不扫描真实大库。

通过后：

```powershell
git add .
git commit -m "feat: close metadata source management in MVP121"
git push origin main
```
