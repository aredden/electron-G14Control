/** @format */

import { IpcMain, BrowserWindow } from 'electron';
import { updateMenuVisible } from '../electron';
import { killEmitters } from './IPCEmitters';

export const buildElectronListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('exitWindow', () => {
		updateMenuVisible(true);
		killEmitters();
		win.setSkipTaskbar(true);
		win.minimize();
	});
	ipc.handle('minimizeWindow', () => {
		updateMenuVisible(true);
		killEmitters();
		win.minimize();
		win.setSkipTaskbar(false);
	});
};
