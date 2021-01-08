/** @format */

import dotenv from 'dotenv';
import { dialog, IpcMain } from 'electron';
import fs from 'fs';
import is_dev from 'electron-is-dev';
import getLogger from '../Logger';
import path from 'path';
import { app } from 'electron';
import {
	browserWindow,
	getConfig,
	setG14Config,
	setupElectronReload,
} from '../electron';
import validator, { configSchema } from '../Utilities/ConfigValidation';

dotenv.config();

type G14PathType = {
	pathtype: 'Local' | 'Persistent';
	directory: boolean;
};

const LOCAL_CFG = is_dev
	? (process.env.CONFIG_LOC as string)
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'config.oonip'
	  );
let LOGGER = getLogger('ConfigLoader');

const APPDATA_CONFIG = path.join(
	app.getPath('appData'),
	'G14ControlV2',
	'G14ControlV2.json'
);

let FINAL_CFG_LOC = LOCAL_CFG;

const validateConfig = (config: any) => {
	let validateResult = validator.validate(config, configSchema);
	LOGGER.info(
		`Number of validation Errors: ${JSON.stringify(
			validateResult.errors.length
		)}`
	);
	if (validateResult.valid) {
		return true;
	} else {
		return false;
	}
};

export const setUpConfigPath: () => G14PathType = () => {
	let p = path.join(app.getPath('appData'), 'G14ControlV2');
	if (fs.existsSync(p)) {
		let persistent = fs.existsSync(APPDATA_CONFIG);
		if (persistent) {
			return { pathtype: 'Persistent', directory: true };
		} else {
			return { pathtype: 'Local', directory: true };
		}
	}
	return { pathtype: 'Local', directory: false };
};

export const buildPath = async () => {
	let { pathtype, directory } = setUpConfigPath();
	let local = true;
	let persistConfig = true;
	FINAL_CFG_LOC = LOCAL_CFG;
	if (!directory) {
		let result = await new Promise<boolean>((resolve) => {
			fs.mkdir(path.join(app.getPath('appData'), 'G14ControlV2'), (err) => {
				if (err) {
					LOGGER.error(
						`Error creating directory for persistent config:\n${JSON.stringify(
							err,
							null,
							2
						)}`
					);
					resolve(false);
				} else {
					LOGGER.info(`Successfully created G14Control directory in appdata.`);
					resolve(true);
				}
			});
		});
		local = result;
	}
	if (pathtype === 'Local' && local) {
		let config = JSON.parse((await loadConfig()).toString()) as G14Config;
		let file = Buffer.from(JSON.stringify(config), 'utf-8');
		let result = await new Promise<boolean>((resolve) => {
			fs.writeFile(
				APPDATA_CONFIG,
				file,
				{ encoding: 'utf8', flag: 'w+' },
				(err) => {
					if (err) {
						LOGGER.error(
							`Error writing persistent configuration:\n${JSON.stringify(
								err,
								null,
								2
							)}`
						);
						resolve(false);
					} else {
						LOGGER.info(
							'Successfully wrote configuration data to persistent configuration file.'
						);
						resolve(true);
					}
				}
			);
		});
		persistConfig = result;
	}
	if (persistConfig) {
		LOGGER.info('Persistent configuration exists.');
		FINAL_CFG_LOC = APPDATA_CONFIG;
		let config = JSON.parse((await loadConfig()).toString()) as G14Config;
		let validated = validateConfig(config);
		if (!validated) {
			LOGGER.error('Initial config could not be validated.');
			FINAL_CFG_LOC = LOCAL_CFG;
			let configValid = JSON.parse(
				(await loadConfig()).toString()
			) as G14Config;
			FINAL_CFG_LOC = APPDATA_CONFIG;
			await writeConfig(configValid);
			configValid = JSON.parse((await loadConfig()).toString()) as G14Config;
			let ok = validateConfig(configValid);
			if (ok) {
				LOGGER.info('Successfully fixed broken config file.');
			} else {
				LOGGER.error('Failed to fix configuration.');
				dialog.showErrorBox(
					'Configuration Error',
					'Both local and appdata configuration could not be validated, please reinstall G14ControlV2 to fix.'
				);
			}
		}
	}

	let ok = persistConfig && local;
	if (ok) {
		LOGGER.info('Using appdata persistent config.');
		FINAL_CFG_LOC = APPDATA_CONFIG;
		let config = JSON.parse(
			((await loadConfig()) as Buffer).toString()
		) as G14Config;
		validateConfig(config);
	} else {
		LOGGER.info('Using local config.');
		FINAL_CFG_LOC = LOCAL_CFG;
	}
};

