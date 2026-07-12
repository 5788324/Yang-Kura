# Yang-Kura Electron Windows Packaging MVP-29

## MVP-29.1: Packaged App 黑屏修复

- **根因**: `vite.config.ts` 缺少 `base: './'`，packaged `file://` 下 `/assets/...` 绝对路径加载失败
- **修复**: 添加 `base: './'` → 资源路径变为 `./assets/...`
- **调试开关**: 设置 `YANG_KURA_OPEN_DEVTOOLS=1` 环境变量可在 packaged 模式打开 DevTools

## Package Targets

- Portable Windows executable: release/Yang Kura-0.67.1-mvp29.1-portable-x64.exe
- NSIS installer: release/Yang Kura-0.67.1-mvp29.1-setup-x64.exe
- Unpacked app output may be produced by electron-builder under release/.

## Safety Rules

- Do not package node_modules as project source.
- Do not package library-index.json from a real media library.
- Do not package logs, cache, backup, data, tmp, release, or local env files.
- Do not hardcode C:\Users\YANG\Music\arsm.one or any real user media path.
- Keep real filesystem paths inside Electron main. Renderer must continue using rootPathToken and relativePath.

## Commands

- npm run desktop:pack
- npm run desktop:dist
- npm run verify:mvp29-windows-packaging

## Manual Packaged App Checks

- App starts without a white screen.
- Settings opens.
- Directory picker opens.
- Existing library-index.json can be read and applied.
- ASMR/Music library pages show indexed resources.
- Local audio playback works.
- LRC/SRT/VTT/ASS text can be read.
- External open and file-manager reveal work.
- Renderer console does not expose absolutePath or file://.
