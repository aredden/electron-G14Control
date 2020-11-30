/** @format */

import { BrowserWindow } from 'electron';
import perfmon from 'perfmon';
import getLogger from '../../Logger';

const LOGGER = getLogger('Perfmon');

export const buildPerfmonThermalProcess = (win: BrowserWindow) => {
	let perf = perfmon(
		[
			'\\processor(_total)\\% processor time',
			'\\Thermal Zone Information(*)\\High Precision Temperature',
		],
		(err: any, data: any) => {
			if (!err) {
				win.webContents.send(
					'cpuTemperature',
					data.counters[
						'\\Thermal Zone Information(*)\\High Precision Temperature'
					] /
						10 -
						275.15
				);
			} else {
				LOGGER.info(`ERROR getting info from perfmon.js\n${err}`);
			}
		}
	);
	return perf;
};
