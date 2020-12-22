/** @format */

import { BrowserWindow, IpcMain } from 'electron';

export type PowerSwitchArgs = {
	enabled: boolean;
	acPlan: string;
	dcPlan: string;
};

export const buildAutoPowerSwitchingListeners = (
	win: BrowserWindow,
	ipc: IpcMain
) => {
	ipc.handle('setAutoPowerSwitching', (evt, args: PowerSwitchArgs) => {});
};
