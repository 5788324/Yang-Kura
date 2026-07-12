# Codex Push Ready — MVP-85

版本：`0.123.0-mvp85`

## 用途

这是给 Codex / 本机 Git 推送用的 clean source 包说明。

当前沙盒环境标准 Git 访问 GitHub 失败，错误是无法解析 `github.com`。因此本包只负责整理源码和验证，不在沙盒内推送。

## 推荐推送流程

```bash
git clone https://github.com/5788324/Yang-Kura.git Yang-Kura-mvp85
cd Yang-Kura-mvp85
git checkout -b mvp85-import-download-models
```

然后：

```text
1. 保留 .git 目录。
2. 清空旧源码文件。
3. 解压本 clean source 包。
4. 把包内文件复制到仓库根目录。
5. 运行验证。
6. 提交并 push 新分支。
```

验证命令：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:mvp85-import-download-models
npm run verify:all
npm run build
npm audit --audit-level=high
```

提交命令：

```bash
git status
git add .
git commit -m "chore: add mvp85 import download model contracts"
git push -u origin mvp85-import-download-models
```

## 注意

- GitHub main 不是当前最新基线。
- 当前最新基线是本地 clean source 包。
- 不要从旧 GitHub main 继续直接开发。
- 不要把 `node_modules`、`dist`、`dist-electron`、日志文件提交进仓库。
