/** @format */

import { exec } from 'child_process';
import { IpcMain, BrowserWindow, app, globalShortcut } from 'electron';
import path from 'path';
import { setAutoLaunch } from '../AutoLaunch';
import getLogger from '../Logger';
import { writeConfig } from './ConfigLoader';
import { minMaxFunc } from '../electron';
const LOGGER = getLogger('ElectronSettings');
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
	ipc.handle('setAutoLaunch', async (event, enabled: boolean, config: G14Config) => {
		let result = await setAutoLaunch(enabled);
		let write = await writeConfig(config);
		if (result && write) {
			return true;
		}
	});
	ipc.handle('editShortcuts', (event, keys: ShortCuts) => {
		if (keys) {
			if (!keys.minmax.enabled) {
				globalShortcut.unregisterAll();
				globalShortcut.unregister(keys.minmax.accelerator);
				LOGGER.info('Disabled minmax shortcut');
				return true;
			} else {
				if (!globalShortcut.isRegistered(keys.minmax.accelerator)) {
					let result = globalShortcut.register(keys.minmax.accelerator, minMaxFunc);
					LOGGER.info('Enabled minmax shortcut');
					return result;
				} else {
					LOGGER.info('Minmax shortcut was already enabled');
					return true;
				}
			}
		} else {
			LOGGER.info('Problem with editShortcuts command. Shortcuts were not sent to handler.');
			return false;
		}
	});
};
