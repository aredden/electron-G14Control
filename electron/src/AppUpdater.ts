/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { autoUpdater, AppUpdater, UpdateInfo } from 'electron-updater';
import getLogger from './Logger';

import is_dev from 'electron-is-dev';
interface Updater {}

const LOGGER = getLogger('AppUpdater');
export default class AutoUpdater<Updater> {
	state: {
		updater: AppUpdater;
		updateAvailable: boolean;
		version: string;
		updateInfo: UpdateInfo | undefined;
	};

	constructor(browserWindow: BrowserWindow, ipc: IpcMain) {
		this.state = {
			updater: autoUpdater,
			updateAvailable: false,
			version: '',
			updateInfo: undefined,
		};
		let { updater } = this.state;

		updater.autoDownload = true;
		updater.autoInstallOnAppQuit = true;
		updater.allowPrerelease = true;

		ipc.on('exitAndUpdate', this.quitAndUpdate);
		LOGGER.info('Updater Initialized.');
		updater.on('update-available', (event: UpdateInfo) => {
			this.state.updateAvailable = true;
			this.state.updateInfo = event;
			browserWindow.webContents.send('updateAvailable', event);
		});
		updater.on('update-downloaded', (event) => {
			browserWindow.webContents.send('updateDownloaded');
		});
	}

	checkForUpdate = async () => {
		LOGGER.info('Checking for update.');
		let { updater } = this.state;
		if (!is_dev) {
			updater
				.checkForUpdatesAndNotify({
					title: 'G14ControlV2',
					body: 'New update available!',
				})
				.then((r) => {
					if (r) {
						this.state.version = r.updateInfo.version;
						this.state.updateAvailable = true;
						this.state.updateInfo = r.updateInfo;
						LOGGER.info(`Got update info:\n${JSON.stringify(r.updateInfo, null, 2)}`);
					} else {
						LOGGER.info('Current update info: ' + JSON.stringify(r, null, 2));
					}
				});
		}
	};

	getAllInfo = () => {
		LOGGER.info('App requested all information.');
		return this.state.updateInfo;
	};

	updateIsAvailable = () => {
		LOGGER.info('App asking if update available.');
		return this.state.updateAvailable;
	};

	mostRecentVersion = () => {
		LOGGER.info('App asking for updated version');
		return this.state.version;
	};

	downloadUpdate = () => {
		let { updater } = this.state;
		updater.downloadUpdate();
	};

	quitAndUpdate = () => {
		LOGGER.info('Initializing "quit and update"');
		let { updater } = this.state;
		updater.quitAndInstall();
	};
}
