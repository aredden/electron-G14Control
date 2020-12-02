/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import {
	getBiosCpu,
	getDrivers,
	getSoftware,
	refreshAllMaps,
} from './ComputerInfo';
export const buildStatusListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('getCpuBiosInfo', async (_evt) => {
		let map = await getBiosCpu();
		return map;
	});
	ipc.handle('getAsusPrograms', async (_evt) => {
		let map = await getSoftware();
		return map;
	});
	ipc.handle('getDrivers', async () => {
		let map = await getDrivers();
		return map;
	});

	ipc.handle('refreshStatus', async () => {
		refreshAllMaps();
		let cpubios = await getBiosCpu();
		let software = await getSoftware();
		let drivers = await getDrivers();
		return { cpubios, software, drivers };
	});
};
