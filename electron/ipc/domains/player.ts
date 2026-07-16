import { IPC_CHANNELS } from '../contracts.js';
import { registerInvokeHandler, type IpcInvokeHandler } from '../registerInvokeHandler.js';

type PlayerInvokeChannelKey = Exclude<keyof typeof IPC_CHANNELS.player, 'mpvEvent'>;

export function registerPlayerHandler(channel: PlayerInvokeChannelKey, handler: IpcInvokeHandler): void {
  registerInvokeHandler(IPC_CHANNELS.player[channel], handler);
}
