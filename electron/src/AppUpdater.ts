/** @format */

import { BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import getLogger from './Logger';

export default class AppUpdater {
	constructor(browserWindow: BrowserWindow) {
		const LOGGER = getLogger('AppUpdater');
		autoUpdater.checkForUpdatesAndNotify();
		autoUpdater.on('update-available', () => {
			browserWindow.webContents.send('update_available');
		});
		autoUpdater.on('update-downloaded', () => {
			browserWindow.webContents.send('update_downloaded');
		});
	}
}
