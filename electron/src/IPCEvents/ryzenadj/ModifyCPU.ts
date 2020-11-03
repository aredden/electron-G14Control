/** @format */

import { exec } from 'child_process';
import getLogger from '../../Logger';

const RADJ_LOC =
	'C:\\Users\\alexa\\Documents\\G14UI\\g14ui\\electron\\ryzenadj\\ryzenadj.exe';

const LOGGER = getLogger('RyzenADJ');

export const setRyzenadj = (config: RyzenadjConfig) => {
	return new Promise<RyzenadjConfig | false>((resolve) => {
		let radjStr = `${RADJ_LOC} `;
		let {
			stapmLimit,
			fastLimit,
			slowLimit,
			stapmTime,
			slowTime,
			tctlTemp,
		} = config;
		if (stapmLimit) {
			radjStr += `--stapm-limit ${stapmLimit} `;
		}
		if (fastLimit) {
			radjStr += `--fast-limit ${fastLimit} `;
		}
		if (slowLimit) {
			radjStr += `--slow-limit ${slowLimit} `;
		}
		if (stapmTime) {
			radjStr += `--stapm-time ${stapmTime} `;
		}
		if (slowTime) {
			radjStr += `--slow-time ${slowTime} `;
		}
		if (tctlTemp) {
			radjStr += `--tctl-temp ${tctlTemp} `;
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
