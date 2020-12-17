/** @format */

import dotenv from 'dotenv';
import { IpcMain } from 'electron';
import fs from 'fs';
import is_dev from 'electron-is-dev';
import getLogger from '../Logger';
import path from 'path';
import { app } from 'electron';
import { setG14Config } from '../electron';

dotenv.config();

//@ts-ignore
// eslint-ignore-next-line
const location = is_dev
	? (process.env.CONFIG_LOC as string)
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'config.oonip'
	  );
let LOGGER = getLogger('ConfigLoader');

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

export const writeConfig = async (config: G14Config) => {
	return new Promise((resolve) => {
		fs.writeFile(location, JSON.stringify(config), (err) => {
			if (err) {
				LOGGER.error(
					`Problem writing to config.json file. \nError: ${JSON.stringify(err)}`
				);
				resolve(false);
			} else {
				setG14Config(config);
				resolve(true);
			}
		});
	});
};

export const buildConfigLoaderListeners = (ipc: IpcMain) => {
	ipc.handle('loadConfig', async (event, args) => {
		let config = await loadConfig().catch((err) => {
			LOGGER.info(`Error loading config:\n${err}`);
		});
		if (config) {
			let g14conf = JSON.parse((config as Buffer).toString('utf-8'));
			setG14Config(g14conf);
			return (config as Buffer).toString('utf-8');
		} else {
			return false;
		}
	});
	ipc.handle('saveConfig', async (event, config: G14Config) => {
		LOGGER.info('Attempting to save config.');
		setG14Config(config);
		let result = writeConfig(config);
		if (result) {
			return true;
		} else {
			return false;
		}
	});
};
