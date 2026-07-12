#!/usr/bin/env node
import fs from 'node:fs';
import net from 'node:net';

if (process.argv.includes('--version')) {
  console.log('mpv 0.39.0 Yang-Kura fake fixture');
  process.exit(0);
}

const endpointArg = process.argv.find((arg) => arg.startsWith('--input-ipc-server='));
if (!endpointArg) process.exit(2);
const endpoint = endpointArg.slice('--input-ipc-server='.length);
if (process.platform !== 'win32') {
  try { fs.rmSync(endpoint, { force: true }); } catch {}
}

const server = net.createServer((socket) => {
  let buffer = '';
  const send = (payload) => socket.write(`${JSON.stringify(payload)}\n`);
  socket.setEncoding('utf8');
  socket.on('data', (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.trim()) continue;
      const message = JSON.parse(line);
      const command = message.command ?? [];
      send({ request_id: message.request_id, error: 'success' });
      if (command[0] === 'loadfile') {
        setTimeout(() => {
          send({ event: 'file-loaded' });
          send({ event: 'property-change', name: 'duration', data: 123.5 });
          send({ event: 'property-change', name: 'time-pos', data: 1.25 });
          send({ event: 'property-change', name: 'pause', data: false });
        }, 20);
      } else if (command[0] === 'seek') {
        send({ event: 'property-change', name: 'time-pos', data: Number(command[1]) || 0 });
      } else if (command[0] === 'set_property' && command[1] === 'pause') {
        send({ event: 'property-change', name: 'pause', data: Boolean(command[2]) });
      }
    }
  });
});
server.listen(endpoint);
const close = () => server.close(() => process.exit(0));
process.on('SIGTERM', close);
process.on('SIGINT', close);
