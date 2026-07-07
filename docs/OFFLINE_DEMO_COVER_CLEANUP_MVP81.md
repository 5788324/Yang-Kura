# MVP-81 离线 Demo 封面清扫

当前版本：`0.119.0-mvp81`。

## 背景

DeepSeek 运行时审查中观察到：UI 可以正常运行，但沙箱/公司网络下 Unsplash 图片会被阻断，控制台出现图片请求失败。这不是主链路 bug，但会降低打包版观感，也不符合 Yang-Kura 的本地隐私定位。

## 处理

MVP-81 将 Demo 封面从远程图片改为本地生成 SVG：

```text
coverArtworkService.makeFallbackCover(title, subtitle, kind)
```

该方法输出 `data:image/svg+xml`，不会访问网络，不读取真实磁盘，也不会暴露真实路径。

## 覆盖区域

| 区域 | 处理 |
|---|---|
| `mockData.ts` | COVERS 全部改为本地生成封面 |
| `DownloaderPage.tsx` | Demo 下载任务 / 解析结果封面改为本地生成封面 |
| `DiagnosticsPage.tsx` | Demo 扫描 / 导入示例封面改为本地生成封面 |
| `App.tsx` | Demo 元数据刷新候选封面改为本地生成封面 |
| `playlistPersistenceService.ts` | 自建歌单默认封面改为本地生成封面 |

## 验收

- `src/` 下不再出现 `images.unsplash.com`。
- 不新增 `fetch` / `axios` / 网络下载逻辑。
- 不新增文件写入 / 删除 / 重命名逻辑。
- `npm run verify:mvp81-offline-demo-cover-cleanup` 通过。
- `npm run verify:all` 通过或在当前环境超时时分段补跑。

## 安全边界

```text
不接 SQLite
不接下载器
不接 ASMR.one / DLsite / 网易云元数据抓取
不接 mpv
不删除 / 移动 / 重命名真实媒体文件
不向 Renderer 暴露 absolutePath
不向 Renderer 暴露 file://
不改真实扫描 / 写 index / 播放内核链路
```
