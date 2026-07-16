import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type MetadataChannelKey = keyof typeof IPC_CHANNELS.metadata;

export function registerMetadataHandler(channel: MetadataChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.metadata[channel], handler);
}
