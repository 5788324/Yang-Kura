import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type MediaChannelKey = keyof typeof IPC_CHANNELS.media;

export function registerMediaHandler(channel: MediaChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.media[channel], handler);
}
