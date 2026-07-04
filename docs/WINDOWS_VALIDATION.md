# MVP-08.1 Windows Validation Guide

本文件是本地验收入口。MVP-08.1 的目标是减少 Windows / npm / zip 环境问题，而不是新增业务功能。

## 1. 推荐环境

```text
Node: 22.x LTS
npm: 10.x
OS: Windows 10 / Windows 11
Shell: PowerShell 7 或 Windows Terminal
```

不建议用 Node 24 + npm 11 作为本项目当前验收基线。若必须临时使用，可设置：

```powershell
$env:YANG_KURA_ALLOW_UNSUPPORTED_NODE="1"
```

这只适合冒烟测试，不适合作为正式 PASS 结论。

## 2. 解压建议

优先使用 ASCII 路径，例如：

```text
C:	mp\yang-kura-mvp081```

推荐解压：

```powershell
tar -xf yang-kura-audio-library-mvp081-validation-friendly.zip -C C:	mp\yang-kura-mvp081
```

不优先使用 PowerShell `Expand-Archive`。旧包中存在中日文 fixture 路径，可能在部分环境出现解压异常。MVP-08.1 已把实际 fixture 文件树改成 ASCII-safe manifest，运行样本仍来自 `src/services/fixtureLibrarySample.ts`。

## 3. registry 策略

正式验收推荐官方 registry：

```powershell
npm config set registry https://registry.npmjs.org/
```

如果国内网络必须使用镜像源安装，安装后请把 audit 单独切回官方源：

```powershell
npm config set registry https://registry.npmmirror.com
npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm audit --registry=https://registry.npmjs.org/ --audit-level=high
```

`npmmirror` 可能不支持 npm audit 的安全接口，出现 `NOT_IMPLEMENTED /-/npm/v1/security/*` 不代表项目依赖有漏洞。

## 4. 标准验收命令

```powershell
node -v
npm -v
npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm run verify:env
npm run lint
npm run verify:all
npm run build
npm audit --registry=https://registry.npmjs.org/ --audit-level=high
npm run dev
```

`verify:all` 已包含 `verify:env`，单独运行是为了提前暴露 Node/npm 版本问题。

## 5. 常见 STOP 原因

### npm `Exit handler never called!`

通常是 npm / Node 版本、缓存或网络问题。处理顺序：

```powershell
npm cache clean --force
rmdir /s /q node_modules
npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
```

若仍失败，切换 Node 22 LTS + npm 10 后重试。

### `tsc` / `vite` 不存在

说明 `npm ci` 没有完成。不要修源码，先解决依赖安装。

### `npm audit` 在镜像源失败

改用：

```powershell
npm audit --registry=https://registry.npmjs.org/ --audit-level=high
```

## 6. 当前边界

MVP-08.1 仍然不做：

```text
不接 Electron
不读真实硬盘
不扫描 E:rsm
不写 library-index.json
不写 SQLite
不接真实 HTMLAudio
不读取真实 LRC
不改下载器为真实下载
不删除 / 移动 / 重命名任何文件
```
