/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';
import dotenv from 'dotenv';
import { kebabCase } from 'lodash';
dotenv.config();
const RADJ_LOC = process.env.RADJ_LOC;

const LOGGER = getLogger('RyzenADJ');

export const setRyzenadj = (config: RyzenadjConfig) => {
	return new Promise<RyzenadjConfig | false>((resolve) => {
		let radjStr = '';

		Object.keys(config).forEach((value) => {
			radjStr +=
				value && config[value] ? `--${kebabCase(value)} ${config[value]} ` : '';
		});
		if (radjStr.length === 0) {
			return false;
		}
		exec(`${RADJ_LOC} ${radjStr}`, (err, out, stderr) => {
			if (err || stderr) {
				LOGGER.info(
					`Error setting ryzenadj settings: ${JSON.stringify({ err, stderr })}`
				);
				resolve(false);
			} else {
				LOGGER.info(`Result of ryzenADJ command:\n${JSON.stringify(out)}`);
				resolve(config);
			}
		});
	});
};
