/** @format */

import { BrowserWindow, IpcMain } from 'electron';
import getLogger from '../Logger';
import {
	getActivePlan,
	getWindowsPlans,
	setWindowsPlan,
} from './powercfg/Powercfg';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LOGGER = getLogger('WindowsPlanListeners');

export const buildWindowsPlanListeners = (
	ipc: IpcMain,
	window: BrowserWindow
) => {
	ipc.handle('getWindowsPlans', async () => {
		let plans = await getWindowsPlans();
		if (plans) {
			return plans;
		} else {
			return false;
		}
	});

	ipc.handle('getActivePlan', async () => {
		let active = await getActivePlan();
		if (active) {
			return active;
		} else {
			return false;
		}
	});

	ipc.on(
		'setWindowsPlan',
		async (_event, datas: { name: string; guid: string }) => {
			let setResult = await setWindowsPlan(datas.guid);
			if (setResult) {
				window.webContents.send('setActivePlanStatus', {
					result: true,
					data: datas,
				});
			} else {
				window.webContents.send('setActivePlanStatus', { result: false });
			}
		}
	);
};
