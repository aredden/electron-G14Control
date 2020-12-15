/** @format */

import { BrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import getLogger from './Logger';

let LOGGER = getLogger('AutoUpdater');

export default class AppUpdater {
	constructor(browserWindow: BrowserWindow) {
		const LOGGER = getLogger('AppUpdater');
		autoUpdater.allowPrerelease = true;
		LOGGER.info(autoUpdater.getFeedURL());
		autoUpdater.checkForUpdatesAndNotify().then((val) => {
			LOGGER.info('gotinfo: ' + JSON.stringify(val.updateInfo));
		});
		autoUpdater.on('update-available', () => {
			browserWindow.webContents.send('update_available');
		});
		autoUpdater.on('update-downloaded', () => {
			browserWindow.webContents.send('update_downloaded');
		});
	}
}