export const tryWriteNewConfig = (config: Buffer) => {
	// let conf = JSON.parse(config.toString()) as G14Config;
	// fs.writeFile(FINAL_CFG_LOC, JSON.stringify(conf), 'utf-8', (err) => {
	// 	if (err) {
	// 		LOGGER.info("Couldn't write to new config file: " + err);
	// 	} else {
	// 		LOGGER.info('Wrote successfully.');
	// 	}
	// });
};

export const loadConfig = async () => {
	if (!FINAL_CFG_LOC) {
		LOGGER.error('config.json location undefined.' + FINAL_CFG_LOC);

		return false;
	} else {
		LOGGER.info(`Loading config from:\n[${FINAL_CFG_LOC}]`);
	}
	return new Promise((resolve, reject) => {
		fs.readFile(FINAL_CFG_LOC, (err, data) => {
			if (err) {
				LOGGER.info(
					`Error reading file: ${FINAL_CFG_LOC}.\n ${JSON.stringify(err)}`
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
		fs.writeFile(FINAL_CFG_LOC, JSON.stringify(config), (err) => {
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

export const buildConfigLoaderListeners = async (ipc: IpcMain) => {
	ipc.handle('loadConfig', async (_event, _args) => {
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
	ipc.handle('saveConfig', async (_event, config: G14Config) => {
		LOGGER.info('Attempting to save config.');
		setG14Config(config);
		let result = writeConfig(config);
		if (result) {
			return true;
		} else {
			return false;
		}
	});

	ipc.on('importConfig', () => {
		dialog
			.showOpenDialog({
				title: 'Load Config',
				defaultPath: app.getPath('home'),
				properties: ['openFile'],
				filters: [{ name: 'G14Config', extensions: ['datas'] }],
			})
			.then((val) => {
				if (val.canceled) {
					return;
				}
				if (val.filePaths && val.filePaths.length > 0) {
					let path2file = val.filePaths[0];
					fs.readFile(path2file, 'utf-8', (err, datas) => {
						if (err) {
							LOGGER.error('Error importing config file.');
						} else {
							LOGGER.info('Successfully read config file.');
							writeConfig(JSON.parse(datas) as G14Config).then((ok) => {
								if (ok) {
									browserWindow.reload();
									setupElectronReload(JSON.parse(datas) as G14Config);
								} else {
									LOGGER.info('Issue writing new configuration file.');
								}
							});
						}
					});
				}
			});
	});

	ipc.on('exportConfig', () => {
		dialog
			.showOpenDialog({
				title: 'Save Config',
				defaultPath: app.getPath('home'),
				properties: ['openDirectory'],
			})
			.then((val) => {
				if (val.canceled) {
					return;
				}
				if (val.filePaths) {
					let dir = val.filePaths[0];
					fs.writeFile(
						path.join(dir, 'G14Config.datas'),
						JSON.stringify(getConfig()),
						(e) => {
							if (e) {
								LOGGER.error(
									'Error writing config to directory: \n' + JSON.stringify(e)
								);
							} else {
								LOGGER.info('Successfully exported config file.');
							}
						}
					);
				}
			});
	});
};
