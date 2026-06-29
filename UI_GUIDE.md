# UI_GUIDE.md

## 0. UI 目标

`Yang Kura` 的 UI 要求：

```text
好看
清晰
可维护
支持主题切换
方便 AI 修改
方便后续加功能
```

但优先级是：

```text
可维护 > 稳定 > 好看 > 动效
```

## 1. 主题集中管理

必须从 M0 创建：

```text
ui/theme.py
```

集中管理：

```text
颜色
字体
字号
间距
圆角
阴影
透明度
组件尺寸
主题变量
```

页面禁止散写：

```python
"#ffffff"
"#000000"
"blue"
"red"
10
16
24
```

所有页面必须引用 theme token。

## 2. theme.py 建议结构

```python
APP_NAME = "Yang Kura"

LIGHT_THEME = {
    "bg": "#F7F3EA",
    "surface": "#FFFFFF",
    "surface_alt": "#EFE8DA",
    "primary": "#8B5E34",
    "primary_soft": "#D7B98E",
    "accent": "#C7834B",
    "text": "#2B2118",
    "text_muted": "#756A5C",
    "border": "#E2D5C2",
    "danger": "#B84A4A",
    "warning": "#C58A22",
    "success": "#4E8A5A",
}

DARK_THEME = {
    "bg": "#17130F",
    "surface": "#211B15",
    "surface_alt": "#2B241D",
    "primary": "#D6A66D",
    "primary_soft": "#6E4A2F",
    "accent": "#E0A15F",
    "text": "#F2E8D8",
    "text_muted": "#B9A994",
    "border": "#3A3027",
    "danger": "#E06A6A",
    "warning": "#E0B15F",
    "success": "#75B884",
}

SPACING = {
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24,
    "xxl": 32,
}

RADIUS = {
    "sm": 6,
    "md": 10,
    "lg": 16,
    "xl": 24,
}

FONT_SIZE = {
    "xs": 11,
    "sm": 13,
    "md": 15,
    "lg": 18,
    "xl": 24,
    "title": 32,
}
```

具体色值可调整，但必须集中管理。

## 3. 视觉方向

建议视觉关键词：

```text
仓库
书架
暖色
木质
本地收藏
安静
有秩序
轻微日式感
现代桌面应用
```

不建议：

```text
过度赛博
过度游戏化
过多霓虹
过度复杂动效
每页风格不一致
```

## 4. 布局建议

主布局建议：

```text
左侧导航栏
顶部搜索/状态栏
主内容区
右侧详情面板可选
底部状态信息可选
```

M4 之后页面：

```text
Library View
Work Detail View
Unknown Inbox View
Duplicate RJ View
Scan View
Settings View
```

M0 只需要空壳。

## 5. 组件化规则

复杂 UI 必须放：

```text
ui/components/
```

例如：

```text
WorkCard
FileTable
WarningBadge
SearchBar
ThemeSwitcher
SectionHeader
EmptyState
```

页面只组装组件，不复制粘贴大段控件。

## 6. AI 改 UI 规则

AI 修改 UI 前必须读：

```text
UI_GUIDE.md
ui/theme.py
ui/components/
```

AI 修改 UI 后必须：

```text
运行 python main.py
确认无 Flet API 错误
确认所用 Flet 属性/方法是 requirements.txt 固定版本支持的
更新 WORKLOG.md
```

## 7. Gemini / Claude / Codex 分工

推荐：

```text
Gemini / Claude：
  视觉风格
  布局草图
  配色方案
  组件说明

Codex / DeepSeek：
  按 UI_GUIDE 实现 Flet
  不自由发挥业务逻辑
  不散写样式

ChatGPT：
  阶段边界
  验收标准
  风险判断
```

## 8. M0 UI 范围

M0 只允许：

```text
空窗口
标题 Yang Kura
当前阶段说明
基础主题变量
预留亮/暗色结构
```

不允许：

```text
复杂列表
资源库页面
扫描按钮
播放器按钮
联网按钮
真实数据表格
```
