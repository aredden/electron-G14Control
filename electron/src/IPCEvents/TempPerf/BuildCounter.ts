/** @format */

import * as cp from 'child_process';
import { BrowserWindow } from 'electron';
import { isNull } from 'lodash';
import getLogger from '../../Logger';

let LOGGER = getLogger('BuildCounter');

export const spawnTypePerfThermalProcess = (window: BrowserWindow) => {
	let baby = cp.spawn(
		`typeperf "\\Thermal Zone Information(*)\\High Precision Temperature"`,
		{
			shell: true,
			detached: false,
			windowsHide: true,
			windowsVerbatimArguments: true,
			cwd: '',
		}
	);
	baby.stdout.on('readable', () => {
		let buff = baby.stdout.read() as Buffer;
		if (!isNull(buff)) {
			let value = buff.toString();
			value = value.replaceAll(/"|,/gm, '');
			let matched = value.match(/[0-9]{4}\.[0-9]{0,5}/);
			if (!isNull(matched)) {
				window.webContents.send(
					'cpuTemperature',
					parseInt(matched[0]) / 10 - 276.15
				);
			}
		}
	});
	baby.on('close', () => {
		LOGGER.info('Temperature TypePerf process closed..');
	});
	baby.on('message', (message: string) => {
		LOGGER.info(message);
	});
	return baby;
};
