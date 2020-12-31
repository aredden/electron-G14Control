/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
import { kebabCase } from 'lodash';
import is_dev from 'electron-is-dev';
import path from 'path';
import { app } from 'electron';
dotenv.config();

//@ts-ignore
// eslint-ignore-next-line
const RADJ_LOC = is_dev
	? (process.env.RADJ_LOC as string)
	: path.join(
			app.getPath('exe'),
			'../',
			'resources',
			'extraResources',
			'ryzenadj.exe'
	  );

const LOGGER = getLogger('RyzenADJ');

export const setRyzenadj = (config: RyzenadjConfig) => {
	return new Promise<RyzenadjConfig | false>((resolve) => {
		let radjStr = '';

		Object.keys(config).forEach((value) => {
			if (value !== 'name') {
				let milliwatts = config[value];
				if(milliwatts%1000000===0){
					milliwatts = milliwatts/1000;
				}

				radjStr +=
					//@ts-ignore
					value && config[value]
						? `--${kebabCase(value)} ${milliwatts} `
						: '';
			}
		});
		if (radjStr.length === 0) {
			return false;
		}
		exec(`cmd /c "${RADJ_LOC}" ${radjStr}`, (err, out, stderr) => {
			if (err || stderr) {
				LOGGER.error(
					`Error setting ryzenadj settings: ${JSON.stringify({ err, stderr })}`
				);
				resolve(false);
			} else {
				LOGGER.info(`Result of ryzenADJ command:\n${out}`);
				resolve(config);
			}
		});
	});
};
