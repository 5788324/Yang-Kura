import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type ImporterChannelKey = keyof typeof IPC_CHANNELS.importer;

export function registerImporterHandler(channel: ImporterChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.importer[channel], handler);
}
