/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import { getBiosCpu, getSoftware } from './ComputerInfo';
export const buildStatusListeners = (ipc: IpcMain, win: BrowserWindow) => {
	ipc.handle('getCpuBiosInfo', async (_evt) => {
		let map = await getBiosCpu();
		return map;
	});
	ipc.handle('getAsusPrograms', async (_evt) => {
		let map = await getSoftware();
		return map;
	});
};
