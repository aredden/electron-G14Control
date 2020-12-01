/** @format */

import { app, BrowserWindow } from 'electron';
import perfmon from 'perfmon';
import { tray } from '../../electron';
import getLogger from '../../Logger';

const LOGGER = getLogger('Perfmon');

export const buildPerfmonThermalProcess = (win: BrowserWindow) => {
	let perf = perfmon(
		[
			// '\\processor(_total)\\% processor time',
			'\\Thermal Zone Information(*)\\High Precision Temperature',
			'\\Power Meter(_Total)\\Power',
		],
		(err: any, data: any) => {
			if (!err) {
				let highPrecisionTemp =
					data.counters[
						'\\Thermal Zone Information(*)\\High Precision Temperature'
					];
				let resultingTemp = highPrecisionTemp / 10 - 275.15;
				if (resultingTemp > -100) {
					win.webContents.send('cpuTemperature', resultingTemp);
				}
				let discharge = data.counters['\\Power Meter(_Total)\\Power'];
				if (discharge > 0) {
					win.webContents.send('dischargeRate', discharge);
				}
			} else {
				LOGGER.info(
					`ERROR getting info from perfmon.js\n${JSON.stringify(err, null, 2)}`
				);
			}
		}
	);
	return perf;
};
