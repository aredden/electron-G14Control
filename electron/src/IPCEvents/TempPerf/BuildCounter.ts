/** @format */

import * as cp from 'child_process';
import { BrowserWindow } from 'electron';
import { isNull } from 'lodash';
import getLogger from '../../Logger';
import os from 'os';
let LOGGER = getLogger('BuildCounter');

export const spawnTypePerfThermalProcess = (window: BrowserWindow) => {
	let baby = cp.spawn(
		`typeperf "\\Thermal Zone Information(*)\\High Precision Temperature"`,
		{
			shell: true,
			detached: false,
			windowsHide: true,
			windowsVerbatimArguments: true,
			cwd: __dirname,
		}
	);
	os.setPriority(baby.pid, os.constants.priority.PRIORITY_ABOVE_NORMAL);
	baby.stdout.on('readable', () => {
		try {
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
		} catch (err) {
			LOGGER.info('Error reading from stdout.' + JSON.stringify({ err }));
		}
	});
	baby.on('exit', (e, signal) => {
		if (signal === 'SIGINT') {
			baby.kill('SIGINT');
			baby.kill('SIGINT');
			baby.kill('SIGINT');
			baby.stdout.removeAllListeners();
			baby.removeAllListeners();
		}
		LOGGER.info('Trying to quit.');
	});
	baby.on('error', (err) => {
		LOGGER.error('ERROR: ' + err);
	});
	baby.on('exit', (code, signal) => {
		baby.kill();
		LOGGER.info(
			`Temp Process exited, code ${code}, signal:\n${signal.toString()}`
		);
		baby.removeAllListeners();
	});
	return baby;
};
