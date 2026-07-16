import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type LibraryChannelKey = keyof typeof IPC_CHANNELS.library;

export function registerLibraryHandler(channel: LibraryChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.library[channel], handler);
}
