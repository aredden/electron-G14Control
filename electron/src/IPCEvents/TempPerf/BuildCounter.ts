/** @format */

import * as cp from 'child_process';
import { BrowserWindow } from 'electron';
import { isNull } from 'lodash';
import getLogger from '../../Logger';
import os from 'os';
import { app } from 'electron';
let LOGGER = getLogger('BuildCounter');

export const spawnTypePerfThermalProcess = (window: BrowserWindow) => {
	let baby = cp.spawn(
		`typeperf "\\Thermal Zone Information(*)\\High Precision Temperature"`,
		{
			shell: true,
			detached: false,
			windowsHide: true,
			windowsVerbatimArguments: true,
			cwd: app.getPath('home'),
		}
	);
	if (baby.pid) {
		os.setPriority(baby.pid, os.constants.priority.PRIORITY_ABOVE_NORMAL);
	} else {
		LOGGER.error(
			`TypePerf spwn does not have pid (possible cwd issue): pid:${baby.pid}`
		);
	}
	baby.stdout.on('readable', () => {
		try {
			let buff = baby.stdout.read() as Buffer;
			if (!isNull(buff)) {
				let value = buff.toString();

				value = value.replace(/"|,/gm, '');
				let matched = value.match(/[0-9]{4}\.[0-9]{0,5}/);
				if (!isNull(matched)) {
					let parsedTemp = parseFloat(matched[0]) / 10.0 - 276.15;
					window.webContents.send('cpuTemperature', parsedTemp);
				}
			}
		} catch (err) {
			LOGGER.error('Error reading from stdout.' + JSON.stringify({ err }));
		}
	});
	return baby;
};
