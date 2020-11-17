/** @format */

import { IpcMain, BrowserWindow } from 'electron';
import { updateMenuVisible } from '../electron';
import { killEmitters } from './IPCEmitters';

export const buildElectronListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('exitWindow', () => {
		killEmitters();
		win.setSkipTaskbar(true);
		win.minimize();
		updateMenuVisible(true);
	});
	ipc.handle('minimizeWindow', () => {
		killEmitters();
		win.minimize();
		win.setSkipTaskbar(false);
		updateMenuVisible(true);
	});
};
