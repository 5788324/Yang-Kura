# MVP-84 Git 推送尝试记录

version: `0.122.0-mvp84`

## 命令

```bash
git ls-remote https://github.com/5788324/Yang-Kura.git HEAD
```

## 结果

```text
fatal: unable to access 'https://github.com/5788324/Yang-Kura.git/': Could not resolve host: github.com
```

## 结论

当前环境标准 git 网络不可用，DNS 无法解析 `github.com`。

本轮不通过 GitHub API 强行写树，原因：

1. GitHub main 已落后本地 MVP83+ 基线。
2. 标准 git 路径不可用时，强推 API 更容易制造半成品树。
3. 当前正确做法仍是输出 clean source zip，回住所后用标准 git clone / branch / commit / push。

## 回住所后仍按 MVP83 推送文档执行

```bash
git clone https://github.com/5788324/Yang-Kura.git Yang-Kura-mvp84
git checkout -b mvp84-import-download-strategy
npm ci --ignore-scripts
npm run verify:all
npm run build
git add .
git commit -m "docs: absorb import and download ecosystem strategy"
git push -u origin mvp84-import-download-strategy
```
