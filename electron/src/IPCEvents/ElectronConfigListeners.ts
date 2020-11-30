/** @format */

import { exec } from 'child_process';
import { IpcMain, BrowserWindow, app } from 'electron';
import path from 'path';
export const buildElectronListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('exitWindow', () => {
		win.hide();
		return;
	});
	ipc.handle('minimizeWindow', () => {
		win.minimize();
		return;
	});
	ipc.handle('exitApp', () => {
		app.exit();
	});
	ipc.handle('openLogs', () => {
		exec(`explorer "${path.join(app.getPath('exe'), '../', 'logs')}"`);
	});
};
