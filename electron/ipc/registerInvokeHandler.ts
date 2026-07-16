import { ipcMain } from 'electron';
import type { IpcChannel } from './contracts.js';

export type IpcInvokeHandler = Parameters<typeof ipcMain.handle>[1];

export function registerInvokeHandler(channel: IpcChannel, handler: IpcInvokeHandler): void {
  ipcMain.removeHandler(channel);
  ipcMain.handle(channel, handler);
}
