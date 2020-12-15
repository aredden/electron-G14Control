/** @format */

import { app, BrowserWindow, IpcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import getLogger from './Logger';

let LOGGER = getLogger('AutoUpdater');

export default class AppUpdater {
	constructor(browserWindow: BrowserWindow, ipc: IpcMain) {
		const LOGGER = getLogger('AppUpdater');
		autoUpdater.allowPrerelease = true;
		autoUpdater
			.checkForUpdatesAndNotify({
				title: 'G14ControlV2',
				body: 'New updates available!',
			})
			.then((val) => {
				LOGGER.info('gotinfo:\n' + JSON.stringify(val.updateInfo, null, 2));
			});

		autoUpdater.checkForUpdates().then((result) => {
			if (result.updateInfo.version !== app.getVersion()) {
				LOGGER.info(
					`current version: ${app
						.getVersion()
						.replace('v', '')}\nupdated version: ${result.updateInfo.version}`
				);
				browserWindow.webContents.send(
					'updateAvailable',
					result.updateInfo.releaseNotes
				);
			}
		});
		ipc.on('exitAndUpdate', () => {
			autoUpdater.quitAndInstall(false, true);
		});
	}
}
