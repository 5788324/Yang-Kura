import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function run(executable, args, timeoutMs) {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };
    let child;
    try {
      child = spawn(executable, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true, shell: false });
    } catch (error) {
      finish({ ok: false, code: null, stdout, stderr: String(error), timedOut: false });
      return;
    }
    const timer = setTimeout(() => {
      child.kill();
      finish({ ok: false, code: null, stdout, stderr, timedOut: true });
    }, timeoutMs);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => { if (stdout.length < 8192) stdout += chunk; });
    child.stderr.on('data', (chunk) => { if (stderr.length < 8192) stderr += chunk; });
    child.once('error', (error) => {
      clearTimeout(timer);
      finish({ ok: false, code: null, stdout, stderr: String(error), timedOut: false });
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      finish({ ok: code === 0, code, stdout, stderr, timedOut: false });
    });
  });
}

const force = process.env.YANG_KURA_MPV_TEST_FORCE === '1';
if (process.platform !== 'win32' && !force) {
  console.log('MVP123 mpv Windows sample check SKIP: current platform is not Windows.');
  process.exit(0);
}

const executable = readArg('--mpv') || process.env.YANG_KURA_MPV_PATH || 'mpv.exe';
const executableLabel = path.basename(executable) || 'mpv.exe';
const version = await run(executable, ['--version'], 5000);
if (!version.ok) {
  console.error(`MVP123 mpv check FAIL: ${executableLabel} unavailable${version.timedOut ? ' (timeout)' : ''}.`);
  process.exit(1);
}
const versionLabel = (version.stdout || version.stderr).split(/\r?\n/).map((line) => line.trim()).find(Boolean) || executableLabel;
console.log(`MVP123 mpv executable PASS: ${versionLabel.slice(0, 120)}`);

const samplePath = readArg('--sample') || process.env.YANG_KURA_MPV_TEST_AUDIO;
if (!samplePath) {
  console.log('MVP123 sample decode SKIP: set YANG_KURA_MPV_TEST_AUDIO or use --sample to test one small audio file.');
  process.exit(0);
}
if (!fs.existsSync(samplePath) || !fs.statSync(samplePath).isFile()) {
  console.error(`MVP123 sample decode FAIL: sample file ${path.basename(samplePath)} does not exist.`);
  process.exit(1);
}

const sample = await run(executable, [
  '--no-config',
  '--no-video',
  '--ao=null',
  '--start=0',
  '--length=0.5',
  '--really-quiet',
  samplePath,
], 15000);
if (!sample.ok) {
  console.error(`MVP123 sample decode FAIL: ${path.basename(samplePath)}${sample.timedOut ? ' timed out' : ''}.`);
  process.exit(1);
}
console.log(`MVP123 sample decode PASS: ${path.basename(samplePath)} (read-only, 0.5 second null-audio test).`);
