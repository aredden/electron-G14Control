/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { loggers } from 'winston';
import { getCoresLoad } from './WMI/CPULoad';
import { getHighPrecisionTemperature } from './WMI/ThermalZone';

export const buildEmitters = (ipc: IpcMain, window: BrowserWindow) => {
	getLoadLoop(window);
	getTempLoop(window);
};

const getTempLoop = (window: BrowserWindow) => {
	setTimeout(async () => {
		let tempresult = await getHighPrecisionTemperature();
		if (tempresult) {
			let temp = tempresult[0]['HighPrecisionTemperature'] / 10 - 276.15;
			window.webContents.send('cpuTemperature', temp);
		}
		getTempLoop(window);
	}, 8000);
};

const getLoadLoop = (window: BrowserWindow) => {
	setTimeout(async () => {
		let loadResult = await getCoresLoad();
		if (loadResult) {
			window.webContents.send('coresLoad', loadResult);
		}
		getLoadLoop(window);
	}, 8000);
};
