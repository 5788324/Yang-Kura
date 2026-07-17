# U39-A 播放器底栏语义主题一致性

## 状态

完成。该轮只处理播放器日常表层，不修改播放运行时、后端或数据状态。

## 问题

底部播放器及其弹层仍大量使用固定 `zinc` 深色类。切换 Acrylic Mist 或 Ocean Drops 时，页面主体会更换材质，但 PlayerBar、歌单菜单、音量弹层、Seek 预览和歌词浮窗仍保持黑色，导致主题割裂。

## 本轮范围

- `PlayerBar.tsx`
- `PlayerBarPrimarySections.tsx`
- `PlayerBarAuxiliaryControls.tsx`
- `PlayerProgressTrack.tsx`
- `PlayerTransientPresenters.tsx`

## 主题规则

结构层只使用：

```text
player-bg
card-bg
hover-bg
border-color
text-primary
text-secondary
text-muted
brand-color
brand-color-hover
```

允许继续使用的状态色：

- `rose`：错误与收藏；
- `amber`：非致命提示；
- `emerald`：运行状态；
- 品牌强调色：当前主题的 `brand-color`。

禁止用固定 `zinc` 深色承担播放器背景、容器、边框和主文字层级。

## 用户可见变化

- 底栏跟随当前主题背景与边框；
- 主控制区、时间、队列和完成策略跟随主题；
- 进度条使用主题品牌色；
- 歌单、音量、Seek 预览、歌词浮窗和 Toast 与底栏材质一致；
- 键盘焦点统一使用主题品牌色；
- 全局播放器暴露明确的 `region` 语义。

## 行为冻结

本轮不得改变：

- mpv / HTMLAudio 与 fallback；
- 播放、暂停、上一首、下一首；
- Seek 计算和提交；
- Queue、History、续播；
- 字幕加载和显示；
- 完成策略、音量和静音逻辑。

## 验证

- TypeScript；
- Renderer production build；
- Electron build；
- `verify-u39a-playerbar-theme.mjs`；
- U30 Electron 主题与无障碍矩阵。

播放器视觉改动使用 `Player Fast Validation`；不触发 portable、NSIS、安装或卸载验收。
