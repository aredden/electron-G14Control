/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { setRyzenadj } from './ryzenadj/ModifyCPU';

export const buildRyzenADJListeners = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.handle('setRyzenadj', async (_event, settings: RyzenadjConfig) => {
		let adjResult = await setRyzenadj(settings);
		return adjResult;
	});
};
