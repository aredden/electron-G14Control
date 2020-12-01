/** @format */

import { exec } from 'child_process';
import { IpcMain, BrowserWindow, app } from 'electron';
import path from 'path';
import { setAutoLaunch } from '../AutoLaunch';
import { writeConfig } from './ConfigLoader';
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
	ipc.handle(
		'setAutoLaunch',
		async (event, enabled: boolean, config: G14Config) => {
			let result = await setAutoLaunch(enabled);
			let write = await writeConfig(config);
			if (result && write) {
				return true;
			}
		}
	);
};
