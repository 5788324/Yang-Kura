import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const checks = [];
const assert = (condition, message) => {
  if (!condition) {
    console.error(`[MVP-25 FAIL] ${message}`);
    process.exitCode = 1;
  } else {
    checks.push(message);
  }
};

const main = read('electron/main.ts');
const preload = read('electron/preload.ts');
const api = read('src/types/electron-api.d.ts');
const hook = read('src/hooks/useAudioPlayer.ts');
const adapter = read('src/services/libraryIndexAdapter.ts');
const types = read('src/types.ts');
const playerBar = read('src/components/PlayerBar.tsx');
const docs = read('docs/ELECTRON_HTML_AUDIO_PLAYBACK_MVP25.md');

assert(main.includes("protocol.registerSchemesAsPrivileged"), 'Electron main registers the privileged media protocol scheme.');
assert(main.includes("protocol.handle('yang-kura-media'"), 'Electron main handles yang-kura-media:// requests.');
assert(main.includes("yang-kura:media:resolve-track-url"), 'Electron main exposes resolve-track-url IPC.');
assert(main.includes('HTML_AUDIO_PLAYABLE_EXTENSIONS'), 'Electron main limits HTMLAudio playable extensions.');
assert(main.includes('resolveSafeMediaPath'), 'Electron main validates root token + relativePath before serving media.');
assert(main.includes('pathToFileURL'), 'Electron main converts only inside protocol handler; renderer does not receive file://.');
assert(preload.includes('requestResolveTrackMediaUrl'), 'Preload exposes requestResolveTrackMediaUrl.');
assert(api.includes('YangKuraResolveTrackMediaUrlRequest'), 'Renderer API type includes media URL request.');
assert(api.includes("mediaProtocol: 'yang-kura-media'"), 'Renderer API type uses tokenized media protocol.');
assert(types.includes('rootPathToken?: string'), 'AudioTrack carries rootPathToken for real index tracks.');
assert(types.includes('sourceRelativePath?: string'), 'AudioTrack carries sourceRelativePath for real index tracks.');
assert(adapter.includes('rootTokenFromRoot'), 'Library index adapter extracts rootPathToken from LocalJsonIndex root.');
assert(adapter.includes("playbackSourceKind: hasTokenizedLocalSource && isPlayableAudio ? 'tokenized-local-file'"), 'Adapter maps real index tracks into tokenized local playback tracks.');
assert(hook.includes('new Audio()'), 'useAudioPlayer creates a real HTMLAudio element.');
assert(hook.includes('requestResolveTrackMediaUrl'), 'useAudioPlayer resolves tokenized local media URL before playback.');
assert(hook.includes("playbackMode === 'html-audio'"), 'useAudioPlayer has real HTMLAudio playback mode.');
assert(playerBar.includes('本地音频播放'), 'PlayerBar displays real local audio playback status.');
assert(docs.includes('MVP-25'), 'MVP-25 documentation exists.');

if (process.exitCode) {
  process.exit(process.exitCode);
}
console.log(`[MVP-25 PASS] ${checks.length} checks passed.`);
