# GitHub Push Prep MVP-83

version: `0.121.0-mvp83`

## 当前限制

公司网络不允许稳定访问 GitHub。当前不要推送，不要把 GitHub `main` 当成最新开发基线。

## 回住所后推荐流程

```bash
git clone https://github.com/5788324/Yang-Kura.git Yang-Kura-mvp83
cd Yang-Kura-mvp83
git checkout -b mvp83-beta-closeout-push-prep
```

保留 `.git`，清空旧源码，把 `yang-kura-mvp83-beta-closeout-push-prep-source.zip` 解压后的内容复制到仓库根目录。

然后运行：

```bash
npm ci --ignore-scripts
npm run lint
npm run build:electron
npm run verify:all
npm run build
npm audit --audit-level=high
```

通过后：

```bash
git status
git add .
git commit -m "chore: beta 0.1 mvp83 closeout package"
git push -u origin mvp83-beta-closeout-push-prep
```

## 注意

如果推送失败，不要在公司网络反复试。保留本地 zip、命令输出和 Git 状态。
