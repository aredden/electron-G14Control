/** @format */

import { autoUpdater } from 'electron-updater';
import getLogger from './Logger';

export default class AppUpdater {
	constructor() {
		autoUpdater.setFeedURL('https://github.com/aredden/electron-g14control');
		const LOGGER = getLogger('AppUpdater');
		autoUpdater.logger = LOGGER;
		autoUpdater.checkForUpdatesAndNotify().then((result) => {
			result.downloadPromise.then((e) => {});
		});
	}
}
