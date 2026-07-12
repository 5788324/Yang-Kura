# ASMR Detail Side Rail MVP-57

## 版本

`0.95.0-mvp57`

## 本轮内容

MVP-57 对音声详情页右侧栏进行小范围 polish。

新增：

- `src/services/asmrDetailSideRailService.ts`
- `mvp57-asmr-side-rail`
- `mvp57-asmr-detail-side-rail-review`
- `scripts/verify-mvp57-asmr-detail-side-rail.mjs`

## 用户向变化

- “作品主观评分与听后归档”收成“个人听音记录”。
- 个人笔记占位语更简洁，不再过度强调具体敏感场景。
- 资源库文件记录改为资源库记录概览。
- 字幕状态改为已匹配 / 未匹配 / 播放正常这类用户可理解表达。
- 继续避免真实绝对路径和 `file://` 暴露。

## 代码结构

`asmrDetailSideRailService` 集中生成：

- 个人听音侧栏模型
- 资源库记录模型
- 字幕状态模型
- 诊断页说明模型

## 安全边界

本轮不改真实扫描、索引写入、播放内核、字幕读取、文件打开、打包链路。
