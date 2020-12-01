/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import {
	isPluggedIn,
	setBatteryLimiter,
	whichCharger,
} from './WMI/HardwareControl';
import getLogger from '../Logger';

const LOGGER = getLogger('BatteryListener');

export const buildBatterySaverListener = (win: BrowserWindow, ipc: IpcMain) => {
	ipc.on('setBatteryLimiter', async (event, value: number) => {
		let modified = await setBatteryLimiter(value);
		if (modified) {
			return true;
		} else {
			return false;
		}
	});

	whichCharger().then((value) => {
		LOGGER.info('hokk');
	});

	ipc.on('isPlugged', async (event) => {
		let plugged = await isPluggedIn();
		if (!plugged) {
			let plugType = await whichCharger();
		}
	});
};
