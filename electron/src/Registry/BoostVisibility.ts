/** @format */

import is_dev from 'electron-is-dev';
import path from 'path';
import { app } from 'electron';
import { exec } from 'child_process';
import getLogger from '../Logger';
import isAdmin from 'is-admin';
const LOGGER = getLogger('BoostVisibility');

const BOOST_VIS_CHG = is_dev
	? path.join(__dirname, '../../src/Registry', 'RegistryChecker.exe')
	: path.join(app.getPath('exe'), '../', 'resources', 'extraResources', 'RegistryChecker.exe');

export const checkBoostVisibility = async (): Promise<boolean> => {
	let admin = await isAdmin();

	if (!admin) {
		return true;
	}

	return new Promise((resolve, reject) => {
		let proc = exec(`cmd /c "${BOOST_VIS_CHG}" check`);
		proc.stdout.on('data', (data) => {
			LOGGER.info(`RegistryChecker result: ${data}`);
			if (data && data.indexOf('True') !== -1) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
		proc.stderr.on('data', (err) => {
			LOGGER.info(`${__dirname}\nError from RegistryChanger.exe ${err}`);
			reject(err);
		});
	});
};

export const enableVisibility = async () => {
	return new Promise((resolve) => {
		let proc = exec(`cmd /c "${BOOST_VIS_CHG}" modify`);
		proc.stdout.on('data', (data) => {
			LOGGER.info(`\n${BOOST_VIS_CHG}\nRegistryChecker modification result: ${data}`);
			resolve(true);
		});
		proc.stderr.on('data', (err) => {
			LOGGER.info(`${__dirname}\nError from RegistryChanger.exe ${err}`);
			resolve(false);
		});
	});
};
