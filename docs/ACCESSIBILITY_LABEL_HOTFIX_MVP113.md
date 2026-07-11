# MVP113 — Accessibility Label Hotfix

## 问题

MVP112 已修复按钮可访问名称和隐藏工程标记，但 `libraryCardLayoutPolishService` 仍把 MVP76 布局验收说明直接作为音声库、音乐歌曲列表和音乐专辑列表的 `aria-label`。因此屏幕阅读器仍会朗读工程维护信息。

## 修复

仅替换三个可访问名称：

```text
音声作品列表
音乐库歌曲列表
音乐专辑列表
```

组件绑定方式未变，布局、筛选、播放与卡片实现未变。

## 验证

`verify:mvp113-accessibility-label-hotfix` 检查：

1. 三个用户标签存在；
2. 三个标签不包含 `MVP76`；
3. MusicLibrary / AsmrLibrary 仍绑定服务返回值；
4. 用户列表组件的 aria 属性中不允许重新出现 MVP 阶段文案。
