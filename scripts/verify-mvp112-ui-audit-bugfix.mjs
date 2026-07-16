import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const required = (text, token, label) => { if (!text.includes(token)) throw new Error(`Missing ${label}: ${token}`); };
const forbidden = (text, token, label) => { if (text.includes(token)) throw new Error(`Forbidden ${label}: ${token}`); };

const pkg = JSON.parse(read("package.json"));
const versionMatch = /^(\d+)\.(\d+)\.(\d+)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.exec(pkg.version);
if (!versionMatch) throw new Error(`Invalid semantic version: ${pkg.version}`);
const [major, minor] = versionMatch.slice(1, 3).map(Number);
if (major === 0 && minor < 150) throw new Error(`Version predates MVP112: ${pkg.version}`);
required(read('scripts/run-stable-regression.mjs'), 'verify:mvp112-ui-audit-bugfix', 'verify:stable chain');

const app = read("src/App.tsx");
const router = read("src/app/AppRouter.tsx");
required(app, "mainContentRef", "scroll container ref");
required(app, "scrollTo({ top: 0", "page scroll reset");
required(app, "import AppRouter from './app/AppRouter';", "AppRouter composition boundary");
if (!router.includes("lazy(() => import('../components/DiagnosticsPage'))") && !router.includes("lazy(() => import('../components/DiagnosticsPageShell'))")) throw new Error('Missing diagnostics code splitting in AppRouter');
required(app, "settingsPathPrivacyService.sanitizeSettings", "settings sanitizer");

const settings = read("src/components/SettingsPage.tsx");
required(settings, "settingsPathPrivacyService.getDisplayValue(pathItem)", "safe path display");
forbidden(settings, "{pathItem.path}", "raw path rendering");
required(settings, 'readOnly={newAsmrType === "local"}', "local path input lock");
required(settings, 'readOnly={newMusicType === "local"}', "music path input lock");

const privacy = read("src/services/settingsPathPrivacyService.ts");
required(privacy, "WINDOWS_ABSOLUTE_PATH", "Windows absolute path detection");
required(privacy, "旧本地路径已清除", "legacy path migration");
required(privacy, "rootPathToken:", "token preservation");

const downloader = read("src/components/DownloaderPage.tsx");
required(downloader, "notificationSequenceRef", "unique notification sequence");
required(downloader, 'const showLegacyDownloaderDemo = false', "legacy downloader UI disabled");
forbidden(downloader, "const id = Date.now().toString()", "duplicate notification id");

const importer = read("src/components/ImporterPage.tsx");
required(importer, "mvp112-importer-primary-flow", "daily importer flow");
required(importer, "高级导入工具（识别、冲突与执行）", "user-facing importer fold");

const diagnostics = read("src/components/DiagnosticsPage.tsx");
required(diagnostics, "mvp112-diagnostics-lightweight-shell", "lightweight diagnostics shell");
required(diagnostics, "showMaintenanceDetails", "deferred diagnostics rendering");
required(diagnostics, "DiagnosticsMaintenanceContent", "maintenance split");

const music = read("src/components/MusicLibrary.tsx");
required(music, "aria-label={isFav ?", "favorite accessible name");
required(music, "aria-label={`播放 ${track.title}`}", "play accessible name");
required(music, "opacity-70 hover:opacity-100 focus-visible:opacity-100", "always-visible track play control");

console.log("PASS MVP112 UI audit bugfix verifier");
