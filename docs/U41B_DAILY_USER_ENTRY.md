# U41-B 日常用户入口收口

## 最终状态

```text
原始基线：main @ 8a92978bbd07aa9f490ec15c9037366793168e2c
最终 PR：#92
最终候选 HEAD：961b051ed4417e4f0b99ece7191f8a48d2be22c2
合并 main：18ada58b76a3aa0828506d2d02c57ecd22fbc587
Windows Importer E2E：PASS
GitHub CI：PASS
结论：CLOSED / MERGED
```

Windows 验收使用临时来源和目标目录，验证 copy=3、Index tracks=1、source preserved=true；没有修改 `E:\arsm`。Importer 可见锚点最终统一为 `u41b-importer-primary-flow`。

## 本轮范围

U41-B 只处理 U41-A 发现的四项直接用户问题：

1. 日常导入页接入现有真实 Main 事务；
2. 删除音声库伪元数据刷新；
3. 页面版本改为单一构建来源；
4. 历史 Importer 模型退出生产依赖图。

不升级 Electron、不解冻下载器、不批量删除历史文件、不改播放器架构。

## 真实四步 Importer

### 第一步：来源与只读扫描

- 用户显式选择来源目录；
- Renderer 只接收 `rootPathToken`、目录显示名和相对路径；
- `requestScannerDryRun` 只读扫描；
- 过滤目录和 unsupported 项；
- copy 上限 200，move 上限 20。

### 第二步：目标与方式

- 目标资源库独立选择；
- 来源和目标相同则阻断；
- copy 默认保留来源；
- move 必须明确切换；
- 目标子目录拒绝绝对路径、盘符和 `..`。

### 第三步：真实预检

- 检查来源存在性；
- 检查目标同名冲突；
- 检查父目录创建计划；
- 不覆盖既有目标；
- 预检阶段不执行文件操作。

### 第四步：事务与 Index

- copy/move 使用现有 U31 事务执行器；
- 记录 OperationLog；
- 中途失败停止并回滚；
- 文件成功后生成 Index patch；
- 写入前强制创建 `library-index.json` 备份；
- 写入后读回并更新运行时协调器；
- 不向 Renderer 返回绝对路径或 `file://`。

## 目录选择 E2E 隔离

目录请求增加可选角色：

```text
library-root
import-source
import-target
```

Windows E2E 可分别使用：

```text
YANG_KURA_E2E_IMPORT_SOURCE_ROOT
YANG_KURA_E2E_IMPORT_TARGET_ROOT
```

日常资源库选择仍保持原行为。

## 伪数据刷新

生产音声库不再显示“刷新卡片显示信息”。以下行为已从生产链删除：

- 随机占位封面；
- 虚构音轨；
- “演示数据未联网”说明；
- 延时后修改 RJ 卡片的伪刷新 handler。

真实 DLsite Provider 和本地 metadata override 仍保留在其正式入口。

## 单一版本源

- `package.json` 与 `package-lock.json` 为 `0.170.0-beta.3`；
- Vite 从 `package.json` 注入 `__YANG_KURA_APP_VERSION__`；
- `SettingsPageDaily` 读取中性导出 `APP_VERSION`；
- 页面不再硬编码 Beta 2。

## 构建结果

```text
U41-A Importer chunk：约 255 KB minified
U41-B Importer chunk：22.03 KB minified / 6.62 KB gzip
```

旧历史模型已经退出生产 Importer import graph。它们暂时成为不可达模块，统一留给 U41-D 批量清理。

## 自动验证

本地已通过：

- TypeScript lint；
- Renderer production build；
- Electron build；
- U41-B focused verifier；
- U40-D 旧门禁兼容；
- U31 copy/move、冲突和回滚；
- U30 UI fast-track；
- Beta 3 runtime hardening；
- 50,000 音轨性能；
- MVP129 Index maintenance。

Windows Electron 可见流程 E2E 已编写，但当前 Linux 环境不具备 Windows Electron 运行条件，状态为 `NOT RUN`。它必须在 Draft PR CI 和 Codex 实机中通过后才能关闭 U41-BLOCKER-001。
