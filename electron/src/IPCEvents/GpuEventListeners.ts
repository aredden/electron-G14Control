/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { getDisplays, resetGPU } from './gpu/gpu';

export const buildGPUListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('resetGPU', async () => {
		let result = await resetGPU();
		if (result) {
			return true;
		} else {
			return false;
		}
	});
};
