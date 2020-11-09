/** @format */

import dotenv from 'dotenv';
import { IpcMain } from 'electron';
import fs from 'fs';
import getLogger from '../Logger';
dotenv.config();

let LOGGER = getLogger('ConfigLoader');

let location = process.env.CONFIG_LOC;

export const loadConfig = async () => {
	if (!location) {
		LOGGER.error('config.json location undefined.' + location);

		return false;
	}
	return new Promise((resolve, reject) => {
		fs.readFile(location, (err, data) => {
			if (err) {
				LOGGER.info(
					`Error reading file: ${location}.\n ${JSON.stringify(err)}`
				);
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
};

export const writeConfig = async (config: object) => {
	return new Promise((resolve) => {
		fs.writeFile(location, JSON.stringify(config, null, 2), (err) => {
			LOGGER.error(`Problem writing to config.json file.`);
			if (err) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
};

export const buildConfigLoaderListeners = (ipc: IpcMain) => {
	ipc.handle('loadConfig', async (event, args) => {
		let config = await loadConfig();
		if (config) {
			return (config as Buffer).toString('utf-8');
		} else {
			return false;
		}
	});
	ipc.handle('saveConfig', async (event, config: object) => {
		LOGGER.info('Attempting to save config.');
		let result = writeConfig(config);
		if (result) {
			return true;
		} else {
			return false;
		}
	});
};
