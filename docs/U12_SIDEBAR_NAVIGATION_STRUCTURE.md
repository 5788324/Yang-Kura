# U12 Sidebar Navigation Structure

## Purpose

`Sidebar.tsx` previously rendered the daily and maintenance navigation groups with two nearly identical map blocks and recreated both navigation arrays on every render. U12 consolidates that structure without changing destinations, labels, ordering or reset behavior.

## Changes

- navigation items are typed with `PageType` and `LucideIcon`;
- daily and maintenance item definitions are module-level readonly constants;
- `SidebarNavSection` renders both navigation groups;
- section headings use `aria-labelledby` relationships;
- active items retain `aria-current="page"`;
- navigation, search and clear controls receive explicit `focus-visible` treatment;
- the decorative logo pulse explicitly respects reduced-motion preferences;
- the redundant search `aria-label` is removed because the associated `<label>` already provides the accessible name;
- the unused `void currentTheme` statement and repeated `as PageType` casts are removed.

## Preserved contract

The following destinations and order remain unchanged:

1. 首页
2. ASMR
3. 流行音乐
4. 我的歌单
5. 导入器
6. 系统设置
7. 下载规划
8. 诊断工具

Every navigation action still clears ASMR-detail and playlist-detail state before switching pages. The legacy `导入规划` verifier marker remains in source while the visible user label remains `导入器`.

## Boundaries

U12 does not change routing, page components, search behavior, theme selection, downloader status, importer behavior, media data or Electron code.

## Verification

`scripts/verify-u12-sidebar-navigation-structure.mjs` checks the typed constants, shared renderer, semantic sections, focus styling, destination contract and removal of the duplicated implementation. The normal Windows Pull Request gate still runs dependency audit, all U verifiers, `verify:stable` and the production build.
