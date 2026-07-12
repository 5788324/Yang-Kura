# RUN_ME_FIRST

## 1. 确认版本与基线

```bash
node -p "require('./package.json').version"
```

期望：

```text
0.167.0-mvp129
```

GitHub 远端在合入前应仍为：

```text
main / 55e33b3 / 0.158.0-mvp120
```

## 2. 安装依赖

Windows 建议：

```powershell
$env:NODE_OPTIONS="--max-old-space-size=8192"
npm ci --ignore-scripts --no-audit --no-fund
```

## 3. 当前稳定回归

```powershell
npm run verify:stable
```

兼容命令：

```powershell
npm run verify:all
```

两者现在执行同一条 MVP129 稳定回归链。不要把归档的 MVP01～MVP111 快照 verifier 当作当前发布门禁。

## 4. Windows 发布检查

```powershell
npm run desktop:setup
npm run desktop:smoke-check:strict
npm run desktop:pack
npm run desktop:dist
npm audit --audit-level=high
```

Round 4 已在 Windows 实机通过 portable、installer、启动、卸载和残留进程检查。

## 5. 当前禁止事项

- 不合入 MVP130。
- 不开发 MVP131。
- 不直接运行自动依赖升级或 `npm audit fix`。
- 不对真实大库执行 move-only 测试。
- 不删除真实媒体、备份或用户 AppData。
- 不把历史归档重新移回活跃根目录。
