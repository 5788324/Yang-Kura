# Yang-Kura 当前路线：MVP-28

## 当前版本

```text
0.66.0-mvp28
```

## 当前定位

Yang-Kura 当前已经从 UI 原型推进为：

```text
React + Vite + TypeScript
+ Electron 桌面壳
+ Local JSON Index
+ 用户选择目录
+ 只读扫描
+ index 写入 / 读取
+ HTMLAudio 本地播放
+ 字幕读取
+ 外部打开视频 / 图片 / 文件
```

## MVP-28 目标

MVP-28 不继续堆业务功能，先做桌面验收收口：

```text
Windows 本机运行流程
桌面链路验收脚本
desktop-validation-bundle
完整手工验收清单
```

## 已完成主线

| 阶段 | 状态 | 内容 |
|---|---|---|
| MVP-19 | PASS | 真实目录选择 dialog + tokenized root |
| MVP-20 | PASS | 小样本只读 dry-run 扫描 |
| MVP-21/22 | PASS | dry-run 报告 + index 写入预览 |
| MVP-23 | PASS | 用户确认后写 library-index.json |
| MVP-24 | PASS | 读取真实 index 并映射 UI |
| MVP-25 | PASS | HTMLAudio 本地播放 |
| MVP-26 | PASS | LRC / SRT / VTT / ASS 字幕读取 |
| MVP-27 | PASS | 视频 / 图片 / 文件外部打开 |
| MVP-28 | PASS | Windows 桌面验收与打包准备 |

## 下一步选择

MVP-28 后不要盲目继续加功能。先由用户在 Windows 本机跑：

```bash
npm ci
npm run electron:install
npm run desktop:dev
```

本机通过后，下一轮二选一：

| 方向 | 适合条件 |
|---|---|
| MVP-29 Windows 打包 | 本机链路基本可跑通 |
| UI 去工程化 / 网易云风格精修 | 用户已确认核心链路可用，但界面仍偏工具面板 |

## 短期不做

```text
SQLite
下载器
ASMR.one / DLsite 元数据
转录翻译
字幕生成
批量文件整理
删除 / 移动 / 重命名
```
