# MVP126 → MVP127

## 版本

- 上一版：`0.164.0-mvp126`
- 当前版：`0.165.0-mvp127`

## 主要变化

- 新增 `electron/libraryIndexHealthService.ts`。
- 新增三个 preload IPC：健康检查、移除预览、打开最近存在目录。
- 设置页资源库目录中新增“缺失文件与失效记录”区域。
- 新增纯模型测试和 MVP127 verifier。

## 保持不变

- 不修改媒体文件。
- 不写入清理后的 index。
- 不改变扫描、导入器、Provider 或 mpv 主链路。
- 不暴露绝对路径。
