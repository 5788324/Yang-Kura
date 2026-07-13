import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadTypeScriptModule(path) {
  const source = fs.readFileSync(path, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      strict: true,
    },
    fileName: path,
  });

  const runtimeModule = { exports: {} };
  const context = vm.createContext({
    module: runtimeModule,
    exports: runtimeModule.exports,
    console,
    globalThis,
  });
  new vm.Script(compiled.outputText, { filename: path }).runInContext(context);
  return runtimeModule.exports;
}

const timers = loadTypeScriptModule('src/player/transientUiTimers.ts');

let nextHandle = 1;
const scheduled = new Map();
const cleared = [];
const scheduler = {
  set(callback, delayMs) {
    const handle = nextHandle++;
    scheduled.set(handle, { callback, delayMs });
    return handle;
  },
  clear(handle) {
    cleared.push(handle);
    scheduled.delete(handle);
  },
};

let callbackCount = 0;
const timer = timers.createResettableTimeout(() => {
  callbackCount += 1;
}, 800, scheduler);

assert.equal(timer.isPending(), false);
timer.schedule();
assert.equal(timer.isPending(), true);
assert.equal(scheduled.get(1).delayMs, 800);
timer.schedule();
assert.deepEqual(cleared, [1]);
assert.equal(scheduled.has(1), false);
assert.equal(scheduled.get(2).delayMs, 800);
scheduled.get(2).callback();
assert.equal(callbackCount, 1);
assert.equal(timer.isPending(), false);

timer.schedule();
assert.equal(timer.isPending(), true);
timer.cancel();
assert.equal(timer.isPending(), false);
assert.equal(scheduled.has(3), false);

let zeroDelay = -1;
const zeroDelayTimer = timers.createResettableTimeout(
  () => {},
  Number.NaN,
  {
    set(callback, delayMs) {
      zeroDelay = delayMs;
      return callback;
    },
    clear() {},
  },
);
zeroDelayTimer.schedule();
assert.equal(zeroDelay, 0);

const hookSource = fs.readFileSync('src/hooks/usePlayerTransientUi.ts', 'utf8');
for (const marker of [
  'PLAYER_VOLUME_HIDE_DELAY_MS = 800',
  'PLAYER_TOAST_DURATION_MS = 2500',
  'export function useDelayedVisibility',
  'export function useAutoDismissMessage',
  'createResettableTimeout(() => setIsVisible(false), delayMs)',
  'createResettableTimeout(() => setMessage(null), delayMs)',
  'useEffect(() => () => hideTimer.cancel(), [hideTimer])',
  'return () => dismissTimer.cancel()',
]) {
  assert.ok(hookSource.includes(marker), `transient UI hook contract missing: ${marker}`);
}

const playerBar = fs.readFileSync('src/components/PlayerBar.tsx', 'utf8');
for (const marker of [
  "from '../hooks/usePlayerTransientUi'",
  'isVisible: isVolumePopoverVisible',
  'show: handleVolumeMouseEnter',
  'scheduleHide: handleVolumeMouseLeave',
]) {
  assert.ok(playerBar.includes(marker), `PlayerBar volume lifecycle integration missing: ${marker}`);
}

const actionHook = fs.readFileSync('src/hooks/usePlayerBarActions.ts', 'utf8');
for (const marker of [
  "from './usePlayerTransientUi'",
  'const { message: playerToastMessage, showMessage } = useAutoDismissMessage();',
  'playerToastMessage,',
]) {
  assert.ok(actionHook.includes(marker), `player action Toast integration missing: ${marker}`);
}

for (const forbidden of [
  'volumeTimeoutRef',
  'const [showVolumeSlider, setShowVolumeSlider]',
  'const [toastMessage, setToastMessage]',
  'setTimeout(() => setPlayerToastMessage(null)',
  'useEffect(() => {\n    return () => {\n      if (volumeTimeoutRef.current)',
  'useAutoDismissMessage()',
]) {
  assert.ok(!playerBar.includes(forbidden), `PlayerBar still owns transient lifecycle: ${forbidden}`);
}

const progressDocuments = `${fs.readFileSync('PROJECT_STATE.md', 'utf8')}\n${fs.readFileSync('PROJECT_ROADMAP.md', 'utf8')}`;
for (const marker of ['U15', 'U16', '临时 UI 生命周期', 'MVP130']) {
  assert.ok(progressDocuments.includes(marker), `project progress missing U16 fact: ${marker}`);
}

console.log('U16 player transient UI hooks verifier PASS');
