/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { setRyzenadj } from './ryzenadj/ModifyCPU';

export const buildRyzenADJListeners = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.on('setRyzenadj', async (_event, settings: RyzenadjConfig) => {
		let adjResult = await setRyzenadj(settings);
		if (adjResult) {
			window.webContents.send('setRyzenadjResult', adjResult);
		}
	});
};
