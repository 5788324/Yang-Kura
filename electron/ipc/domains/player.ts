import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type PlayerChannelKey = keyof typeof IPC_CHANNELS.player;

export function registerPlayerHandler(channel: PlayerChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.player[channel], handler);
}
