/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { setRyzenadj } from './ryzenadj/ModifyCPU';

export const buildRyzenADJListeners = (ipc: IpcMain, window: BrowserWindow) => {
	ipc.handle('setRyzenadj', async (_event, settings: RyzenadjConfig) => {
		let newSettings: RyzenadjConfig = {
			slowLimit: settings.slowLimit * 1000,
			fastLimit: settings.fastLimit * 1000,
			tctlTemp: settings.tctlTemp,
			slowTime: settings.slowTime,
			stapmLimit: settings.stapmLimit * 1000,
			stapmTime: settings.stapmTime,
		};
		let adjResult = await setRyzenadj(newSettings);
		return adjResult;
	});
};
