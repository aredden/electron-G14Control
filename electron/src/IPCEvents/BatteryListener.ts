/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { setBatteryLimiter, whichCharger } from './WMI/HardwareControl';
import getLogger from '../Logger';

const LOGGER = getLogger('BatteryListener');

export const buildBatterySaverListener = (win: BrowserWindow, ipc: IpcMain) => {
	ipc.handle('setBatteryLimiter', async (event, value: number) => {
		let modified = await setBatteryLimiter(value);
		if (modified) {
			return true;
		} else {
			return false;
		}
	});

	ipc.handle('isPlugged', async (event) => {
		let plugType = await whichCharger();
		return plugType;
	});
};
