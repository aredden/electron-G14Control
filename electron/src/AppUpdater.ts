/** @format */

import { autoUpdater, Provider, NsisUpdater } from 'electron-updater';
import { FeedURLOptions } from 'electron/main';
import getLogger from './Logger';

export default class AppUpdater {
	constructor() {
		autoUpdater.setFeedURL('https://github.com/aredden/electron-g14control');
		const LOGGER = getLogger('AppUpdater');
		autoUpdater.logger = LOGGER;
		autoUpdater.checkForUpdatesAndNotify();
	}
}
