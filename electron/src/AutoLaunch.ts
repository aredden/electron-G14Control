/** @format */

import { app } from 'electron';
import getLogger from './Logger';
import path from 'path';
import fs from 'fs';

const LOGGER = getLogger('AutoLaunch');

export const setAutoLaunch = async (enabled: boolean) => {
	return new Promise((resolve) => {
		const exeName = path.basename(process.execPath);
		let userPath = app.getPath('appData');
		let filePath = path.join(
			userPath,
			'Microsoft\\Windows\\Start Menu\\Programs\\Startup\\G14ControlV2.bat'
		);
		fs.writeFile(
			filePath,
			`${
				enabled
					? `start /d ${`"${path.join(process.execPath, '../')}" ${exeName}`}`
					: ''
			}`,
			function (err) {
				if (err) {
					LOGGER.error(`Error writing batch file to enable startup. ${err}`);
					resolve(false);
				} else {
					LOGGER.info('Startup modification completed.');
					resolve(true);
				}
			}
		);
	});
};
